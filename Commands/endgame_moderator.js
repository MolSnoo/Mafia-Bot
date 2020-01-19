const settings = include('settings.json');

module.exports.config = {
    name: "endgame_moderator",
    description: "Ends a game.",
    details: 'Ends the game. All players will be removed from whatever room channels they were in. '
        + 'The Player, Dead, and Spectator roles will be removed from all players.',
    usage: `${settings.commandPrefix}endgame`,
    usableBy: "Moderator",
    aliases: ["endgame", "end"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    // Remove all living players from whatever channels they're in.
    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];
        // Revoke read access to any of the mafia channels.
        if (player.team === "Mafia 1") game.guild.channels.get(settings.mafiaChannel1).overwritePermissions(player.member, { VIEW_CHANNEL: null });
        else if (player.team === "Mafia 2") game.guild.channels.get(settings.mafiaChannel2).overwritePermissions(player.member, { VIEW_CHANNEL: null });
        else if (player.team === "Mafia 3") game.guild.channels.get(settings.mafiaChannel3).overwritePermissions(player.member, { VIEW_CHANNEL: null });

        // Remove whatever role is appropriate.
        if (player.alive) player.member.removeRole(settings.playerRole).catch();
        else player.member.removeRole(settings.deadRole).catch();
    }
    // Remove spectator roles.
    for (let i = 0; i < game.spectators.length; i++)
        game.spectators[i].member.removeRole(settings.spectatorRole).catch();

    clearTimeout(game.halfTimer);
    clearTimeout(game.endTimer);

    game.inProgress = false;
    game.canJoin = false;
    game.players.length = 0;
    game.spectators.length = 0;

    var channel;
    if (settings.debug) channel = game.guild.channels.get(settings.testingChannel);
    else channel = game.guild.channels.get(settings.generalChannel);
    channel.send(`${message.member.displayName} ended the game!`);

    return;
};
