const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { Client, LocalAuth, MessageMedia} = require('whatsapp-web.js');
const { client, securitySettings, getSecuritySettings } = require('./WhatsLLM')
/**
 * Script is for the command panel accessible from Whatsapp side.
 * A connection to Whatsapp is expected when this script runs.
 */



/**
 * Whatsapp message handler.
 */

try {
    client.on('message', async (message) => {
        let senderRole;
        if (message.author === undefined) {
            const sender = message.from;  // PM sender ID
            if (securitySettings.admin.includes(sender)) {
                senderRole = 'admin';
            } else if (securitySettings.moderator.includes(sender)) {
                senderRole = 'moderator';
            } else if (securitySettings.user.includes(sender)) {
                senderRole = 'user';
            } else {
                senderRole = 'banned';
            }
        } else {
            const sender = message.author;  // Group sender ID
        }
        if (message.body.startsWith('!')) {
            let command = message.body.split(' ')[0].substring(1);
            let args = message.body.split(' ').slice(1);
            switch (senderRole) {
                case 'admin':
                    await adminCommand(command, args, message);
                    break;
                case 'moderator':
                    moderatorCommand(command, args, message);
                    break;
                case 'user':
                    userCommand(command, args, message);
                    break;
                case 'banned':
                    message.reply('[!]You are banned from using this bot.');
                    break;
                default:
                    unknownCommand(command, args, message);
            }
        }
    });
} catch (err) {
    console.log('[!!!]An error occurred while handling messages: ', err);
}



/**
 * These are the admin commands, they are only accessible to the admin.
 */

async function adminCommand(command, args, message) {
    switch (command) {
        case 'ping':
            message.reply('[!]Online and ready to serve.');
            break;

        case 'setAdmin':
            if (securitySettings.admin.includes(args[0])) {
                message.reply('[!]User is already an admin.');
            } else if (securitySettings.moderator.includes(args[0])) {
                securitySettings.moderator.splice(securitySettings.moderator.indexOf(args[0]), 1);
                securitySettings.admin.push(args[0]);
                fs.writeFileSync(path.join(__dirname, 'securitySetting', 'security.json'), JSON.stringify(securitySettings));
                getSecuritySettings();
                console.log('[!!!]New ADMIN added: ', args[0], ' requested by: ', message.from);
            } else if (securitySettings.user.includes(args[0])) {
                securitySettings.user.splice(securitySettings.user.indexOf(args[0]), 1);
                securitySettings.admin.push(args[0]);
                fs.writeFileSync(path.join(__dirname, 'securitySetting', 'security.json'), JSON.stringify(securitySettings));
                getSecuritySettings();
                console.log('[!!!]New ADMIN added: ', args[0], ' requested by: ', message.from);
            } else if (securitySettings.banned.includes(args[0])) {
                message.reply('[!]User is banned, unbanned them first.');
            } else {
                message.reply('[!]User role unknown.');
            }
            break;

        case 'setModerator':
            if (securitySettings.admin.includes(args[0])) {
                message.reply('[!]You cannot set an ADMIN as a MODERATOR.');
            } else if (securitySettings.moderator.includes(args[0])) {
                message.reply('[!]User is already a moderator.');
            } else if (securitySettings.user.includes(args[0])) {
                securitySettings.user.splice(securitySettings.user.indexOf(args[0]), 1);
                securitySettings.moderator.push(args[0]);
                fs.writeFileSync(path.join(__dirname, 'securitySetting', 'security.json'), JSON.stringify(securitySettings));
                getSecuritySettings();
                console.log('[!!!]New MODERATOR added: ', args[0], ' requested by: ', message.from);
            } else if (securitySettings.banned.includes(args[0])) {
                message.reply('[!]User is banned, unbanned them first.');
            } else {
                message.reply('[!]User role unknown.');
            }
            break;

        case 'setUser':
            if (securitySettings.admin.includes(args[0])) {
                message.reply('[!]You cannot set an ADMIN as a USER.');
            } else if (securitySettings.moderator.includes(args[0])) {
                securitySettings.moderator.splice(securitySettings.moderator.indexOf(args[0]), 1);
                securitySettings.user.push(args[0]);
                fs.writeFileSync(path.join(__dirname, 'securitySetting', 'security.json'), JSON.stringify(securitySettings));
                getSecuritySettings();
                console.log('[!!]New USER added: ', args[0], ' requested by: ', message.from);
            } else if (securitySettings.user.includes(args[0])) {
                message.reply('[!]User is already a user.');
            } else if (securitySettings.banned.includes(args[0])) {
                securitySettings.banned.splice(securitySettings.banned.indexOf(args[0]), 1);
                securitySettings.user.push(args[0]);
                fs.writeFileSync(path.join(__dirname, 'securitySetting', 'security.json'), JSON.stringify(securitySettings));
                getSecuritySettings();
                console.log('[!!!]USER unbanned: ', args[0], ' requested by: ', message.from);
            } else {
                securitySettings.user.push(args[0]);
                fs.writeFileSync(path.join(__dirname, 'securitySetting', 'security.json'), JSON.stringify(securitySettings));
                getSecuritySettings();
                console.log('[!!]New USER added: ', args[0], ' requested by: ', message.from);
            }
            break;

        case 'setBanned':
            if (securitySettings.admin.includes(args[0])) {
                message.reply('[!]You cannot ban an ADMIN.');
            } else if (securitySettings.moderator.includes(args[0])) {
                securitySettings.moderator.splice(securitySettings.moderator.indexOf(args[0]), 1);
                securitySettings.banned.push(args[0]);
                fs.writeFileSync(path.join(__dirname, 'securitySetting', 'security.json'), JSON.stringify(securitySettings));
                getSecuritySettings();
                console.log('[!!!]MODERATOR ', args[0], ' is banned, requested by: ', message.from);
            } else if (securitySettings.user.includes(args[0])) {
                securitySettings.user.splice(securitySettings.user.indexOf(args[0]), 1);
                securitySettings.banned.push(args[0]);
                fs.writeFileSync(path.join(__dirname, 'securitySetting', 'security.json'), JSON.stringify(securitySettings));
                getSecuritySettings();
                console.log('[!!]USER ', args[0], ' is banned, requested by: ', message.from);
            } else if (securitySettings.banned.includes(args[0])) {
                message.reply('[!]User is already banned.');
            } else {
                message.reply('[!]User role unknown.');
            }
            break;

        case 'changePassword':
            if (securitySettings.moderatorPassword === args[0] && args[1] !== null) {
                securitySettings.moderatorPassword = args[1];
                fs.writeFileSync(path.join(__dirname, 'securitySetting', 'security.json'), JSON.stringify(securitySettings));
                getSecuritySettings();
                console.log('[!!!]Moderator password changed by: ', message.from);
                message.reply('[!]Moderator password changed successfully.');
            } else {
                message.reply('[!]Wrong password.');
            }
            break;

        case 'llmConfig':
            // Todo: Come back here after Ollama request part is done.
            break;

        case 'whatsappDisconnect':
            if (args.includes(securitySettings.moderatorPassword) && args.includes(securitySettings.superPassword)) {
                client.destroy();
                console.log('[!!!]Whatsapp connection destroyed by: ', message.from);
            } else {
                message.reply('[!]Wrong password.');
            }
            break;

        case 'terminate':
            if (args.includes(securitySettings.superPassword)) {
                client.destroy();
                console.log('[!!!]Whatsapp connection destroyed by: ', message.from);
                process.exit();
            } else if (args.includes(securitySettings.moderatorPassword)) {
                message.reply('[!]Only OWNER is allowed to terminate the bot.');
            } else {
                message.reply('[!]Wrong password.');
            }
            break;

        case 'uploadBasePrompt':
            if ((args.includes(securitySettings.moderatorPassword) || args.includes(securitySettings.superPassword)) && message.hasMedia) {
                const media = await message.downloadMedia();
                if (media.filename.endsWith('.JSON')) {
                    fs.writeFileSync(path.join(__dirname, 'basePrompt', media.filename), media.data);
                    console.log('[!!!]New base prompt uploaded by: ', message.from);
                    message.reply('[!]Base prompt uploaded successfully.');
                } else {
                    message.reply('[!]Invalid file format or illegal file.');
                }
            } else {
                message.reply('[!]Wrong password or no file attached.');
            }
            break;

        case 'allowMedia':
            //  Todo : Implement this after setting up the Ollama tool calling.
            break;

        case 'uploadPfp':
            if ((args.includes(securitySettings.moderatorPassword) || args.includes(securitySettings.superPassword)) && message.hasMedia) {
                const media = await message.downloadMedia();
                if (await client.setProfilePicture(media)) {
                    console.log('[!!]Profile picture changed by: ', message.from);
                    message.reply('[!]Profile picture changed successfully.');
                } else {
                    message.reply('[!]Failed to change profile picture.');
                }
            } else {
                message.reply('[!]Wrong password or no photo attached.');
            }
            break;

        case 'setStatus':
            await client.setStatus(args.join(' '));
            console.log('[!!]Status updated by: ', message)
            message.reply('[!]Status updated successfully.');
            break;

        case 'setName':
            if (args.includes(securitySettings.superPassword) || args.includes(securitySettings.moderatorPassword)) {
                const newName = args.splice(0, 1).join(' ');
                if (newName.includes(securitySettings.superPassword) || newName.includes(securitySettings.moderatorPassword)) {
                    message.reply('[!]Invalid name.');
                } else {
                    await client.setDisplayName(newName);
                    console.log('[!!]Client name changed by: ', message.from);
                    message.reply('[!]Client name changed successfully.');
                }
            } else {
                message.reply('[!]Wrong password.');
            }
            break;

        case 'available':
            if (args.includes(securitySettings.superPassword) || args.includes(securitySettings.moderatorPassword)) {
                await client.sendPresenceAvailable();
                console.log('[!!]Client is now marked as online by: ', message.from);
                message.reply('[!]Client is now marked online.');
            } else {
                message.reply('[!]Wrong password.');
            }
            break;

        case 'unavailable':
            if (args.includes(securitySettings.superPassword) || args.includes(securitySettings.moderatorPassword)) {
                await client.sendPresenceUnavailable();
                console.log('[!!]Client is now marked as offline by: ', message.from);
                message.reply('[!]Client is now marked offline.');
            } else {
                message.reply('[!]Wrong password.');
            }
            break;

        case 'registerChat':
            if (!fs.existsSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')))) {
                fs.writeFileSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')), '');
                console.log('[!!]New chat registered at: ', message.from);
                message.reply('[!]Chat registered.');
            } else {
                message.reply('[!]This chat is registered.');
            }
            break;

        case 'deregisterChat':
            if (fs.existsSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')))) {
                fs.unlinkSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')));
                console.log('[!!]Chat deregistered at: ', message.from);
                message.reply('[!]Chat deregistered.');
            } else {
                message.reply('[!]This chat is not registered.');
            }
            break;

        case 'history':
            if (fs.existsSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')))) {
                const packagedJson = new MessageMedia.fromFilePath(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')));
                message.reply(packagedJson);
                console.log('[!]Chat history sent to: ', message.from);
            } else {
                message.reply('[!]No chat history found.');
            }
            break;

        case 'introduce':
            const contacts = JSON.parse(fs.readFileSync(path.join(__dirname, 'chatHistory', 'contacts.json'), 'utf-8'));
            if (contacts.includes(message.from)) {
                contacts.splice(contacts.indexOf(message.from), 1);
                contacts.push({[message.from]: args.join(' ')})
                fs.writeFileSync(path.join(__dirname, 'chatHistory', 'contacts.json'), contacts)
                console.log('[!]Contact updated by:', message.from);
                message.reply('[!]Your name to the bot is updated.')
            } else {
                contacts.push({[message.from]: args.join(' ')})
                fs.writeFileSync(path.join(__dirname, 'chatHistory', 'contacts.json'), contacts)
                console.log('[!]Contact updated by:', message.from);
                message.reply('[!]Your name to the bot is updated.')
            }
            break;

        case 'lobotomy':
            if (fs.existsSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')))) {
                fs.unlinkSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')));
                fs.writeFileSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')), '');
                console.log('[!]Chat history reset by: ', message.from);
                message.reply('[!]Chat history reset.')
            } else {
                message.reply('[!]This chat is not registered.')
            }
            break;

        case 'systemPrompt':
            const newSystemPrompt = args.join(' ');
            if (fs.existsSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')))) {
                const tempHistory = JSON.parse(fs.readFileSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')), 'utf-8'));
                tempHistory.push({system: newSystemPrompt});
                fs.writeFileSync(path.join(__dirname, 'chatHistory', message.from.replaceAll(/[^a-zA-Z0-9]/g, '-')), JSON.stringify(tempHistory));
                console.log('[!]System prompt updated by: ', message.from);
                message.reply('[!]System prompt updated.');
            } else {
                message.reply('[!]This chat is not registered.');
            }
            break;

        case 'help':
            const help = "Your current role is ADMIN. Available commands:\n\n" +
                         "!setAdmin [userID]\n" +
                         "!setModerator [userID]\n" +
                         "!setUser [userID]\n" +
                         "!setBanned [userID]\n" +
                         "!changePassword [oldModeratorPassword] [newModeratorPassword]\n" +
                         "!whatsappDisconnect [moderatorPassword]\n" +
                         "!terminate [superPassword]\n" +
                         "!uploadBasePrompt [moderatorPassword] (uploaded JSON file attached to this message)\n" +
                         "!uploadPfp [moderatorPassword] (uploaded photo attached to this message)\n" +
                         "!setStatus [newStatus]\n" +
                         "!setName [moderatorPassword] [newName]\n" +
                         "!available [moderatorPassword]\n" +
                         "!unavailable [moderatorPassword]\n" +
                         "!registerChat\n" +
                         "!deregisterChat\n" +
                         "!history\n" +
                         "!introduce [yourName]\n" +
                         "!lobotomy\n" +
                         "!systemPrompt [newSystemPrompt]";
            message.reply(help);
            break;

        default:
            message.reply('[!]Unknown command. Type !help for available commands.');
            break;
    }
}


/**
 * These are the moderator commands, they are accessible to the moderators.
 */


function moderatorCommand(command, args) {

}


/**
 * These are the user commands, they are accessible to all users.
 */

function userCommand(command, args) {

}


/**
 * These are the commands for unknown users. Basic commands only.
 */
