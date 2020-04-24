﻿const settings = include('settings.json');
const saveLoader = include(`${settings.modulesDir}/saveLoader.js`);

module.exports.config = {
    name: "assign_moderator",
    description: "Assigns the given player(s) to a mafia team or as a Mayor.",
    details: "Assigns one or more players to the specified mafia team. This command gives them the ability to read that team's channel. "
        + "Note that aside from Mayor, this command does not assign specific roles, nor does it assign someone to a separate team like Neutral or Town. "
        + "If someone is assigned the Mayor role, their vote will count for 3 votes on polls.",
    usage: `${settings.commandPrefix}assign julia mafia\n`
        + `${settings.commandPrefix}assign chris mafia 1\n`
        + `${settings.commandPrefix}assign jamie liam rebecca tim mafia 2\n`
        + `${settings.commandPrefix}assign brighid cory mafia 3\n`
        + `${settings.commandPrefix}assign tim mayor`,
    usableBy: "Moderator",
    aliases: ["assign"],
    requiresGame: true
};

module.exports.run = async (bot, game, message, command, args) => {
    if (args.length === 0) {
        message.reply("you need to specify at least one player and a team or the Mayor role. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    // Get all listed players first.
    var players = [];
    for (let i = 0; i < game.players.length; i++) {
        for (let j = 0; j < args.length; j++) {
            if (args[j].toLowerCase() === game.players[i].name.toLowerCase()) {
                players.push(game.players[i]);
                args.splice(j, 1);
                break;
            }
        }
    }
    // Args at this point should only include the team, as well as any players that weren't found.
    // Check to see that the last argument is the name of a team.
    var input = args.join(" ").toLowerCase();
    var team = "";
    if (input.endsWith("mafia 1") || input.endsWith("mafia"))
        team = "Mafia 1";
    else if (input.endsWith("mafia 2"))
        team = "Mafia 2";
    else if (input.endsWith("mafia 3"))
        team = "Mafia 3";
    else if (input.endsWith("mayor"))
        team = "Mayor";

    if (team === "") {
        message.reply(`invalid team given. Usage:`);
        message.channel.send(exports.config.usage);
        return;
    }

    // Team was found, so make sure there were no incorrect players.
    if (input.includes("mafia")) input = input.substring(0, input.indexOf("mafia"));
    else if (input.includes("mayor")) input = input.substring(0, input.indexOf("mayor"));
    args = input.split(" ");
    // Remove any blank entries in args.
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '') {
            args.splice(i, 1);
            i--;
        }
    }
    if (args.length > 0) {
        const missingPlayers = args.join(", ");
        return message.reply(`couldn't find player(s): ${missingPlayers}.`);
    }
    if (players.length === 0) {
        message.reply("you need to specify at least one player. Usage:");
        message.channel.send(exports.config.usage);
        return;
    }

    // Now assign all of the players to the given team.
    for (let i = 0; i < players.length; i++) {
        // Prevent double Mayor votes.
        if (players[i].team === "Mayor" && team === "Mayor") continue;
        players[i].team = team;
        if (players[i].team === "Mafia 1") game.guild.channels.get(settings.mafiaChannel1).overwritePermissions(players[i].member, { VIEW_CHANNEL: true });
        else if (players[i].team === "Mafia 2") game.guild.channels.get(settings.mafiaChannel2).overwritePermissions(players[i].member, { VIEW_CHANNEL: true });
        else if (players[i].team === "Mafia 3") game.guild.channels.get(settings.mafiaChannel3).overwritePermissions(players[i].member, { VIEW_CHANNEL: true });
        else if (players[i].team === "Mayor" && game.poll !== null && game.poll.open) {
            for (let j = 0; j < game.poll.entries.length; j++) {
                let foundPlayerVote = false;
                for (let k = 0; k < game.poll.entries[j].votes.length; k++) {
                    if (game.poll.entries[j].votes[k].id === players[i].id) {
                        foundPlayerVote = true;
                        game.poll.entries[j].voteCount += 2;
                        game.poll.entries[j].votesString = game.poll.entries[j].stringify();
                        // Update the poll message.
                        game.poll.updateMessage();
                        break;
                    }
                }
                if (foundPlayerVote) break;
            }
        }
    }
    // Save the game.
    saveLoader.save(game);

    message.channel.send(`Assigned ${players.length} player(s) to ${team}.`);

    return;
};
