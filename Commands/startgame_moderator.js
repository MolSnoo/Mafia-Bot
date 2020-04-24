const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "startgame_moderator",
    description: "Starts a game.",
    details: 'Starts a new game. You must specify a timer using either hours (h) or minutes (m). '
        + 'During this time, any players with the Eligible to Play role will be able to join using the play command, '
        + 'at which point they will be given the Player role. When the timer reaches 0, '
        + 'the game data will be saved and players will no longer be able to join unless you use the add command.',
    usage: `${settings.commandPrefix}startgame 24h\n`
        + `${settings.commandPrefix}start 0.25m`,
    usableBy: "Moderator",
    aliases: ["startgame", "start"],
    requiresGame: false
};

module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) return message.reply("remember to specify how long players have to join!");
    if (game.inProgress) return message.reply("there is already a game running.");

    const timeInt = args[0].substring(0, args[0].length - 1);
    if (isNaN(timeInt) || (!args[0].endsWith('m') && !args[0].endsWith('h')))
        return message.reply("couldn't understand your timer. Must be a number followed by 'm' or 'h'.");

    var channel;
    if (settings.debug) channel = game.guild.channels.get(settings.testingChannel);
    else channel = game.guild.channels.get(settings.generalChannel);

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
        channel.send(`${timeInt / 2} ${interval} remaining to join the game. Use ${settings.commandPrefix}play to join!`);
    }, halfTime);

    game.endTimer = setTimeout(function () {
        game.canJoin = false;
        const playerRole = game.guild.roles.find(role => role.id === settings.playerRole);
        channel.send(`${playerRole}, time's up! The game will begin once the moderator is ready.`);

        saveLoader.save(game);
    }, time);

    game.inProgress = true;
    game.canJoin = true;
    let announcement = `${message.member.displayName} has started a game. You have ${timeInt} ${interval} to join the game with ${settings.commandPrefix}play.`;
    channel.send(announcement);

    if (settings.debug) message.channel.send("Started game in debug mode.");
    else message.channel.send("Started game.");

    return;
};
