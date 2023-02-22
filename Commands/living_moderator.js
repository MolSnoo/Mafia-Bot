const settings = include('settings.json');

module.exports.config = {
    name: "living_moderator",
    description: "Lists all living players.",
    details: "Lists all living players.",
    usage: `${settings.commandPrefix}living\n`
        + `${settings.commandPrefix}alive`,
    usableBy: "GameModerator",
    aliases: ["living", "alive"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    var playerList = "Living players:\n";
    const livingPlayers = game.players.filter(player => player.alive === true);
    if (livingPlayers.length > 0)
        playerList += livingPlayers[0].name;
    for (let i = 1; i < livingPlayers.length; i++)
        playerList += `, ${livingPlayers[i].name}`;
    message.channel.send(playerList);

    return;
};
