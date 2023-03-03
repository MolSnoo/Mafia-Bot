const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

const Player = include(`${settings.dataDir}/Player.js`);

module.exports.config = {
    name: "addmod_moderator",
    description: "Adds another Moderator to the game.",
    details: "Adds the specified member to the game as a Moderator. Note that the member must have the Current Moderator role in order to be added to the game.",
    usage: `${settings.commandPrefix}addmod cody\n`
        + `${settings.commandPrefix}addmoderator tori`,
    usableBy: "GameModerator",
    aliases: ["addmod", "addmoderator"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) {
        message.reply("You need to specify a member. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    var input = args.join(" ");
    var member = await game.guild.members.fetch({ query: input.toLowerCase(), limit: 1 });
    member = member.first();

    if (!member) return message.reply(`Couldn't find anyone on the server named "${input}".`);

    // make sure that member has current moderator role
    if (!member.roles.cache.find(role => role.id === settings.moderatorRole)) return message.reply(`${member.displayName} does not have the Current Moderator role and cannot play.`); 

    member.roles.add(game.ModeratorRole);

    return message.reply(`${input} has successfully become another Moderator`);
};
