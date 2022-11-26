var gameNumber = 1;
var roles = include('../settingsJSON/roles.json');
var channels = include('../settingsJSON/channels.json');

module.exports.createGame = function(bot) {
    var game = {}
    var guild = bot.guilds.cache.first();
    // create roles
    roles.forEach(role => {
        guild.roles.create({
            name: role.name + ' ' + gameNumber,
            color: role.color,
        }).then(createdRole => game.roles.push({ name: role.name, color: role.color, id: createdRole.id }));
    });
    
    // create category
    guild.channels.create("Game - " + gameNumber, { 
        type: "GUILD_CATEGORY",  
        permissionOverwrites: [{
            game.roles.find(index => index.name == "")[0]
        }]
    });
    // create category permissions

    // create channel
    // give channel permissions
    // save id's to game
}