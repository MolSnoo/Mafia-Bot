const { createGame } = require("../Modules/gameCreator");

const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);
const discord = require('discord.js');
const { save, loadGames } = require("../Modules/saveLoader");

module.exports.config = {
    name: "startgame_moderator",
    description: "Starts a game.",
    details: 'Starts a new game. You must specify a timer using either hours (h) or minutes (m). '
        + 'During this time, any players with the Eligible to Play role will be able to join using the play command, '
        + 'at which point they will be given the Player role. When the timer reaches 0, '
        + 'the game data will be saved and players will no longer be able to join unless you use the add command. '
        + 'You may also place at the end #p, 15p, to add a max limit for 15 players.',
    usage: `${settings.commandPrefix}startgame 24h\n`
        + `${settings.commandPrefix}start 0.25m\n` 
        + `${settings.commandPrefix} start 24h 15p`,

    usableBy: "Moderator",
    aliases: ["startgame", "start"],
    requiresGame: false
};


/**
 *
 *
 * @param {discord.Client} bot
 * @param {*} game
 * @param {*} message
 * @param {*} command
 * @param {*} args
 * @return {*} 
 */
module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) return message.reply("Remember to specify how long players have to join!");

    const guild = bot.guilds.cache.first();
    game = await createGame(bot, message.author);

    const timeInt = args[0].substring(0, args[0].length - 1);
    if (isNaN(timeInt) || (!args[0].endsWith('m') && !args[0].endsWith('h')))
        return message.reply("Couldn't understand your timer. Must be a number followed by 'm' or 'h'.");


    // Set max players if requested
    if (args[1] && args[1].endsWith('p') && !isNaN(args[1].split('p')[0]))
        game.maxPlayers = args[1].split('p')[0];
    else if (args[1] && (!args[1].endsWith('p') || isNaN(args[1].split('p')[0])))
        return message.reply("Couldn't understand the number of players. Must be a number followed by 'p'");

    var channel;
    if (settings.debug) channel = guild.channels.cache.get(settings.testingChannel);
    else channel = guild.channels.cache.get(settings.generalChannel);

    var time;
    var halfTime;
    var interval;
    if (args[0].endsWith('m')) {
        // Set the time in minutes.
        time = timeInt * 60000;
        halfTime = time / 2;
        interval = "minutes";
    }
    else if (args[0].endsWith('h')) {
        // Set the time in hours.
        time = timeInt * 3600000;
        halfTime = time / 2;
        interval = "hours";
    }

    game.halfTimer = setTimeout(function () {
        channel.send(`${timeInt / 2} ${interval} remaining to join the game. Use ${settings.commandPrefix}play ${game.gameNumber} to join!`);
    }, halfTime);

    game.endTimer = setTimeout(async function () {
        var games = await loadGames(bot.guilds.cache.first());
        game = games.find(x => x.gameCategory === game.gameCategory);
        game.canJoin = false;
        game.inProgress = true;
        const playerRole = game.guild.roles.cache.find(role => role.id === game.PlayerRole);
        channel.send(`${playerRole}, time's up! The game will begin once the moderator is ready.`);

        saveLoader.save(game);
    }, time);


    game.inProgress = true;
    game.canJoin = true;

    var savedGame = game;
    savedGame.halfTimer = null;
    savedGame.endTimer = null;
    save(savedGame);

    var command = `play or ${settings.commandPrefix}play 1`;

    if (game.gameNumber !== 1)
        command = `play ${game.gameNumber}`;

    let announcement = `${message.member.displayName} has started a game. You have ${timeInt} ${interval} to join the game with ${settings.commandPrefix}${command}`;
    if (game.maxPlayers)
        announcement += `\nThere is a capacity of ${game.maxPlayers} players so join quickly!`;
    channel.send(announcement);

    if (settings.debug) message.channel.send("Started game in debug mode.");
    else message.channel.send("Started game.");

    return;
};
