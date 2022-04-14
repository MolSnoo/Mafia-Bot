const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "resume_moderator",
    description: "Resumes a game.",
    details: 'Resumes a game if the data has been unloaded from memory. All players will be reassigned the Player or Dead role, '
        + 'depending on their status. Additionally, any mafia members will be given permission to read their respective team\'s channel. '
        + 'The Spectator role will also be reassigned to anyone who was spectating the game. This command should generally only be used '
        + 'if the bot was restarted during a game.',
    usage: `${settings.commandPrefix}resumegame\n`
        + `${settings.commandPrefix}resume`,
    usableBy: "Moderator",
    aliases: ["resumegame", "resume"],
    requiresGame: false
};

module.exports.run = async (bot, game, message, command, args) => {
    if (game.inProgress) return message.reply("Cannot resume a game while one is already in progress.");
    saveLoader.load(game);
    message.channel.send("Resumed game.");

    return;
};
