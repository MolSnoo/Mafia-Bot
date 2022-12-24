const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);


const Player = include(`${settings.dataDir}/Player.js`);

module.exports.config = {
    name: "play_eligible",
    description: "Joins a game.",
    details: "Adds you to the list of players for the current game.",
    usage: `${settings.commandPrefix}play`,
    usableBy: "Eligible",
    aliases: ["play"]
};

module.exports.run = async (bot, game, message, args) => {
    for (let i = 0; i < game.players.length; i++) {
        if (message.author.id === game.players[i].id)
            return message.reply("You are already playing.");
    }

    if (!game.canJoin) return message.reply("You were too late to join the game. Contact a moderator to be added before the game starts.");

    // Check whether they are in a game

    const member = await game.guild.members.fetch(message.author.id);
    if (member.displayName.includes(' ')) return message.reply("You cannot join the game with a space in your nickname. Please change your nickname by editing your server profile before joining the game.");
    var player = new Player(message.author.id, member, member.displayName, true, "");
    game.players.push(player);
    member.roles.add(settings.playerRole);
    message.channel.send(`<@${message.author.id}> joined the game!`);


    if (game.maxPlayers && game.maxPlayers == game.players.length) {
        clearTimeout(game.halfTimer);
        clearTimeout(game.endTimer);
        game.halfTimer = null;
        game.endTimer = null;

        game.canJoin = false;

        var channel;
        if (settings.debug) channel = game.guild.channels.cache.get(settings.testingChannel);
        else channel = game.guild.channels.cache.get(settings.generalChannel);

        const playerRole = game.guild.roles.cache.find(role => role.id === settings.playerRole);
        channel.send(`${playerRole}, The current game is at full capacity and cannot accept anymore players! The game will begin once the moderator is ready. Please use the .spectate command to watch the game`);

        saveLoader.save(game);
    }

    return;
};
