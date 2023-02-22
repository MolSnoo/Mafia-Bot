const settings = include('settings.json');

module.exports.config = {
    name: "dead_moderator",
    description: "Lists all dead players.",
    details: "Lists all dead players.",
    usage: `${settings.commandPrefix}dead\n`
        + `${settings.commandPrefix}died`,
    usableBy: "GameModerator",
    aliases: ["dead", "died"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    var playerList = "Dead players:\n";
    const deadPlayers = game.players.filter(player => player.alive === false);
    if (deadPlayers.length > 0)
        playerList += deadPlayers[0].name;
    for (let i = 1; i < deadPlayers.length; i++)
        playerList += `, ${deadPlayers[i].name}`;
    message.channel.send(playerList);

    return;
};
