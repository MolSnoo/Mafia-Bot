const settings = include('settings.json');

module.exports.config = {
    name: "unvote_player",
    description: "Removes your vote.",
    details: "Removes your vote from the current poll.",
    usage: `${settings.commandPrefix}unvote`,
    usableBy: "Player",
    aliases: ["unvote"]
};

module.exports.run = async (bot, game, message, command, args, player) => {
    if (!game.poll) return message.reply(`there is no poll to remove your vote from.`);
    if (!game.poll.open) return message.reply(`the poll is no longer open.`);

    // Find the corresponding entry and the player's previous vote, if it exists.
    var entry = null;
    var hasVoted = false;
    for (let i = 0; i < game.poll.entries.length; i++) {
        for (let j = 0; j < game.poll.entries[i].votes.length; j++) {
            if (game.poll.entries[i].votes[j].id === player.id) {
                entry = game.poll.entries[i];
                break;
            }
        }
        if (entry !== null) break;
    }
    if (entry === null) return message.reply(`you haven't voted.`);

    // Remove the player's vote.
    entry.votes.splice(entry.votes.indexOf(player), 1);
    entry.voteCount--;
    entry.votesString = entry.stringify();

    // Update the poll message.
    game.poll.updateMessage();

    message.channel.send(`${player.name} removed their vote for ${entry.label}!`);

    // Save the game.
    //saveLoader.save(game);

    return;
};
