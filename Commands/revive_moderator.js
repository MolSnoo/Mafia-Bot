const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "revive_moderator",
    description: "Brings a player back to life",
    details: "Moves the listed players from the dead list to the living list. Each player will lose their Dead role and be given the Player role. "
        + "If a player has already seen dead chat and other game channels, this command should not be used.",
    usage: `${settings.commandPrefix}revive chris\n`
        + `${settings.commandPrefix}resurrect micah joshua amber devyn veronica`,
    usableBy: "GameModerator",
    aliases: ["revive", "resurrect"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) {
        message.reply("You need to specify at least one player. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    var guild = bot.guilds.cache.first();

    // Get all listed players first.
    var players = [];
    if (args[0].toLowerCase() !== 'dead') {
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
            return message.reply(`Couldn't find player(s): ${missingPlayers}.`);
        }
    }
    else {
        for (let i = 0; i < game.players.length; i++)
            players.push(game.players[i]);
    }

    for (let i = 0; i < players.length; i++) {
        players[i].alive = true;
        players[i].member.roles.remove(game.DeadRole).catch();
        players[i].member.roles.add(game.PlayerRole).catch();
    }


    // Save the game.
    saveLoader.save(game);

    message.channel.send("Listed players are now alive.");

    return;
};
