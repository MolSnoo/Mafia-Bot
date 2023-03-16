const { Client, User } = require("discord.js");

var roles = include('settingsJSON/roles.json');
var channels = include('settingsJSON/channels.json');
const settings = include('settings.json');
const fs = require('fs');
const { loadGames } = require("./saveLoader");

/**
 * @param {Client} bot
 * @param {User} author
 * @
 */
module.exports.createGame = async function(bot, author) {
    var game = include('game.json');
    var guild = bot.guilds.cache.first();
    await guild.channels.fetch();
    var otherGames = await loadGames(bot.guilds.cache.first());
    var prevGame = otherGames.find(x => x.inProgress ? false : !x.canJoin);
    var gameNumber = otherGames.length + 1;

    if (!prevGame) {
        var category = await guild.channels.create("Game - " + gameNumber, { 
            type: "GUILD_CATEGORY"
        });
        game.gameNumber = gameNumber;
        game.gameCategory = category.id;
        category.permissionOverwrites.create(guild.roles.everyone.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false })
    } 
    else {        
        game = prevGame;
        gameNumber = game.gameNumber;
    }
   
    
    // edit roles
    for (const role of roles) {
        const keeperRolePriority = (await guild.roles.fetch(settings.roleUnder)).position;
        var editdRole = await guild.roles.create({
            name: role.name + ' ' + gameNumber,
            color: role.color,
            hoist: true,
            position: keeperRolePriority
        });

        if (role.name.includes("Moderator")) {
            const member = await guild.members.fetch(author.id);
            member.roles.add(editdRole.id)
        }
        game[role.name + 'Role'] = editdRole.id;
    };

    for (const channel of channels) {
        var newChannel;
        if (!prevGame) {
            newChannel = await guild.channels.create(channel.name, {
                type: "GUILD_TEXT",
                parent: game.gameCategory
            });
            game[channel.name + 'Channel'] = newChannel.id;
        }
        else {
            newChannel = await guild.channels.fetch(game[channel.name + 'Channel']);
            game[newChannel.name + 'Channel'] = newChannel.id;
        }


        newChannel.permissionOverwrites.create(guild.roles.everyone.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
        const keeperRoleId = guild.roles.cache.find(x => x.id === settings.keeperRole).id;
        newChannel.permissionOverwrites.create(keeperRoleId, { MANAGE_CHANNELS: true, VIEW_CHANNEL: true, SEND_MESSAGES: true })

        try {
            const seeByPerm = { VIEW_CHANNEL: true, SEND_MESSAGES: false };
            const useByPerm = { VIEW_CHANNEL: true, SEND_MESSAGES: true };
            const moderatorPerm = { VIEW_CHANNEL: true, SEND_MESSAGES: true, MANAGE_CHANNELS: true }
            for (const role of channel.seeBy) {
                const roleId = guild.roles.cache.find(x => x.name === role + ' ' + gameNumber).id;
                newChannel.permissionOverwrites.create(roleId, seeByPerm);
            };
            for (const role of channel.usableBy) {
                const roleId = guild.roles.cache.find(x => x.name === role + ' ' + gameNumber).id;
                if (role != 'Moderator')
                    newChannel.permissionOverwrites.create(roleId, useByPerm)
                else
                    newChannel.permissionOverwrites.create(roleId, moderatorPerm)
            };
        }
        catch (e) { console.log("could not create permission"); }
    }

    if (prevGame)
        otherGames[otherGames.findIndex(x => x.gameCategory === game.gameCategory)] = game;
    else 
        otherGames.push(game);

    const prevJson = JSON.stringify(otherGames);
    fs.writeFileSync(settings.prevGameFileName, prevJson, 'utf8', (err) => {if (err) console.log(err); });

    game.guild = guild;

    return game;
}