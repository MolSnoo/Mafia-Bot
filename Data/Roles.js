class Role {
    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}

module.exports.roles = [
    new Role("Player", "YELLOW"),
    new Role("Tester", "GREY"),
    new Role("Moderator", "PURPLE"),
    new Role("Dead", "GREY"),
    new Role("Spectator", "GREY")
]