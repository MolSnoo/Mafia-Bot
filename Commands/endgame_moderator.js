const { save } = require("../Modules/saveLoader");
const { createGame } = require("../Modules/gameCreator");
const discord = require('discord.js');
var roles = include('settingsJSON/roles.json')
var channels = include('settingsJSON/channels.json');
const fs = require('fs');

const settings = include('settings.json');

module.exports.config = {
    name: "endgame_moderator",
    description: "Ends a game.",
    details: 'Ends the game. All players will be removed from whatever room channels they were in. '
        + 'The Player, Dead, and Spectator roles will be removed from all players.',
    usage: `${settings.commandPrefix}endgame`,
    usableBy: "GameModerator",
    aliases: ["endgame", "end"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    var guild = bot.guilds.cache.first();

    // Remove all living players from whatever channels they're in.
    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];
        // Revoke read access to any of the mafia channels.
        if (player.team === "Mafia 1") game.guild.channels.cache.get(game.mafiaChannel1Channel).permissionOverwrites.create(player.member, { VIEW_CHANNEL: null });
        else if (player.team === "Mafia 2") game.guild.channels.cache.get(game.mafiaChannel2Channel).permissionOverwrites.create(player.member, { VIEW_CHANNEL: null });
        else if (player.team === "Lovers") game.guild.channels.cache.get(game.mafiaChannel3Channel).permissionOverwrites.create(player.member, { VIEW_CHANNEL: null });
    }

    // delete game roles
    for (const role of roles) {
        game.guild.roles.delete(game.guild.roles.cache.find(x => x.id === game[role.name + 'Role']));
        game[role.name + 'Role'] = '';
    }

    for (const channel of channels)
        game.guild.channels.cache.get(game[channel.name + 'Channel']).permissionOverwrites.edit(guild.roles.everyone.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false})

    clearTimeout(game.halfTimer);
    clearTimeout(game.endTimer);

    game.inProgress = false;
    game.canJoin = false;
    game.players.length = 0;
    game.spectators.length = 0;
    game.maxPlayers = null;


    var channel;
    if (settings.debug) channel = game.guild.channels.cache.get(settings.testingChannel);
    else channel = game.guild.channels.cache.get(settings.generalChannel);
    channel.send(`${message.member.displayName} ended game ${game.gameNumber}!`);

    save(game);

    return;
};
