const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

const PollEntry = include(`${settings.dataDir}/PollEntry.js`);
const Poll = include(`${settings.dataDir}/Poll.js`);

module.exports.config = {
    name: "poll_moderator",
    description: "Creates a new poll.",
    details: "Creates a new poll with the specified title and entries. The poll title must be wrapped in quotation marks. "
        + "All poll entries must be comma-separated. If \"living\" is given instead of any specific entries, then "
        + "the poll entries will be the list of all living players. The poll will be posted in #game-announcements.",
    usage: `${settings.commandPrefix}poll "Who will be hanged?" Brighid, Chris, Caleb, Emily, James, Jamie, Kiki, Liam, Rebecca, Tori, Vivian\n`
        + `${settings.commandPrefix}poll "Who will receive punishment? (2 majority)" Chris, Cody, Liam\n`
        + `${settings.commandPrefix}poll "Who to hang? (5 majority)" living`,
    usableBy: "GameModerator",
    aliases: ["poll"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) {
        message.reply("You need to supply a title and at least one option. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    var input = args.join(" ").replace(/“/g, '"').replace(/”/g, '"');
    // Get title.
    var title = input.substring(input.indexOf('"') + 1, input.lastIndexOf('"'));
    if (!title || title === '"') return message.reply("You need to supply a title in quotation marks.");
    // Get entries.
    input = input.substring(input.lastIndexOf('"') + 1).trim();
    if (input.toLowerCase() === "living")
        input = game.players.filter(player => player.alive === true).map(player => player.name).join(',');
    const inputEntries = input.split(',');
    if (inputEntries.length === 1 && inputEntries[0].trim() === "") return message.reply("You need to supply at least one option.");

    var entries = [];
    for (let i = 0; i < inputEntries.length; i++) {
        inputEntries[i] = inputEntries[i].trim();
        if (inputEntries[i] !== "") entries.push(new PollEntry(inputEntries[i]));
    }

    game.poll = new Poll(title, entries);

    const channel = game.guild.channels.cache.get(game.announcementChannel);
    channel.send(game.poll.stringify()).then(message => {
        game.poll.message = message;
        // Save the game.
        saveLoader.save(game);
    }).catch(console.error);

    return;
};
