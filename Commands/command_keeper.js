const discord = require('discord.js');
const settings = include('settings.json');
const fs = require('fs');
const http = require('https');




module.exports.config = {
    name: "file_keeper",
    description: "Debugging for any keeper",
    details: 'Gives the output and allows for input of the prevGames file',
    usage: `${settings.commandPrefix}file\n`
        + `${settings.commandPrefix}file x`,
    usableBy: "Keeper",
    aliases: ["file"],
    requiresGame: false
};


/**
 *
 *
 * @param {*} command
 * @param {discord.Message} message
 * @param {*} player
 * @param {discord.Client} bot
 */
module.exports.run = async(command, message, player, bot) => {
    const fileName = message.content.toLowerCase().includes('setting') ? 'settings.json' : settings.prevGameFileName;
    try {
        if (message.attachments.size) {
            const file = fs.createWriteStream(fileName);
            var url = message.attachments.first().url;
            http.get(url, res => {
                res.pipe(file);
            })
        }
        else {
            var fileString = fs.readFileSync(fileName, 'utf-8')
            var buffer = Buffer.from(fileString, 'utf-8');
            await message.channel.send({ files: [{ attachment: buffer, name: fileName}]});
        }
        return await message.channel.send('Whatever it was was done successfully')
    }
    catch(e) {
        return await message.channel.send("Something failed")
    }

}