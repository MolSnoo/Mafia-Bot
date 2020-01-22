const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

const PollEntry = include(`${settings.dataDir}/PollEntry.js`);
const Poll = include(`${settings.dataDir}/Poll.js`);

module.exports.config = {
    name: "poll_moderator",
    description: "Creates a new poll.",
    details: "Creates a new poll with the specified title and entries. The poll title must be wrapped in quotation marks. "
        + "All poll entries must be comma-separated. The poll will be posted in #game-announcements.",
    usage: `${settings.commandPrefix}poll "Who will be hanged?" Brighid, Chris, Caleb, Emily, Jamie, Jared, Kiki, Liam, MolSno, Rebecca, Tori\n`
        + `${settings.commandPrefix}poll "Who will receive punishment? (2 majority)" Chris, Cory, Liam`,
    usableBy: "Moderator",
    aliases: ["poll"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) {
        message.reply("you need to supply a title and at least one option. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    var input = args.join(" ").replace(/“/g, '"').replace(/”/g, '"');
    // Get title.
    var title = input.substring(input.indexOf('"') + 1, input.lastIndexOf('"'));
    if (!title || title === '"') return message.reply("you need to supply a title in quotation marks.");

    // Get entries.
    input = input.substring(input.lastIndexOf('"') + 1).trim();
    const inputEntries = input.split(',');
    if (inputEntries.length === 1) return message.reply("you need to supply at least one option.");

    var entries = [];
    for (let i = 0; i < inputEntries.length; i++) {
        inputEntries[i] = inputEntries[i].trim();
        if (inputEntries[i] !== "") entries.push(new PollEntry(inputEntries[i]));
    }

    game.poll = new Poll(title, entries);

    const channel = game.guild.channels.get(settings.announcementChannel);
    channel.send("Poll message").then(message => { game.poll.message = message; console.log(game.poll); }).catch(console.error);

    // Save the game.
    //saveLoader.save(game);
    return;
};
