const settings = include('settings.json');

class Poll {
    constructor(title, entries) {
        this.title = title;
        this.entries = entries;
        this.open = true;
        this.message = null;
    }

    updateMessage() {
        const voteString = this.stringify();
        this.message.edit(voteString);
    }

    stringify() {
        var string = `**${this.title}**\n\n`;
        // Sort entries by decreasing number of votes.
        // If the number is the same, sort alphabetically.
        const sortedEntries = [...this.entries].sort((a, b) => {
            if (a.voteCount === b.voteCount) {
                if (a.label < b.label) return -1;
                if (a.label > b.label) return 1;
                return 0;
            }
            return a.voteCount - b.voteCount;
        });
        for (let i = 0; i < sortedEntries.length; i++)
            string += sortedEntries[i].votesString;
        return string;
    }
}

module.exports = Poll;