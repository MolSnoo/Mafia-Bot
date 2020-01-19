const settings = include('settings.json');

class Spectator {
    constructor(id, member, name) {
        this.id = id;
        this.member = member;
        this.name = name;
    }
}

module.exports = Spectator;