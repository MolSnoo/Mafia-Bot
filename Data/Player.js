const settings = include('settings.json');

class Player {
    constructor(id, member, name, alive) {
        this.id = id;
        this.member = member;
        this.name = name;
        this.alive = alive;
    }
}

module.exports = Player;