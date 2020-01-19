const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "revive_moderator",
    description: "Brings a player back to life",
    details: "Moves the listed players from the dead list to the living list. Each player will lose their Dead role and be given the Player role. "
        + "If a player has already seen dead chat and other game channels, this command should not be used.",
    usage: `${settings.commandPrefix}revive chris\n`
        + `${settings.commandPrefix}resurrect micah joshua amber devyn veronica`,
    usableBy: "Moderator",
    aliases: ["revive", "resurrect"],
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
        players[i].alive = true;
        players[i].member.removeRole(settings.deadRole).catch();
        players[i].member.addRole(settings.playerRole).catch();
    }

    // Save the game.
    saveLoader.save(game);

    message.channel.send("Listed players are now alive.");

    return;
};
