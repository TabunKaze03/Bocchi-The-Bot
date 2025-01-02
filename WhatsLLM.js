const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { default: ollama } = require('ollama');
const { search, translate } = require('@navetacandra/ddg');


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
        if (!fs.existsSync(path.join('secuitySetting', 'security.json'))) {
            fs.writeFileSync(path.join('securitySetting', 'security.json'), JSON.stringify({}));
        }
    } catch (err) {
        console.log('An error occured while initializing the environment: ', err);
    }
}



