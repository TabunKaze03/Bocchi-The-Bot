const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { client } = require('./WhatsLLM')
/**
 * Script is for the command panel accessible from Whatsapp side.
 * A connection to Whatsapp is expected when this script runs.
 */

/**
 * Whatsapp message handler.
 */


client.on('message', async (message) => {

});



/**
 * These are the admin commands, they are only accessible to the admin.
 */

function adminCommand(){

}


/**
 * These are the moderator commands, they are accessible to the moderators.
 */


function moderatorCommand(){

}


/**
 * These are the user commands, they are accessible to all users.
 */

function userCommand(){

}


