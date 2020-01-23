const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "majority_moderator",
    description: "Announces majority on the poll.",
    details: "Announces majority on the current poll and sets a timer for the poll to close. You can specify the number of minutes until the poll closes. "
        + `If no number is given, the poll will close after ${settings.defaultMajorityTime} minutes. If "lost" is used as an argument instead of a number, `
        + "the current majority timer will be canceled.",
    usage: `${settings.commandPrefix}majority\n`
        + `${settings.commandPrefix}majority 20`
        + `${settings.commandPrefix}majority lost`,
    usableBy: "Moderator",
    aliases: ["majority"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (!game.poll) return message.reply("there is no poll for majority to apply to.");
    if (!game.poll.open) return message.reply("the current poll is already closed.");

    const channel = game.guild.channels.get(settings.announcementChannel);

    if (args[0] === "lost" || args[0] === "Lost") {
        clearTimeout(game.poll.timer);
        game.poll.timer = null;
        channel.send("Majority has been lost!");
        // Save the game.
        //saveLoader.save(game);
        return;
    }
    if (game.poll.timer !== null) return message.reply(`there is already majority on the current poll. Use \`${settings.commandPrefix}majority lost\` to cancel it first.`);

    var time = args[0] ? args[0] : settings.defaultMajorityTime;
    if (isNaN(time)) return message.reply("invalid time given. Input must be the number of minutes until the poll will close.");
    // Convert minutes to milliseconds.
    time = time * 60000;

    const endTime = new Date(new Date().getTime() + time).toLocaleTimeString("en-US", { hour12: true, timeZone: "America/New_York" });
    channel.send(`Majority has been reached! The poll will close at ${endTime}.`);

    // Set the poll timer.
    game.poll.timer = setTimeout(function () {
        game.poll.open = false;
        game.poll.timer = null;
        channel.send("The poll is closed!");
    }, time);
    
    return;
};
