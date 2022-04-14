﻿const settings = include('settings.json');
const discord = require('discord.js');

module.exports.config = {
    name: "help_player",
    description: "Lists all commands available to you.",
    details: "Lists all commands available to the user. If a command is specified, displays the help menu for that command.",
    usage: `${settings.commandPrefix}help\n` +
        `${settings.commandPrefix}help help`,
    usableBy: "Player",
    aliases: ["help"]
};

module.exports.run = async (bot, game, message, command, args, player) => {
    // Get all commands available to the user and sort them alphabetically.
    var roleCommands = new discord.Collection();
    roleCommands = bot.configs.filter(config => config.usableBy === "Player");
    roleCommands.sort(function (a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });

    if (args.length === 0) {
        let embed = new discord.MessageEmbed()
            .setColor('1F8B4C')
            .setAuthor({ name: `${game.guild.me.displayName} Help`, iconURL: bot.user.avatarURL() })
            .setDescription(`These are the available commands for users with the Player role.`);

        roleCommands.forEach(function (value, key, map) {
            const commandName = key.substring(0, key.indexOf('_'));
            embed.addField(`${settings.commandPrefix}${commandName}`, value.description);
        });
        message.channel.send({ embeds: [embed] });
    }
    else {
        let command = roleCommands.find(command => command.aliases.includes(args[0]));
        if (!command) return message.reply(`Couldn't find command "${args[0]}".`);

        const commandName = command.name.charAt(0).toUpperCase() + command.name.substring(1, command.name.indexOf('_'));
        let embed = new discord.MessageEmbed()
            .setColor('1F8B4C')
            .setAuthor({ name: `${commandName} Command Help`, iconURL: bot.user.avatarURL() })
            .setDescription(command.description);

        let aliasString = "";
        for (let i = 0; i < command.aliases.length; i++)
            aliasString += `\`${settings.commandPrefix}${command.aliases[i]}\` `;
        embed.addField("Aliases", aliasString);
        embed.addField("Examples", command.usage);
        embed.addField("Description", command.details);

        message.channel.send({ embeds: [embed] });
    }

    return;
};
