const { loadGames, save } = require("../Modules/saveLoader");

const settings = include('settings.json');

module.exports.config = {
    name: "spectate_eligible",
    description: "Allows you to spectate a game.",
    details: "Adds you to the list of spectators for the current game.",
    usage: `${settings.commandPrefix}spectate`,
    usableBy: "Eligible",
    aliases: ["spectate"]
};

module.exports.run = async (bot, game, message, args) => {
    var games = await loadGames(bot.guilds.cache.first());
    const gameNumber = args[0] ?? games.find(x => x.inProgress).gameNumber;


    game = games.find(x => x.gameNumber == gameNumber);

    for (let i = 0; i < game.players.length; i++) {
        if (message.author.id === game.players[i].id)
            return message.reply("You are already playing in game " + gameNumber);
    }

    for (let i = 0; i < game.spectators.length; i++)
        if (message.author.id === game.spectators[i].id)
            return message.reply("You are already spectating in game " + gameNumber);

    if (!game.inProgress) return message.reply("Game " + gameNumber + " is not currently in progress");
            

    const member = await game.guild.members.fetch(message.author.id);
    game.spectators.push({ id: message.author.id, member: member, name: member.displayName });
    member.roles.add(game.SpectatorRole);
    save(game);
    message.channel.send(`<@${message.author.id}> began spectating game ${gameNumber}!`);

    return;
};
