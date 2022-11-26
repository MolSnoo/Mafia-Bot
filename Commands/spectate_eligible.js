﻿const settings = include('settings.json');

module.exports.config = {
    name: "spectate_eligible",
    description: "Allows you to spectate a game.",
    details: "Adds you to the list of spectators for the current game.",
    usage: `${settings.commandPrefix}spectate`,
    usableBy: "Eligible",
    aliases: ["spectate"]
};

module.exports.run = async (bot, game, message, args) => {
    for (let i = 0; i < game.players.length; i++) {
        if (message.author.id === game.players[i].id)
            return message.reply("You are already playing.");
    }
    if (game.canJoin) return message.reply("You cannot spectate the game yet. Try this command again when the timer runs out.");

    const member = await game.guild.members.fetch(message.author.id);
    game.players.push({ id: message.author.id, member: member, name: member.displayName });
    // Maybe here is where it's not adding game.spectators? 
    member.roles.add(settings.spectatorRole);
    message.channel.send(`<@${message.author.id}> began spectating the game!`);

    return;
};
