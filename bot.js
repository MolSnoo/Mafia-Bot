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
const { loadGames } = require('./Modules/saveLoader');

var game = include(`game.json`);
var games = [];

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

async function updateStatus() {
    const checkGames = await loadGames(bot.guilds.cache.first());
    var gamesInProgress = 0;

    for (var individual of checkGames)
        if (individual.inProgress) gamesInProgress++;
    var aliveString = " " + gamesInProgress + " game(s)";

    if (checkGames.filter(x => x.inProgress).length === 1) {
        var numPlayersAlive = checkGames[0].players.reduce(function (total, player) {
            return total + (player.alive ? 1 : 0);
        }, 0);
        aliveString = " - " + numPlayersAlive + " player" + (numPlayersAlive !== 1 ? "s" : "") + " alive";
    }

    if (settings.debug)
        bot.user.setPresence({ status: "dnd", activities: [{ name: settings.debugModeActivity.string + aliveString, type: settings.debugModeActivity.type }] });
    else {
        if (gamesInProgress != 0)
            bot.user.setPresence({ status: "online", activities: [{ name: settings.gameInProgressActivity.string + aliveString, type: settings.gameInProgressActivity.type, url: settings.gameInProgressActivity.url }] });
        else
            bot.user.setPresence({ status: "online", activities: [{ name: settings.onlineActivity.string, type: settings.onlineActivity.type }] });
    }

    // Cache all members
    bot.guilds.cache.first().members.fetch();
}

bot.on('ready', async () => {
    await bot.guilds.fetch();
    await bot.user.fetch()

    console.log(`${bot.user.username} is online on ${bot.guilds.cache.size} server(s).`);
    loadCommands();

    games = fs.readFileSync(settings.prevGameFileName, 'utf-8');
    games = JSON.parse(games);
    


    // Get function to create a game and do this.
    game.guild = bot.guilds.cache.first();
    game.commandChannel = game.guild.channels.cache.find(channel => channel.id === settings.commandChannel);
    games.push(game);
    await updateStatus();


    // Run living players check periodically
    setInterval(async () => {
        await updateStatus();
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

        commandHandler.execute(command, bot, await loadGames(bot.guilds.cache.first()), message);
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

bot.login(credentials.token);
