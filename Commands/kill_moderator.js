const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "kill_moderator",
    description: "Makes a player dead.",
    details: "Moves the listed players from the living list to the dead list. Each player will lose their Player role and be given the Dead role. "
        + "Players with the Dead role have permission to see all game channels, so be sure the player is actually supposed to be dead before using this command.",
    usage: `${settings.commandPrefix}kill chris\n`
        + `${settings.commandPrefix}die micah joshua amber devyn veronica`,
    usableBy: "Moderator",
    aliases: ["kill", "die"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) {
        message.reply("you need to specify at least one player. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    // Get all listed players first.
    var players = [];
    for (let i = 0; i < game.players.length; i++) {
        for (let j = 0; j < args.length; j++) {
            if (args[j].toLowerCase() === game.players[i].name.toLowerCase()) {
                players.push(game.players[i]);
                args.splice(j, 1);
                break;
            }
        }
    }
    if (args.length > 0) {
        const missingPlayers = args.join(", ");
        return message.reply(`couldn't find player(s): ${missingPlayers}.`);
    }

    for (let i = 0; i < players.length; i++) {
        players[i].alive = false;
        players[i].member.removeRole(settings.playerRole).catch();
        players[i].member.addRole(settings.deadRole).catch();
    }

    // Save the game.
    saveLoader.save(game);

    message.channel.send("Listed players are now dead.");

    return;
};
