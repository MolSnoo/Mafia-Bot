const settings = include('settings.json');

class Player {
    constructor(id, member, name, alive, team) {
        this.id = id;
        this.member = member;
        this.name = name;
        this.alive = alive;
        this.team = team;
    }
}

module.exports = Player;