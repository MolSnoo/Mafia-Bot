const settings = include('settings.json');

module.exports.config = {
    name: "vote_player",
    description: "Casts a vote.",
    details: "Casts a vote on the current poll. Your input must be an option on the poll. If you decide to vote again, your previous vote "
        + "will be removed and your new vote will be cast. If you wish to rescind your vote altogether, use the unvote command.",
    usage: `${settings.commandPrefix}vote conrad`,
    usableBy: "Player",
    aliases: ["vote"]
};

module.exports.run = async (bot, game, message, command, args, player) => {
    if (args.length === 0) {
        message.reply("you need to specify an option. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }
    if (!game.poll) return message.reply(`there is no poll to vote on.`);
    if (!game.poll.open) return message.reply(`the poll is no longer open.`);

    var input = args.join(" ");

    // Find the corresponding entry and the player's previous vote, if it exists.
    var entry = null;
    var previousVote = null;
    for (let i = 0; i < game.poll.entries.length; i++) {
        if (game.poll.entries[i].label.toLowerCase() === input.toLowerCase())
            entry = game.poll.entries[i];
        for (let j = 0; j < game.poll.entries[i].votes.length; j++) {
            if (game.poll.entries[i].votes[j].id === player.id)
                previousVote = game.poll.entries[i];
        }
    }
    if (entry === null) return message.reply(`that is not an option on the poll.`);
    if (previousVote !== null && entry.label === previousVote.label) return message.reply(`you have already voted for ${entry.label}.`);

    // If the player previously cast a vote, remove it.
    if (previousVote !== null) {
        previousVote.votes.splice(previousVote.votes.indexOf(player), 1);
        previousVote.voteCount--;
        previousVote.votesString = previousVote.stringify();
    }
    // Now cast the player's vote.
    entry.votes.push(player);
    entry.voteCount++;
    entry.votesString = entry.stringify();

    // Update the poll message.
    game.poll.updateMessage();

    message.channel.send(`${player.name} voted for ${entry.label}!`);

    // Save the game.
    //saveLoader.save(game);

    return;
};
