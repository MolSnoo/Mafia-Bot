const { save, loadGames } = require("../Modules/saveLoader");

const settings = include('settings.json');

const Player = include(`${settings.dataDir}/Player.js`);

module.exports.config = {
    name: "play_eligible",
    description: "Joins a game.",
    details: "Adds you to the list of players for the current game.",
    usage: `${settings.commandPrefix}play`,
    usableBy: "Eligible",
    aliases: ["play", "join"]
};

module.exports.run = async (bot, game, message, args) => {
    var games = await loadGames(bot.guilds.cache.first());

    if (args.length !== 0) {
        game = games.find(x => x.gameNumber == args[0]);
        if (!game)
            return message.reply("I could not find that game, please try again with a different game number")
    }
    else {
        game = games.find(x => x.canJoin);
        if (!game)
            return message.reply("I could not find an open game, please try again");
    }

    if (!game.canJoin) return message.reply("You were too late to join this game. Contact a moderator to be added before the game starts.");

    for (let i = 0; i < game.players.length; i++) {
        if (message.author.id === game.players[i].id)
            return message.reply("You are already playing in this game.");
    }

    const member = await game.guild.members.fetch(message.author.id);
    if (member.displayName.includes(' ')) return message.reply("You cannot join the game with a space in your nickname. Please contact a capo to change your server nickname");
    var player = new Player(message.author.id, member, member.displayName, true, "");
    game.players.push(player);
    member.roles.add(game.PlayerRole);
    message.channel.send(`<@${message.author.id}> joined game ${game.gameNumber}!`);


    if (game.maxPlayers && game.maxPlayers == game.players.length) {
        clearTimeout(game.halfTimer);
        clearTimeout(game.endTimer);
        game.halfTimer = null;
        game.endTimer = null;

        game.canJoin = false;

        var channel;
        if (settings.debug) channel = game.guild.channels.cache.get(settings.testingChannel);
        else channel = game.guild.channels.cache.get(settings.generalChannel);

        const playerRole = game.guild.roles.cache.find(role => role.id === game.PlayerRole);
        channel.send(`${playerRole}, The game is at full capacity and cannot accept anymore players! The game will begin once the moderator is ready. Please use the .spectate command to watch the game`);

        save(game);
    }
    else if (game.maxPlayers)
        message.channel.send(`There are ${game.maxPlayers - game.players.length} spots left in this game! Join quickly!`)
    save(game);

    return;
};
