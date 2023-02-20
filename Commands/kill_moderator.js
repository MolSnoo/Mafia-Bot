const { Client } = require("discord.js");

const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "kill_moderator",
    description: "Makes a player dead.",
    details: "Moves the listed players from the living list to the dead list. Each player will lose their Player role and be given the Dead role. "
        + "Players with the Dead role have permission to see all game channels, so be sure the player is actually supposed to be dead before using this command.",
    usage: `${settings.commandPrefix}kill chris\n`
        + `${settings.commandPrefix}die micah joshua amber devyn veronica`,
    usableBy: "GameModerator",
    aliases: ["kill", "die"],
    requiresGame: true
};
/**
 *
 *
 * @param {Client} bot
 * @param {*} game
 * @param {*} message
 * @param {*} command
 * @param {*} args
 * @return {*} 
 */
module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) {
        message.reply("You need to specify at least one player. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    var guild = bot.guilds.cache.first();

    // Get all listed players first.
    var players = [];

    if (args[0].toLowerCase() !== 'living') {
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
        players[i].alive = false;
        players[i].member.roles.remove(game.PlayerRole).catch();
        players[i].member.roles.add(game.DeadRole).catch();

        guild.channels.cache.get(game.mafiaChannel1Channel).permissionOverwrites.create(players[i].id, { VIEW_CHANNEL: null });
        guild.channels.cache.get(game.mafiaChannel2Channel).permissionOverwrites.create(players[i].id, { VIEW_CHANNEL: null });
        guild.channels.cache.get(game.mafiaChannel3Channel).permissionOverwrites.create(players[i].id, { VIEW_CHANNEL: null });
    }    

    // Save the game.
    saveLoader.save(game);

    message.channel.send("Listed players are now dead.");

    return;
};
