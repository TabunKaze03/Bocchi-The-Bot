const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
// const { default: ollama } = require('ollama');
// const { search, translate } = require('@navetacandra/ddg');

const commandPanel = require('./commandPanel');


/**
 * Initiates the working environment for the bot, creates folders and files.
 */

function init() {
    try {
        if (!fs.existsSync(path.join(__dirname, 'whatsappSessions'))) {
            fs.mkdirSync(path.join(__dirname, 'whatsappSessions'));
        }
        if (!fs.existsSync(path.join(__dirname, 'chatHistory'))) {
            fs.mkdirSync(path.join(__dirname, 'chatHistory'));
            fs.writeFileSync(path.join(__dirname, 'chatHistory', 'contacts.json'), JSON.stringify({

            }));
        }
        if (!fs.existsSync(path.join(__dirname, 'whatsappMedia'))) {
            fs.mkdirSync(path.join(__dirname, 'whatsappMedia'));
        }
        if (!fs.existsSync(path.join(__dirname, 'basePrompt'))) {
            fs.mkdirSync(path.join(__dirname, 'basePrompt'));
        }
        if (!fs.existsSync(path.join(__dirname, 'securitySetting'))) {
            fs.mkdirSync(path.join(__dirname, 'securitySetting'));
        }
        if (!fs.existsSync(path.join('securitySetting', 'security.json'))) {
            fs.writeFileSync(path.join('securitySetting', 'security.json'), JSON.stringify({
                admin: [],
                moderator: [],
                user: [],
                banned: [],
                superPassword: '7355608',
                moderatorPassword: '123456'
            }));
        }
    } catch (err) {
        console.log('An error occurred while initializing the environment: ', err);
    }
}

function getSecuritySettings() {
    let securitySettings;
    try {
        securitySettings = JSON.parse(fs.readFileSync(path.join(__dirname, 'securitySetting', 'security.json'), 'utf-8'));
    } catch (err) {
        console.log('An error occurred while reading security settings: ', err);
        process.exit(4);
    }
}

function createWhatsappConnection() {
    let client;
    client = new Client({
        authStrategy: new LocalAuth({dataPath: path.join(__dirname, 'whatsappSessions')}),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        qrMaxRetries: 10
        //  You may add more options here.
    });

    client.on('qr', (qr) => {
        qrcode.generate(qr, {small: true});
    });

    client.initialize().then(r =>
        console.log('Whatsapp connection initialized')
    ).catch(err => {
        console.log('An error occurred while initializing the Whatsapp connection ', err);
        console.log('Attempting to clear the current session folder...');
        try {
            fs.rmdirSync(path.join(__dirname, 'whatsappSessions'), {recursive: true});
            console.log('Session folder cleared, retrying...');
            createWhatsappConnection();
        } catch (err) {
            console.log('An error occurred while clearing the session folder: ', err);
            process.exit(5);
        }
    });
}

init();

getSecuritySettings();

createWhatsappConnection();

module.exports = [createWhatsappConnection, getSecuritySettings];