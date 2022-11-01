const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

const Player = include(`${settings.dataDir}/Player.js`);

module.exports.config = {
    name: "addplayer_moderator",
    description: "Adds a player to the game.",
    details: "Adds the specified member to the game as a player. Note that the member must have the Eligible to Play role in order to be added to the game.",
    usage: `${settings.commandPrefix}addplayer cody\n`
        + `${settings.commandPrefix}add tori`,
    usableBy: "Moderator",
    aliases: ["addplayer", "add"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) {
        message.reply("You need to specify a member. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    // Make sure that the amount of players is enough
    if (game.maxPlayers && game.maxPlayers <= game.players.length)
        return message.reply("You cannot go over the limit of players.");

    var input = args.join(" ");
    var member = await game.guild.members.fetch({ query: input.toLowerCase(), limit: 1 });
    member = member.first();
    if (!member) return message.reply(`Couldn't find anyone on the server named "${input}".`);
    // Make sure the member has the eligible role.
    if (!member.roles.cache.find(role => role.id === settings.eligibleRole)) return message.reply(`${member.displayName} does not have the Eligible to Play role and cannot play.`);
    // Make sure the member is not already playing.
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].id === member.id)
            return message.reply(`${member.displayName} is already playing.`);
    }

    // Add the member to the players list and give them the player role.
    var player = new Player(member.id, member, member.displayName, true, "");
    game.players.push(player);
    member.roles.add(settings.playerRole);
    

    var channel;
    if (settings.debug) channel = game.guild.channels.cache.get(settings.testingChannel);
    else channel = game.guild.channels.cache.get(settings.generalChannel);
    channel.send(`<@${member.id}> joined the game!`);

    if (game.maxPlayers && game.maxPlayers == game.players.length) {
        clearTimeout(game.halfTimer);
        clearTimeout(game.endTimer);
        game.halfTimer = null;
        game.endTimer = null;

        game.canJoin = false;

        const playerRole = game.guild.roles.cache.find(role => role.id === settings.playerRole);
        channel.send(`${playerRole}, The current game is at full capacity and cannot accept anymore players! The game will begin once the moderator is ready. Please use the .spectate command to watch the game`);

        saveLoader.save(game);
        return;
    }

    // Save the game.
    saveLoader.save(game);
    return;
};
