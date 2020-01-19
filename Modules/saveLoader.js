﻿const settings = include('settings.json');
const fs = require('fs');

const Player = include(`${settings.dataDir}/Player.js`);
const Spectator = include(`${settings.dataDir}/Spectator.js`);

module.exports.save = function (game) {
    var data = {
        inProgress: game.inProgress,
        canJoin: game.canJoin,
        halfTimer: game.halfTimer,
        endTimer: game.endTimer,
        players: [],
        spectators: []
    };
    for (let i = 0; i < game.players.length; i++)
        data.players.push(new Player(game.players[i].id, null, game.players[i].name, game.players[i].alive, game.players[i].team));
    for (let i = 0; i < game.spectators.length; i++)
        data.spectators.push(new Spectator(game.spectators[i].id, null, game.spectators[i].name));

    const gameJson = JSON.stringify(data);
    return new Promise((resolve) => {
        fs.writeFile(settings.savedDataFileName, gameJson, 'utf8', function (err) {
            if (err) return console.log(err);
            resolve();
        });
    });
};

module.exports.load = function (game) {
    var gameJson = fs.readFileSync(settings.savedDataFileName, 'utf8');
    gameJson = JSON.parse(gameJson);

    game.inProgress = gameJson.inProgress;
    game.canJoin = gameJson.canJoin;
    game.halfTimer = gameJson.halfTimer;
    game.endTimer = gameJson.endTimer;
    for (let i = 0; i < gameJson.players.length; i++) {
        game.players.push(
            new Player(
                gameJson.players[i].id,
                game.guild.members.find(member => member.id === gameJson.players[i].id),
                gameJson.players[i].name,
                gameJson.players[i].alive,
                gameJson.players[i].team
            )
        );
    }
    for (let i = 0; i < gameJson.spectators.length; i++)
        game.spectators.push(
            new Spectator(
                gameJson.spectators[i].id,
                game.guild.members.find(member => member.id === gameJson.spectators[i].id),
                gameJson.spectators[i].name
            )
        );

    // Data has been loaded. Now reassign roles and overrides.
    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];
        if (player.alive) {
            player.member.removeRole(settings.deadRole).catch();
            player.member.addRole(settings.playerRole).catch();
        }
        else {
            player.member.removeRole(settings.playerRole).catch();
            player.member.addRole(settings.deadRole).catch();
        }

        if (player.team === "Mafia 1") game.guild.channels.get(settings.mafiaChannel1).overwritePermissions(player.member, { VIEW_CHANNEL: true });
        else if (player.team === "Mafia 2") game.guild.channels.get(settings.mafiaChannel2).overwritePermissions(player.member, { VIEW_CHANNEL: true });
        else if (player.team === "Mafia 3") game.guild.channels.get(settings.mafiaChannel3).overwritePermissions(player.member, { VIEW_CHANNEL: true });
    }
    for (let i = 0; i < game.spectators.length; i++)
        game.spectators[i].member.addRole(settings.spectatorRole).catch();
};
