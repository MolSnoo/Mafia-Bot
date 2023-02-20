const settings = include('settings.json');
const fs = require('fs');

const Player = include(`${settings.dataDir}/Player.js`);
const Spectator = include(`${settings.dataDir}/Spectator.js`);
const PollEntry = include(`${settings.dataDir}/PollEntry.js`);
const Poll = include(`${settings.dataDir}/Poll.js`);


module.exports.save = function (game) {
    var games = fs.readFileSync(settings.prevGameFileName, 'utf8');
    games = JSON.parse(games);

    var data = game;
    data.guild = null;
    for (let i = 0; i < data.players.length; i++)
        data.players[i].member = null;
    for (let i = 0; i < game.spectators.length; i++)
        data.spectators[i].member = null;
    if (game.poll !== null) {
        // Convert poll to shorter form.
        var entries = [];
        for (let i = 0; i < game.poll.entries.length; i++) {
            const entry = game.poll.entries[i];
            var votes = [];
            for (let j = 0; j < entry.votes.length; j++)
                votes.push(entry.votes[j].id);
            var newEntry = new PollEntry(entry.label);
            newEntry.votes = votes;
            newEntry.voteCount = entry.voteCount;
            newEntry.votesString = entry.votesString;
            entries.push(newEntry);
        }
        var poll = new Poll(game.poll.title, entries);
        poll.timer = null;
        poll.open = game.poll.open;
        poll.message = game.poll.message !== null ? game.poll.message.id : null;
        data.poll = poll;
    }

    games[games.indexOf(games.find(x => x.gameCategory === game.gameCategory))] = data;
    const gamesJson = JSON.stringify(games);
    fs.writeFileSync(settings.prevGameFileName, gamesJson, 'utf8', (err) => {if (err) console.log(err); });

    const gameJson = JSON.stringify(data);
    return new Promise((resolve) => {
        fs.writeFile(settings.savedDataFileName, gameJson, 'utf8', function (err) {
            if (err) return console.log(err);
            resolve();
        });
    });
};

module.exports.loadGames = async function(guild) {
    var games = fs.readFileSync(settings.prevGameFileName, 'utf8');
    games = JSON.parse(games);

    var retGames = [];

    for (var game of games) {
        game.guild = guild;
        retGames.push(await loadAGame(game));
    }

    return retGames;
}

const loadAGame = async function (game) {
    var gameJson = game;

    for (let i = 0; i < gameJson.players.length; i++) {
        game.players[i] = 
            new Player(
                gameJson.players[i].id,
                await game.guild.members.fetch(gameJson.players[i].id),
                gameJson.players[i].name,
                gameJson.players[i].alive,
                gameJson.players[i].team
            )
    }
    for (let i = 0; i < gameJson.spectators.length; i++)
        game.spectators[i] = 
            new Spectator(
                gameJson.spectators[i].id,
                await game.guild.members.fetch(gameJson.spectators[i].id),
                gameJson.spectators[i].name
            )

    // Data has been loaded. Now reassign roles and overrides.
    try {
        if (game.inProgress) {
            for (let i = 0; i < game.players.length; i++) {
                const player = game.players[i];
                const playerRole = game.guild.roles.cache.find(role => role.id === game.PlayerRole);
                const DeadRole = game.guild.roles.cache.find(role => role.id === game.DeadRole);
                if (player.alive) {
                    if (player.member.roles.cache.find(role => role.id === DeadRole.id))
                        player.member.roles.remove(DeadRole).catch();
                    if (!player.member.roles.cache.find(role => role.id === playerRole.id))
                        player.member.roles.add(playerRole).catch();
                }
                else {
                    if (player.member.roles.cache.find(role => role.id === playerRole.id))
                        player.member.roles.remove(game.guild.roles.cache.find(role => role.id === game.PlayerRole)).catch();
                    if (!player.member.roles.cache.find(role => role.id === DeadRole.id))
                        player.member.roles.add(game.guild.roles.cache.find(role => role.id === game.DeadRole)).catch();
                }

                if (player.team === "Mafia 1") game.guild.channels.cache.get(game.mafiaChannel1Channel).permissionOverwrites.create(player.member, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
                else if (player.team === "Mafia 2") game.guild.channels.cache.get(game.mafiaChannel2Channel).permissionOverwrites.create(player.member, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
                else if (player.team === "Lovers") game.guild.channels.cache.get(game.mafiaChannel3Channel).permissionOverwrites.create(player.member, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
            }
            for (let i = 0; i < game.spectators.length; i++)
                game.spectators[i].member.roles.add(settings.spectatorRole).catch();

            // Remake poll.
            if (gameJson.poll !== null) {
                var entries = [];
                for (let i = 0; i < gameJson.poll.entries.length; i++) {
                    const entry = gameJson.poll.entries[i];
                    var votes = [];
                    for (let j = 0; j < entry.votes.length; j++)
                        votes.push(game.players.find(player => player.id === entry.votes[j]));
                    var newEntry = new PollEntry(entry.label);
                    newEntry.votes = votes;
                    newEntry.voteCount = entry.voteCount;
                    newEntry.votesString = entry.votesString;
                    entries.push(newEntry);
                }
                var poll = new Poll(gameJson.poll.title, entries);
                poll.timer = null;
                poll.open = gameJson.poll.open;
                if (gameJson.poll.message !== null)
                    game.guild.channels.cache.get(game.announcementChannel).messages.fetch(gameJson.poll.message).then(message => game.poll.message = message).catch(console.error);
                else game.poll.message = null;
                game.poll = poll;
            }
        }
    }
    catch (e) {console.log("somethnig wrong happened in saving the game")}

    return game;
};


module.exports.load = loadAGame;