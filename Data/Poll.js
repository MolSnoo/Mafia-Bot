const settings = include('settings.json');

class Poll {
    constructor(title, entries) {
        this.title = title;
        this.entries = entries;
        this.open = true;
        this.message = null;
    }
}

module.exports = Poll;