const settings = include('settings.json');

class PollEntry {
    constructor(label) {
        this.label = label;
        this.votes = [];
        this.voteCount = 0;
        this.votesString = this.stringify();
    }

    stringify() {
        const unit = this.voteCount !== 1 ? "votes" : "vote";
        var string = `-${this.label}: ${this.voteCount} ${unit}\n`;
        if (this.voteCount > 0) {
            // Sort voters in alphabetical order.
            const sortedVoters = [...this.votes].sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
            const voterString = sortedVoters.join(", ");
            string += `    ${voterString}\n`;
        }
        return string;
    }
}

module.exports = PollEntry;