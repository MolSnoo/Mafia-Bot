const settings = include('settings.json');

class PollEntry {
    constructor(label) {
        this.label = label;
        this.votes = [];
        this.voteCount = 0;
        this.votesString = "";
    }
}

module.exports = PollEntry;