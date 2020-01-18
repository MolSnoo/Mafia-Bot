const settings = include('settings.json');
const discord = require('discord.js');

module.exports.execute = async (command, bot, game, message, player) => {
    var isModerator = isPlayer = isEligible = false;
    // First, determine who is using the command.
    if ((message.channel.id === settings.commandChannel || command.startsWith('delete')) && message.member.roles.find(role => role.id === settings.moderatorRole)) isModerator = true;
    else if (message.member.roles.find(role => role.id === settings.playerRole)) isPlayer = true;
    else if (settings.debug && message.member.roles.find(role => role.id === settings.testerRole)) isEligible = true;
    else if (!settings.debug && message.member.roles.find(role => role.id === settings.eligibleRole)) isEligible = true;
    else return;

    const commandSplit = command.split(" ");
    const args = commandSplit.slice(1);

    var roleCommands = new discord.Collection();
    if (isModerator) roleCommands = bot.configs.filter(config => config.usableBy === "Moderator");
    else if (isPlayer) roleCommands = bot.configs.filter(config => config.usableBy === "Player");
    else if (isEligible) roleCommands = bot.configs.filter(config => config.usableBy === "Eligible");

    let commandConfig = roleCommands.find(command => command.aliases.includes(commandSplit[0]));
    if (!commandConfig) return;
    let commandFile = bot.commands.get(commandConfig.name);
    if (!commandFile) return;
    const commandName = commandConfig.name.substring(0, commandConfig.name.indexOf('_'));

    if (isModerator) {
        if (commandConfig.requiresGame && !game.inProgress) {
            message.reply("There is no game currently running.");
            return;
        }
        commandFile.run(bot, game, message, commandSplit[0], args);
        return;
    }
    else if (isPlayer) {
        if (!game.inProgress && !command.startsWith('help')) {
            message.reply("There is no game currently running.");
            return;
        }
        if (message.channel.type === "dm" || settings.roomCategories.includes(message.channel.parentID)) {
            player = null;
            for (let i = 0; i < game.players.length; i++) {
                if (game.players[i].id === message.author.id && game.players[i].alive) {
                    player = game.players[i];
                    break;
                }
            }
            if (player === null) {
                message.reply("You are not on the list of living players.");
                return;
            }

            commandFile.run(bot, game, message, commandSplit[0], args, player).then(() => { if (!settings.debug) message.delete().catch(); });
            return;
        }
        return;
    }
    else if (isEligible) {
        if (!game.inProgress && !command.startsWith('help')) {
            message.reply("There is no game currently running.");
            return;
        }
        if (settings.debug && message.channel.id === settings.testingChannel
            || !settings.debug && message.channel.id === settings.generalChannel) {
            commandFile.run(bot, game, message, args).then(() => { if (!settings.debug) message.delete().catch(); });
            return;
        }
        return;
    }

    return;
};
