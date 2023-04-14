const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "wheel_player",
    description: "Spins a wheel on all alive players",
    details: "All alive players are included on a wheel! The wheel will spin randomly to decide",
    usage: `${settings.commandPrefix}wheel\n` +
            `${settings.commandPrefix}wheel seth bob joe mama`,
    usableBy: "Player",
    aliases: ["wheel"]
};

module.exports.run = async (bot, game, message, command, args, player) => {
    var replyMessage = "";
    var players = []
    if (args.length === 0) {
        players = game.players.filter(x => x.alive);
    }
    else {
        for (var arg of args) {
            var person = game.players.find(x => x.name.toLowerCase() === arg.toLowerCase() && x.alive);
            if (!person)
                replyMessage += `Could not find player ${arg}, they have been left off of the wheel`;
            else players.push(person);
        }
    }

    if (players.length === 0) 
        return message.reply(`Could not find anyone living or that you placed`)

    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    var names = ""
    for (var one of players)
        names += one.name + "\n";

    replyMessage += `A wheel was spun! The lucky participants are: \n${names}` +
    `The lucky member of the wheel is ${randomPlayer.name}!! Congratulations!`;
    return message.reply(replyMessage);
};
