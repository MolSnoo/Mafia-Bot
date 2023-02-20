const settings = include('settings.json');
const discord = require('discord.js');
/**
 *
 *
 * @param {*} command
 * @param {discord.Client} bot
 * @param {*} games
 * @param {discord.Message} message
 * @param {*} player
 * @return {*} 
 */
module.exports.execute = async (command, bot, games, message, player) => {
    // Find game we are using
    var game = message.channel.parent && message.channel.parent.name.includes('Game - ') ? 
                   games.find(x => x.gameCategory === message.channel.parentId) : games[0]

    // Special command(s) for keeper
    if (message.channel.id === settings.commandChannel && message.member.roles.cache.find(role => role.id === settings.keeperRole) && command.toLowerCase().startsWith('file')) {
        var command = bot.commands.get('file_keeper');
        command.run(command, message, player, bot);
        return;
    }
    else if (message.member.roles.cache.find(role => role.id === settings.keeperRole) && command.startsWith('say')) {
        message.channel.send(command.substr('say '.length));
        if (!settings.debug) message.delete().catch();
        return;
    }


    var isModerator = isPlayer = isEligible = isGameModerator = false;
    // First, determine who is using the command.
    if (((message.channel.id === settings.commandChannel || command.toLowerCase().startsWith('delete')) && message.member.roles.cache.find(role => role.id === settings.moderatorRole))) isModerator = true;
    else if (game.commandChannel && message.channel.id === game.commandChannel && message.member.roles.cache.find(role => role.id === game.ModeratorRole)) isGameModerator = true;
    else if (message.member.roles.cache.find(role => role.id === game.PlayerRole) && message.channelId !== settings.generalChannel) isPlayer = true;
    else if (settings.debug && message.member.roles.cache.find(role => role.id === settings.testerRole)) isEligible = true;
    else if (!settings.debug && message.member.roles.cache.find(role => role.id === settings.eligibleRole)) isEligible = true;
    else return await message.channel.send("I'm sorry, you are not currently eligible to play");

    const commandSplit = command.split(" ");
    const args = commandSplit.slice(1);

    var roleCommands = new discord.Collection();
    if (isModerator) roleCommands = bot.configs.filter(config => config.usableBy === "Moderator");
    else if (isGameModerator) roleCommands = bot.configs.filter(config => config.usableBy === "GameModerator")
    else if (isPlayer) roleCommands = bot.configs.filter(config => config.usableBy === "Player");
    else if (isEligible) roleCommands = bot.configs.filter(config => config.usableBy === "Eligible");

    let commandConfig = roleCommands.find(command => command.aliases.includes(commandSplit[0].toLowerCase()));
    if (!commandConfig) return;
    let commandFile = bot.commands.get(commandConfig.name);
    if (!commandFile) return;
    const commandName = commandConfig.name.substring(0, commandConfig.name.indexOf('_'));

    if (isModerator) { // have to change this to be new games...
        if (commandConfig.requiresGame && !game.inProgress) {
            message.reply("There is no game currently running.");
            return;
        }
        commandFile.run(bot, game, message, commandSplit[0], args);
        return;
    }
    else if (isGameModerator) {
        if (commandConfig.requiresGame && !game.inProgress) {
            message.reply("There is no game currently running");
            return;
        }
        commandFile.run(bot, game, message, commandSplit[0], args);
        return;
    }
    else if (isPlayer) {
        if (command.toLowerCase().startsWith('play') || command.toLowerCase().startsWith('spectate'))
            commandFile.run(bot, game, message, args)
                .then(() => { if (!settings.debug) message.delete().catch(); });
        
        if (game.gameCategory.includes(message.channel.parentId)) {
            if (!game.inProgress && !command.toLowerCase().startsWith('help')) {
                message.reply("There is no game currently running.");
                return;
            }
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
        if (!game.inProgress && !command.toLowerCase().startsWith('help')) {
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