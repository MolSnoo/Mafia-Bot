const { loadGames } = require("../Modules/saveLoader");

const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "majority_moderator",
    description: "Announces majority on the poll.",
    details: "Announces majority on the current poll and sets a timer for the poll to close. You can specify the number of minutes until the poll closes. "
        + `If no number is given, the poll will close after ${settings.defaultMajorityTime} minutes. If "lost" is used as an argument instead of a number, `
        + "the current majority timer will be canceled.",
    usage: `${settings.commandPrefix}majority\n`
        + `${settings.commandPrefix}majority 20\n`
        + `${settings.commandPrefix}majority lost`,
    usableBy: "GameModerator",
    aliases: ["majority"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (!game.poll) return message.reply("There is no poll for majority to apply to.");
    if (!game.poll.open) return message.reply("The current poll is already closed.");
    const guild = game.guild;


    const channel = game.guild.channels.cache.get(game.announcementChannel);

    if (args[0] === "lost" || args[0] === "Lost") {
        var loadedGame = (await loadGames(guild)).find(x => x.commandChannel === game.commandChannel);
        if (loadedGame.poll.hasMajority) {
            channel.send("Majority has been lost!");
            loadedGame.poll.hasMajority = false;
            // Save the game.
            saveLoader.save(loadedGame);
            return;
        }
    }
    if (game.poll.timer !== null) return message.reply(`There is already majority on the current poll. Use \`${settings.commandPrefix}majority lost\` to cancel it first.`);

    var time = args[0] ? args[0] : settings.defaultMajorityTime;
    if (isNaN(time)) return message.reply("Invalid time given. Input must be the number of minutes until the poll will close.");
    // Convert minutes to milliseconds.
    time = time * 60000;

    const endTime = new Date(new Date().getTime() + time).toLocaleTimeString("en-US", { hour12: true, timeZone: "America/New_York" });
    channel.send(`Majority has been reached! The poll will close at ${endTime}.`);

    // Set the poll timer.
    game.endTime = endTime;
    game.poll.hasMajority = true;
    saveLoader.save(game);
    game.poll.timer = setTimeout(async function () {
        var loadedGame = (await loadGames(guild)).find(x => x.commandChannel === game.commandChannel);
        // If the game timer was a previous one, or if the majority was lost, end the timer
        if (!loadedGame.poll.hasMajority || loadedGame.endTime !== game.endTime)
            return;

        loadedGame.poll.open = false;
        loadedGame.poll.timer = null;
        loadedGame.poll.hasMajority = false;
        channel.send("The poll is closed!");
        // Save the game.
        saveLoader.save(loadedGame);
    }, time);
    
    return;
};
