const settings = include('settings.json');

const fs = require('fs');

module.exports.save = function (game) {
    const gameJson = JSON.stringify(game);
    return new Promise((resolve) => {
        fs.writeFile(settings.savedDataFileName, gameJson, 'utf8', function (err) {
            if (err) return console.log(err);
            resolve();
        });
    });
};
