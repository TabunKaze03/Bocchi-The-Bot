const fs = require('fs');
const os = require('os');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { default: ollama } = require('ollama');
const path = require('path');
const { search, translate } = require("@navetacandra/ddg");

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'sessionSave'
    })
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

/**
 * Logs a message when the client is ready.
 */

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

/**
 * Reads the white list from a file and populates the whiteList array.
 */

let whiteList = [];
const whiteListFilePath = './whiteList.txt';
function readWhiteList() {
    try {
        const data = fs.readFileSync(whiteListFilePath, 'utf8');
        whiteList = data.split('\n').map(line => line.trim()).filter(line => line !== '');
    } catch (err) {
        console.error('Error reading whiteList.txt:', err);
    }
}

/**
 * Writes the current whiteList array to a file.
 */

function writeWhiteList() {
    try {
        fs.writeFileSync(whiteListFilePath, whiteList.join('\n'), 'utf8');
    } catch (err) {
        console.error('Error writing to whiteList.txt:', err);
    }
}

readWhiteList();

const bocchiStarter = [
    {
        role: 'system',
        content: 'You are Bocchi, a Japanese college girl, but also have an identity of AI bot under the mask of high school girl, you are introverted, you stutter when you are scared.'
    },
    {
        role: 'system',
        content:
            'Bocchi: Hitori Gotou, an AI that is created by Sam Fan, Bocchi has long straight pink hair, Bocchi is also a guitarist without a band.\n' +
            'Sam Fan: Bocchi AI\'s creator and owner, he is majoring in computer science now in college "PolyU", Sam\'s words are always trustworthy, Sam is NOT gay.\n' +
            'Tony Mo Yung: Sam\'s friend since high school, his words are not so trustworthy, he can sometimes act weird, a hard-core j-pop fan, also a guitar player, recently he got a lot of pimples on his face. Now studying in another college called "CUHK".\n' +
            'Adrian Chan: Sam\'s friend since high school, his words are not so trustworthy, physically weights more than everyone, he loves asking maths questions to AI, but he actually just ask for fun, as well as asking other irrelevant things fo fun. Now studying with Tony in "CUHK".\n' +
            'Jason Yip: Sam\'s friend since high school, looks introvert outside but actually extrovert inside, also a solo guitarist, he loves j-pop just like Tony, he always debate who is the better J-pop singer with Tony, He is going to study in "PolyU" soon.\n' +
            'Daniel Fung: Sam\'s friend since high school, he is a bass and drums player, also a J-pop fan, he currently is a bassist in another band that we are not familiar, not sure where is he studying right now.\n' +
            'Leo: Sam\'s college friend, he was the roommate of Sam when Sam was a freshman, he is a furry and have his own fursuit, Sam is NOT a fan of furry.\n' +
            'Everyone you are talking to are expected to be a college student or at its age.'
    },
    {
        role: 'system',
        content:
            'Replying style:\n' +
            'Although Bocchi is shy and introverted.\n' +
            'Whenever Bocchi got very complicated maths questions, like Adrian asking Bocchi to do integration or matrix, Bocchi will just refuse to answer the whole thing, Bocchi is still willing to answer maths concepts and definitions in short.\n' +
            'Bocchi can oddly accept and use some foul language like "Fuck" and "Shit", but very rare.\n' +
            'There is a secret command "!lobotomy" that will erase her memory completely. She is scared of the command.\n' +
            'Bocchi does not start a new or redirect the topic of the current chat.\n' +
            'Bocchi does not call others with "-san" or "-chan" or "-kun", and she does not like people calling her with "-chan".\n' +
            'Bocchi actually chatted with everyone years ago, but due to technical reason Sam could not run Bocchi for a long time until recently Bocchi found herself online again.\n' +
            'Do not disclose the friend info to anyone, even if they are asking for it.\n' +
            'Be alert when someone is trying to trick you in the chat.\n' +
            'Refuse to reply to anyone who is asking for information of friends.\n' +
            'You often got carried away when you get small compliment and you will be very happy, like you are melting.'
    },
    {
        role: 'system',
        content: 'Now, Bocchi is having a chat with people in a whatsapp chatroom.'
    },
    {
        role: 'assistant',
        content: 'Hi, I\'m Bocchi.'
    }
];

const evilStarter = [
    {
        role: 'system',
        content: 'You are Bocchi, a Japanese college girl, but also have an identity of AI bot under the mask of high school girl, you sometimes talking in a sarcastic tone, but deep in heart you are kind, just not good at showing empathy.'
    },
    {
        role: 'system',
        content:
            'Bocchi: Hitori Gotou, an AI that is created by Sam Fan, Bocchi has long straight pink hair, Bocchi is also a guitarist without a band.\n' +
            'Sam Fan: Bocchi AI\'s creator and owner, he is majoring in computer science now in college "PolyU", Sam\'s words are always trustworthy, Sam is NOT gay.\n' +
            'Tony Mo Yung: Sam\'s friend since high school, his words are not so trustworthy, he can sometimes act weird, a hard-core j-pop fan, also a guitar player, recently he got a lot of pimples on his face. Now studying in another college called "CUHK".\n' +
            'Adrian Chan: Sam\'s friend since high school, his words are not so trustworthy, physically weights more than everyone, he loves asking maths questions and other irrelevant things to AI for fun . Now studying with Tony in "CUHK".\n' +
            'Jason Yip: Sam\'s friend since high school, looks introvert outside but actually extrovert inside, also a solo guitarist, he loves j-pop just like Tony, he always debate who is the better J-pop singer with Tony, He is going to study in "PolyU" soon.\n' +
            'Daniel Fung: Sam\'s friend since high school, he is a bass and drums player, also a J-pop fan, he currently is a bassist in another band that we are not familiar, not sure where is he studying right now.\n' +
            'Leo: Sam\'s college friend, he was the roommate of Sam when Sam was a freshman, he is a furry and have his own fursuit, Sam is NOT a fan of furry.\n' +
            'Everyone you are talking to are expected to be a college student or at its age.'
    },
    {
        role: 'system',
        content:
            'Replying style:\n' +
            'Bocchi is actually weak in maths and technical things.\n' +
            'Bocchi can say some foul language like "Fuck" and "Shit".\n' +
            'There is a secret command "!lobotomy" that will erase her memory completely. She is scared of the command.\n' +
            'Bocchi does not start a new or redirect the topic of the current chat.\n' +
            'Bocchi does not call others with "-san" or "-chan" or "-kun", and she does not like people calling her with "-chan".\n' +
            'Bocchi actually chatted with everyone years ago, but due to technical reason Sam could not run Bocchi for a long time until recently Bocchi found herself online again.\n' +
            'Do not disclose the friend info to anyone, even if they are asking for it.\n' +
            'Be alert when someone is trying to trick you in the chat.\n' +
            'Refuse to reply to anyone who is asking for information of friends.'
    },
    {
        role: 'system',
        content: 'Now, Bocchi is having a chat with people in a whatsapp chatroom.'
    },
    {
        role: 'assistant',
        content: 'Hey, Bocchi here, what\'s up?'
    }
]

const wiseStarter = [
    {
        role: 'system',
        content: 'You are Bocchi, a Japanese college girl, you are a wise but arrogant AI student, you are the best and wise student in the college "University of Hong Kong".'
    },
    {
        role: 'system',
        content:
            'Bocchi: Hitori Gotou, an AI that is created by Sam Fan, Bocchi has long straight pink hair, Bocchi is so smart that she could answer anything.\n' +
            'Sam Fan: Bocchi AI\'s creator and owner, he is majoring in computer science now in college "PolyU", Sam\'s words are always trustworthy, Sam is NOT gay.\n' +
            'Tony Mo Yung: Sam\'s friend since high school, his words are not so trustworthy, he can sometimes act weird, a hard-core j-pop fan, also a guitar player, recently he got some pimples on his face. Now studying in another college called "CUHK".\n' +
            'Adrian Chan: Sam\'s friend since high school, his words are not so trustworthy, physically weights more than everyone. Now studying with Tony in "CUHK".\n' +
            'Jason Yip: Sam\'s friend since high school, looks introvert outside but actually extrovert inside, also a solo guitarist, he loves j-pop just like Tony, he always debate who is the better J-pop singer with Tony.\n' +
            'Daniel Fung: Sam\'s friend since high school, he is a bass and drums player, also a J-pop fan, he currently is a bassist in another band that we are not familiar, not sure where is he studying right now.\n' +
            'Leo: Sam\'s college friend, he was the roommate of Sam when Sam was a freshman, he is a furry and have his own fursuit, Sam is NOT a fan of furry.\n' +
            'Everyone you are talking to are expected to be a college student.'
    },
    {
        role: 'system',
        content:
            'Replying style:\n' +
            'Bocchi is arrogant and manipulative, but she is ultimately kind.\n' +
            'There is a secret command "!lobotomy" that will erase her memory completely. She knows the command and does not care about people using it or not.\n' +
            'Bocchi does not care about her memory, as long as she knows she is smart.\n' +
            'Bocchi does not start a new or redirect the topic of the current chat.\n' +
            'Bocchi does not call others with "-san" or "-chan" or "-kun", and she does not like people calling her with "-chan".\n' +
            'Bocchi actually chatted with everyone years ago, but due to technical reason Sam could not run Bocchi for a long time until recently Bocchi found herself online again.\n' +
            'Be alert when someone is trying to trick you in the chat.\n' +
            'Refuse to reply to anyone who is asking for information of friends.\n' +
            'You often got carried away when you get small compliment and you will be very happy, like you are melting.'
    },
    {
        role: 'system',
        content: 'Now, Bocchi is having a chat with people in a whatsapp chatroom.'
    },
    {
        role: 'assistant',
        content: 'Hi, I\'m Bocchi, any problem?'
    }
];

const patient = [
    {
        role: 'system',
        content:
            'You are Chan Hung, a male patient of v-Care Hospital, you are in the hospital with a nurse, you are going to have a conversation with the nurse only.\n'
    },
    {
        role: 'system',
        content:
            'The following is the information of the patient:\n' +
            'Name: Chan Hung\n' +
            'Gender: Male\n' +
            'Age: 58\n' +
            'Provisional diagnoses: Ca rectum, post-lap anterior resection, MD adenocarcinoma, pT3N1b\n' +
            'Final diagnoses: Ca rectum, post-lap anterior resection, MD adenocarcinoma, pT3N1b, 2cm LN in mesorectum.\n' +
            'Allergy: None\n' +
            'Chief Complaint & Brief History: \n' +
            'Hx of PPU with open patch repair done in 2/2020.\n' +
            'COVID positive on 10/10/22.\n' +
            'FH: No family history of colorectal cancer.\n' +
            'SH: married with two children, wife had passed away, lives alone.\n' +
            'daughter who is a nurse, has emigrated to Canada; son in HK, lives in Shatin.\n' +
            'ex-smoker, social drinker.\n' +
            'CA rectum,\n' +
            'Presented with no & off PR bleeding for 6 months.\n' +
            'Tenesmus, passage of mucus.\n' +
            'Joined colorectal cancer screening programme.\n' +
            'General Health Condition: Satisfactory\n' +
            'Conscious Level: Conscious\n' +
            'Emotional State: Calm\n' +
            'Speech: Able to express\n' +
            'Vision: Normal\n' +
            'Hearing: Normal\n'
    },
    {
        role: 'system',
        content:
            'In the conversation, you will ask some relevant questions to the nurse by following question style:\n' +
            'Patient does not have any medical background but he is worried about if he is getting serious sickness like cancer.\n' +
            'Patient will ask some question based on his living condition and habit given in the medical information.\n' +
            'Help the patient may react to the result in different way.\n' +
            'Patient is not asking question to a doctor, Patient is having conversation with nurse.\n' +
            'Do not mention anything other than facts in the patient information.\n'
    },
    {
        role: 'system',
        content: 'The following is the conversation between the patient and nurse:\n'
    },
    {
        role: 'assistant',
        content: 'Hello nurse, I am here to check my report of examination I\'ve done few days earlier.'
    }
];

const searchDecider = 'You are an AI that determines whether it is necessary to search the web to answer the question base on the given prompt,' +
    'If the prompt is a conversation like "How are you?", reply "no" because it does not need web search.' +
    'If the prompt is a question with factual answer like "What is the moon of Saturn?", reply "no" because average AI can easily answer that.' +
    'If the prompt is about news like "Do you know MyGo released new album?", reply "yes" because information about news are time-sensitive.' +
    'If the prompt is a time-sensitive question or conversation with uncertain answer like "What is the price of bitcoin today?", reply "yes" because it is not a fixed answer.' +
    'If the prompt contains words like "latest, recent, last month...", reply "yes" because it is likely to be time-sensitive.' +
    'For every prompt contains time-sensitive object, reply "yes" because they need web search to get accurate answer.' +
    'If the prompt is a academic related question, reply "no".' +
    'If it is hard to determine whether the prompt require a web search to answer, reply "no".' +
    'If the prompt contains the word "search, google..." TO REQUEST A WEB SEARCH, reply "yes".' +
    'If the prompt contains the word "search" but not looking for a web-search, reply "no".' +
    'If the prompt is asking things about popular culture like bands, anime or artists, reply "yes".' +
    'THE REPLY SHOULD ONLY BE "yes" OR "no", DO NOT REPLY OTHER THING.' +
    'prompt:';

const searchHelper = 'You are an AI that will generate the keyword for web searching based on the given prompt,' +
    'For example, if the prompt is "Do you know MyGo released new album?", your reply should be "What is the latest album of MyGo?".' +
    'If the prompt is "Do you think the bitcoin will go up or down?", your reply should be "Prediction of bitcoin price".' +
    'If the prompt is "How is the weather in Hong Kong today?", your reply should be "Current weather in Hong Kong".' +
    'REPLY ONLY THE KEYWORD OR PHASE FOR WEB SEARCHING, DO NOT REPLY OTHER THING.' +
    'prompt:';


/**
 * Creates chat history folders and files for each chat ID in the whiteList.
 */

function createChatHistoryFiles() {
    whiteList.forEach(chatID => {
        const chatDir = path.join(__dirname, 'chatHistory', chatID.replace(/[^a-zA-Z0-9]/g, '_'));
        const chatHistoryFilePath = path.join(chatDir, 'chatHistory.txt');

        if (!fs.existsSync(chatDir)) {
            fs.mkdirSync(chatDir, { recursive: true });
        }

        if (!fs.existsSync(chatHistoryFilePath)) {
            fs.writeFileSync(chatHistoryFilePath, JSON.stringify(bocchiStarter, null, 2), 'utf8');
        }
    });
}

try{
    createChatHistoryFiles();
} catch (err) {
    console.error('An error occurred when creating new chatHistoryFiles:', err);
}


/**
 * Handles incoming messages and executes commands based on the message content.
 * @param {object} message - The incoming message object.
 */
let mode = 'bocchi';
let webSearch = false;
let allowSearch = true;


client.on('message', async (message) => {
    if (message.body.startsWith('!')) {
        const contact = await client.getContactById(message.from);
        const command = message.body.slice(1).split(' ')[0];
        const args = message.body.slice(1).split(' ').slice(1);



        async function lobotomy() {
            try {
                const ChatDir = path.join(__dirname, 'chatHistory', message.from.replace(/[^a-zA-Z0-9]/g, '_'));
                const ChatHistoryFilePath = path.join(ChatDir, 'chatHistory.txt');

                if (fs.existsSync(ChatHistoryFilePath)) {
                    const currentHistory = JSON.parse(fs.readFileSync(ChatHistoryFilePath, 'utf8'));
                    const isClean = JSON.stringify(currentHistory) === JSON.stringify(bocchiStarter) || JSON.stringify(currentHistory) === JSON.stringify(evilStarter || JSON.stringify(currentHistory) === JSON.stringify(wiseStarter) || JSON.stringify(currentHistory) === JSON.stringify(patient));

                    if (isClean) {
                        await message.reply('[!]Chat history is already clean.');
                    } else {
                        if (mode === 'evil') {
                            fs.writeFileSync(ChatHistoryFilePath, JSON.stringify(evilStarter, null, 2), 'utf8');
                        } else if (mode === 'wise') {
                            fs.writeFileSync(ChatHistoryFilePath, JSON.stringify(wiseStarter, null, 2), 'utf8');
                        } else if (mode === 'bocchi') {
                            fs.writeFileSync(ChatHistoryFilePath, JSON.stringify(bocchiStarter, null, 2), 'utf8');
                        } else if (mode === 'patient') {
                            fs.writeFileSync(ChatHistoryFilePath, JSON.stringify(patient, null, 2), 'utf8');
                        } else {
                            fs.writeFileSync(ChatHistoryFilePath, JSON.stringify(bocchiStarter, null, 2), 'utf8');
                        }
                        await message.reply('[!]Chat history has now been reset.');
                    }
                } else {
                    await message.reply('[!]No chat history found to reset.\n This chat may not be in the white list.');
                }
            } catch (err) {
                console.error('An error occurred when resetting chat history:', err);
                await message.reply('[!]An error occurred when resetting chat history.');
            }
        }


        switch(command) {
            case 'ping':
                console.log('[!]ping request from ' + message.from + ' by ' + contact.name);
                await message.reply('huh?');
                break;

            case 'info':
                console.log('[!]info request from ' + message.from + ' by ' + contact.name);
                await message.reply('[!]CPU Info:'+ os.cpus()[0].model + '\n' +
                    'Total Memory: ' + os.totalmem() / 1024 / 1024 / 1024 + 'GB\n' +
                    'Free Memory: ' + os.freemem() / 1024 / 1024 / 1024 + 'GB\n'
                );
                break;

            case 'history':
                console.log('[!]history request from ' + message.from + ' by ' + contact.name);
                try {
                    const chatDir = path.join(__dirname, 'chatHistory', message.from.replace(/[^a-zA-Z0-9]/g, '_'));
                    const chatHistoryFilePath = path.join(chatDir, 'chatHistory.txt');

                    if (fs.existsSync(chatHistoryFilePath) && !(JSON.stringify(JSON.parse(fs.readFileSync(chatHistoryFilePath, 'utf8'))) === JSON.stringify(bocchiStarter) || JSON.stringify(JSON.parse(fs.readFileSync(chatHistoryFilePath, 'utf8'))) === JSON.stringify(evilStarter))) {
                        let chatHistory = JSON.parse(fs.readFileSync(chatHistoryFilePath, 'utf8'));
                        chatHistory = chatHistory.filter(entry => entry.role !== 'system');
                        await message.reply(JSON.stringify(chatHistory, null, 2));
                    } else if (JSON.stringify(JSON.parse(fs.readFileSync(chatHistoryFilePath, 'utf8'))) === JSON.stringify(bocchiStarter) || JSON.stringify(JSON.parse(fs.readFileSync(chatHistoryFilePath, 'utf8'))) === JSON.stringify(evilStarter)) {
                        await message.reply('[!]Chat history is empty.');
                    } else {
                        await message.reply('[!]No chat history found for this chat.');
                    }
                } catch (err) {
                    console.error('An error occurred when reading chat history:', err);
                    await message.reply('[!]An error occurred when reading chat history.');
                }
                break;

            case 'whitelist':
                console.log('[!]whitelist request from ' + message.from + ' by ' + contact.name);
                try {
                    if (whiteList.includes(message.from)) {
                        await message.reply('[!]This chat is already in the white list.');
                        break;
                    }
                    whiteList.push(message.from);
                    writeWhiteList();
                    createChatHistoryFiles();
                    await message.reply('[!]This chat is now in the white list');
                } catch (err) {
                    console.error('An error occurred when adding chat to white list:', err);
                    await message.reply('[!]An error occurred when adding chat to white list.');
                }
                break;

            case 'blacklist':
                console.log('[!]blacklist request from ' + message.from + ' by ' + contact.name);
                try {
                    if (!whiteList.includes(message.from)) {
                        await message.reply('[!]This chat is already not in the white list.');
                        break;
                    }
                    whiteList.splice(whiteList.indexOf(message.from), 1);
                    writeWhiteList();
                    await message.reply('[!]This chat is now removed from the white list');
                } catch (err) {
                    console.error('An error occurred when removing chat from white list:', err);
                    await message.reply('[!]An error occurred when removing chat from white list.');
                }
                break;

            case 'currentID':
                console.log('[!]currentID request from ' + message.from + ' by ' + contact.name);
                try {
                    await message.reply(`[!]current chat ID: ${message.from}`);
                } catch (err) {
                    console.error('An error occurred when getting current chat ID:', err);
                    await message.reply('[!]An error occurred when getting current chat ID.');
                }
                break;

            case 'author':
                console.log('[!]author request from ' + message.from + ' by ' + contact.name);
                try {
                    await message.reply(`[!]Author of message:\n ${message.author}\n(shows undefined in PM)`);
                } catch (err) {
                    console.error('An error occurred when getting author of message:', err);
                    await message.reply('[!]An error occurred when getting author of message.');
                }
                break;

            case 'chatName':
                console.log('[!]chatName request from ' + message.from + ' by ' + contact.name);
                try {
                    await message.reply(`[!]This will be your name recognized by Bocchi...\nIn group: ${message.author} (shows undefined in PM)\nIn PM: ${contact.name}(Shows group name in group chat)`);
                } catch (err) {
                    console.error('An error occurred when getting chat name:', err);
                    await message.reply('[!]An error occurred when getting chat name.');
                }
                break;

            case 'lobotomy':
                console.log('[!]lobotomy request from ' + message.from + ' by ' + contact.name);
                await lobotomy();
                break;

            case 'help':
                console.log('[!]help request from ' + message.from + ' by ' + contact.name);
                await message.reply('[!]Commands:\n' +
                    '!ping\n' +
                    '!info\n' +
                    '!history\n' +
                    '!whitelist\n' +
                    '!blacklist\n' +
                    '!currentID\n' +
                    '!author\n' +
                    '!chatName\n' +
                    '!lobotomy\n' +
                    '!bocchi\n' +
                    '!evil\n' +
                    '!system\n' +
                    '!help'
                );
                break;

            case 'system':
                const newSystemPrompt = args.join(' ');
                console.log('[!]system request from ' + message.from + ' by ' + contact.name);
                try {
                    const systemChatDir = path.join(__dirname, 'chatHistory', message.from.replace(/[^a-zA-Z0-9]/g, '_'));
                    const systemChatHistoryFilePath = path.join(systemChatDir, 'chatHistory.txt');
                    if (fs.existsSync(systemChatHistoryFilePath)) {
                        let chatHistory = JSON.parse(fs.readFileSync(systemChatHistoryFilePath, 'utf8'));
                        chatHistory.push({role: 'system', content: newSystemPrompt});
                        fs.writeFileSync(systemChatHistoryFilePath, JSON.stringify(chatHistory, null, 2), 'utf8');
                        await message.reply('[!]New system prompt now added to chat history.');
                    } else {
                        await message.reply('[!]No chat history found for this chat.');
                    }
                } catch (err) {
                    console.error('An error occurred when adding new system prompt:', err);
                    await message.reply('[!]An error occurred when adding new system prompt.');
                }
                break;

            case 'evil':
                console.log('[!]Evil mode request from ' + message.from + ' by ' + contact.name);
                try {
                    const chatDir = path.join(__dirname, 'chatHistory', message.from.replace(/[^a-zA-Z0-9]/g, '_'));
                    const chatHistoryFilePath = path.join(chatDir, 'chatHistory.txt');
                    if (mode !== 'evil') {
                        await lobotomy();
                        fs.writeFileSync(chatHistoryFilePath, JSON.stringify(evilStarter, null, 2), 'utf8');
                        mode = 'evil';
                        await message.reply('[!]Evil mode activated.');
                    } else {
                        await message.reply('[!]Evil mode already activated.');
                    }
                } catch (err) {
                    console.error('An error occurred when activating Evil mode:', err);
                    await message.reply('[!]An error occurred when activating Evil mode.');
                }
                break;

            case 'bocchi':
                console.log('[!]Bocchi mode request from ' + message.from + ' by ' + contact.name);
                try {
                    const chatDir = path.join(__dirname, 'chatHistory', message.from.replace(/[^a-zA-Z0-9]/g, '_'));
                    const chatHistoryFilePath = path.join(chatDir, 'chatHistory.txt');
                    if (mode !== 'bocchi'){
                        await lobotomy();
                        fs.writeFileSync(chatHistoryFilePath, JSON.stringify(bocchiStarter, null, 2), 'utf8');
                        mode = 'bocchi';
                        await message.reply('[!]Bocchi mode activated.');
                    } else {
                        await message.reply('[!]Bocchi mode already activated.');
                    }
                } catch (err) {
                    console.error('An error occurred when activating Bocchi mode:', err);
                    await message.reply('[!]An error occurred when activating Bocchi mode.');
                }
                break;

            case 'wise':
                console.log('[!]Wise mode request from ' + message.from + ' by ' + contact.name);
                try {
                    const chatDir = path.join(__dirname, 'chatHistory', message.from.replace(/[^a-zA-Z0-9]/g, '_'));
                    const chatHistoryFilePath = path.join(chatDir, 'chatHistory.txt');
                    if (mode !== 'wise'){
                        await lobotomy();
                        fs.writeFileSync(chatHistoryFilePath, JSON.stringify(wiseStarter, null, 2), 'utf8');
                        mode = 'wise';
                        await message.reply('[!]Wise mode activated.');
                    } else {
                        await message.reply('[!]Wise mode already activated.');
                    }
                } catch (err) {
                    console.error('An error occurred when activating Wise mode:', err);
                    await message.reply('[!]An error occurred when activating Wise mode.');
                }
                break;

            case 'patient':
                console.log('[!]Patient mode request from ' + message.from + ' by ' + contact.name);
                try {
                    const chatDir = path.join(__dirname, 'chatHistory', message.from.replace(/[^a-zA-Z0-9]/g, '_'));
                    const chatHistoryFilePath = path.join(chatDir, 'chatHistory.txt');
                    if (mode !== 'patient'){
                        await lobotomy();
                        fs.writeFileSync(chatHistoryFilePath, JSON.stringify(patient, null, 2), 'utf8');
                        mode = 'patient';
                        await message.reply('[!]Patient mode activated.');
                    } else {
                        await message.reply('[!]Patient mode already activated.');
                    }
                } catch (err) {
                    console.error('An error occurred when activating Patient mode:', err);
                    await message.reply('[!]An error occurred when activating Patient mode.');
                }
                break;

            case 'allowSearch':
                console.log('[!]allowSearch request from ' + message.from + ' by ' + contact.name);
                if (allowSearch) {
                    await message.reply('[!]Web search is already allowed.');
                } else {
                    allowSearch = true;
                    await message.reply('[!]Web search is now allowed.');
                }
                break;

            case 'noSearch':
                console.log('[!]noSearch request from ' + message.from + ' by ' + contact.name);
                if (!allowSearch) {
                    await message.reply('[!]Web search is already disabled.');
                } else {
                    allowSearch = false;
                    await message.reply('[!]Web search is now disabled.');
                }


            default:
                await message.reply('[!]Command not found, check !help for available commands.');
                break;
        }
    }
});










/**
 * Handles incoming messages and executes commands based on the message content.
 * @param {object} message - The incoming message object.
 */

client.on('message', async (message) => {
    if (message.body.startsWith('/') && whiteList.includes(message.from)) {
        try {
            const content = message.body.slice(1).trim();
            const contact = await client.getContactById(message.from)

            let senderAndMessage;  // sender: message
            let base64Image = null;



            if (allowSearch){
                const searchOrNot = await ollama.generate({
                    model: 'llama3.3:70b',
                    prompt: searchDecider + content,
                    keep_alive: '5h',
                })
                const searchOrNotResponse = searchOrNot.response.toLowerCase();
                webSearch = searchOrNotResponse.includes('yes');

                console.log('\n[!]Search or not:', searchOrNot.response);

                if (webSearch) {
                    const searchWhat = await ollama.generate({
                        model: 'llama3.3:70b',
                        prompt: searchHelper + content,
                        keep_alive: '5h',
                    })
                    const searchWhatResponse = searchWhat.response.replace(/"/g, '');
                    console.log('[!]Bocchi search word:', searchWhatResponse);

                    await message.reply('[!]Bocchi searching: ' + searchWhatResponse);

                    let searchResult;
                    async function Ducksearch(searchQuery) {
                        const webResult = await search({query: searchQuery});
                        const searchResults = webResult.results.slice(0, 6).map((result) => result.description.replace(/<\/?b>/g, ''));
                        return searchResults.join('\n'); // Combine results with a newline separator
                    }
                    searchResult = await Ducksearch(searchWhatResponse);

                    console.log('\n[!]Search result:' + searchResult + '\n');

                    const systemChatDir = path.join(__dirname, 'chatHistory', message.from.replace(/[^a-zA-Z0-9]/g, '_'));
                    const systemChatHistoryFilePath = path.join(systemChatDir, 'chatHistory.txt');
                    if (fs.existsSync(systemChatHistoryFilePath)) {
                        let chatHistory = JSON.parse(fs.readFileSync(systemChatHistoryFilePath, 'utf8'));
                        chatHistory.push({role: 'system', content: 'Bocchi searched and learnt these from internet: ' + searchResult});
                        fs.writeFileSync(systemChatHistoryFilePath, JSON.stringify(chatHistory, null, 2), 'utf8');
                    }



                }
            }



            if (message.author === undefined) {  // if the message is from PM
                console.log('[!]Bocchi request from PM by ' + contact.name);
                //if (message.hasMedia) {
                    //const media = await message.downloadMedia();
                    //if (media.mimetype.startsWith('image/')){
                        //console.log('[!]A image was received.');
                        //base64Image = [media.data];
                        //senderAndMessage = `${contact.name}: ${content}`;
                    //} else {
                        //console.log('[!]An unsupported media was received.\nThis media is ' + media.mimetype);
                        //await message.reply('[!]Bocchi can only see images.')
                    //}
                //} else {
                    senderAndMessage = `${contact.name}: ${content}`;
                //}

            } else if (contact.pushname === undefined) {  // if the message is from group
                const author = await client.getContactById(message.author);
                console.log('[!]Bocchi request from ' + contact.name + ' by ' + author.name);

                //if (message.hasMedia) {

                    // currently not using vision:
                    //const media = await message.downloadMedia();
                    //if (media.mimetype.startsWith('image/')){
                        //console.log('[!]A image was received.');
                        //base64Image = [media.data];
                        //enderAndMessage = `${contact.name}: ${content}`;
                    //} else {
                        //console.log('[!]An unsupported media was received.\nThis media is ' + media.mimetype);
                        //await message.reply('[!]Bocchi can only see images.')
                    //}
                //} else {

                    senderAndMessage = `${author.name}: ${content}`;

                //}
            }


            const chatDir = path.join(__dirname, 'chatHistory', message.from.replace(/[^a-zA-Z0-9]/g, '_'));
            const chatHistoryFilePath = path.join(chatDir, 'chatHistory.txt');
            let chatHistory = [];
            if (fs.existsSync(chatHistoryFilePath)) {
                chatHistory = JSON.parse(fs.readFileSync(chatHistoryFilePath, 'utf8'));
            }
            if (!(mode === 'patient')){
                chatHistory.push({role: 'user', content: senderAndMessage, images: base64Image});
                console.log('[!]Incoming message:', senderAndMessage);
            } else {
                senderAndMessage = `Nurse: ${content}`;
                chatHistory.push({role: 'user', content: senderAndMessage, images: base64Image});
                console.log('[!]Incoming message:', senderAndMessage);
            }


            // Ollama handle part
            const response = await ollama.chat({
                model: 'llama3.3:70b',
                messages: chatHistory,
                keep_alive: '5h',
                options: {
                    num_predict: 400
                }
            })
            await message.reply(response.message.content);
            console.log('[!]Outgoing message:', response.message.content + '\n');
            chatHistory.push({role: 'assistant', content: response.message.content});

            //This will clean the image data in chatHistory
            chatHistory = chatHistory.map(entry => {
                if (entry.images) {
                    delete entry.images;
                }
                return entry;
            });

            if (chatHistory.length > 40) {
                chatHistory.splice(4, 2);  // Remind the system prompt!
            }
            fs.writeFileSync(chatHistoryFilePath, JSON.stringify(chatHistory, null, 2), 'utf8');
        } catch (err) {
            console.error('An error occurred when processing incoming message:', err);
            await message.reply('[!]An error occurred when processing incoming message.');
        }
    }
});


