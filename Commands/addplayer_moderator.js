const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

const Player = include(`${settings.dataDir}/Player.js`);

module.exports.config = {
    name: "addplayer_moderator",
    description: "Adds a player to the game.",
    details: "Adds the specified member to the game as a player. Note that the member must have the Eligible to Play role in order to be added to the game.",
    usage: `${settings.commandPrefix}addplayer cory\n`
        + `${settings.commandPrefix}add tori`,
    usableBy: "Moderator",
    aliases: ["addplayer", "add"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) {
        message.reply("you need to specify a member. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    var input = args.join(" ");
    var member = game.guild.members.find(member => member.displayName.toLowerCase() === input.toLowerCase());
    if (!member) return message.reply(`couldn't find anyone on the server named "${input}".`);
    // Make sure the member has the eligible role.
    if (!member.roles.find(role => role.id === settings.eligibleRole)) return message.reply(`${member.displayName} does not have the Eligible to Play role and cannot play.`);
    // Make sure the member is not already playing.
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].id === member.id)
            return message.reply(`${member.displayName} is already playing.`);
    }

    // Add the member to the players list and give them the player role.
    var player = new Player(member.id, member, member.displayName, true, "");
    game.players.push(player);
    member.addRole(settings.playerRole);
    
    // Save the game.
    saveLoader.save(game);

    var channel;
    if (settings.debug) channel = game.guild.channels.get(settings.testingChannel);
    else channel = game.guild.channels.get(settings.generalChannel);
    channel.send(`<@${member.id}> joined the game!`);

    return;
};
