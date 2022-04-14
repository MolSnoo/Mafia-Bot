'use strict';
global.include = require('app-root-path').require;

const settings = include('settings.json');
const credentials = include('credentials.json');
const commandHandler = include(`${settings.modulesDir}/commandHandler.js`);

const discord = require('discord.js');
const bot = new discord.Client({
    retryLimit: Infinity,
    intents: [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_MEMBERS,
        discord.Intents.FLAGS.GUILD_MESSAGES
    ]
});
const fs = require('fs');

var game = include(`game.json`);

bot.commands = new discord.Collection();
bot.configs = new discord.Collection();
function loadCommands() {
    const commandsDir = `./${settings.commandsDir}/`;
    fs.readdir(commandsDir, (err, files) => {
        if (err) console.log(err);

        let commandFiles = files.filter(filename => filename.split('.').pop() === 'js');
        if (commandFiles.length <= 0) {
            console.log("Couldn't find commands.");
            return process.exit(1);
        }

        commandFiles.forEach((file, i) => {
            delete require.cache[require.resolve(`${commandsDir}${file}`)];
            let props = require(`${commandsDir}${file}`);
            bot.commands.set(props.config.name, props);
            bot.configs.set(props.config.name, props.config);
        });
    });

    console.log(`Loaded all commands.`);
}

function updateStatus() {
    var numPlayersAlive = game.players.reduce(function (total, player) {
        return total + (player.alive ? 1 : 0);
    }, 0);
    var aliveString = " - " + numPlayersAlive + " player" + (numPlayersAlive !== 1 ? "s" : "") + " alive";

    if (settings.debug)
        bot.user.setPresence({ status: "dnd", activities: [{ name: settings.debugModeActivity.string + aliveString, type: settings.debugModeActivity.type }] });
    else {
        if (game.inProgress && !game.canJoin)
            bot.user.setPresence({ status: "online", activities: [{ name: settings.gameInProgressActivity.string + aliveString, type: settings.gameInProgressActivity.type, url: settings.gameInProgressActivity.url }] });
        else
            bot.user.setPresence({ status: "online", activities: [{ name: settings.onlineActivity.string, type: settings.onlineActivity.type }] });
    }
}

bot.on('ready', async () => {
    console.log(`${bot.user.username} is online on ${bot.guilds.cache.size} server(s).`);
    loadCommands();
    game.guild = bot.guilds.cache.first();
    game.commandChannel = game.guild.channels.cache.find(channel => channel.id === settings.commandChannel);
    updateStatus();

    // Run living players check periodically
    setInterval(() => {
        updateStatus();
    }, settings.refreshStatusInterval * 60000);
});

bot.on('messageCreate', async message => {
    // Prevent bot from responding to its own messages.
    if (message.author === bot.user) return;
    if (message.channel.type === "DM") return;

    // If the message begins with the command prefix, attempt to run a command.
    // If the command is run successfully, the message will be deleted.
    if (message.content.startsWith(settings.commandPrefix)) {
        const command = message.content.substring(settings.commandPrefix.length);
        commandHandler.execute(command, bot, game, message);
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

bot.login(credentials.token);
