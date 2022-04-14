const settings = include('settings.json');

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

    const member = await game.guild.members.fetch(message.author.id);
    if (member.displayName.includes(' ')) return message.reply("You cannot join the game with a space in your nickname. Please change your nickname by editing your server profile before joining the game.");
    var player = new Player(message.author.id, member, member.displayName, true, "");
    game.players.push(player);
    member.roles.add(settings.playerRole);
    message.channel.send(`<@${message.author.id}> joined the game!`);

    return;
};
