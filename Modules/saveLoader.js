const settings = include('settings.json');
const fs = require('fs');

const Player = include(`${settings.dataDir}/Player.js`);

module.exports.save = function (game) {
    var data = {
        inProgress: game.inProgress,
        canJoin: game.canJoin,
        halfTimer: game.halfTimer,
        endTimer: game.endTimer,
        players: []
    };
    for (let i = 0; i < game.players.length; i++)
        data.players.push(new Player(game.players[i].id, null, game.players[i].name, game.players[i].alive, game.players[i].team));

    const gameJson = JSON.stringify(data);
    return new Promise((resolve) => {
        fs.writeFile(settings.savedDataFileName, gameJson, 'utf8', function (err) {
            if (err) return console.log(err);
            resolve();
        });
    });
};
