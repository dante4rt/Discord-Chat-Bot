const Discord = require('./discord');
const colors = require('colors');
const fs = require('fs');
const quoteEN = require('./quotes-en.json');
const quoteID = require('./quotes-id.json');
const readlineSync = require('readline-sync');

let botToken = process.env.BOT_TOKEN || '';
let channelId = process.env.CHANNEL_ID || '';
let mode = process.env.MODE || 'quote-id';
let delay = process.env.DELAY || 1000;
let delAfter = process.env.DEL_AFTER || '';
let repostLastChat = process.env.REPOST_LAST_CHAT || 50;

function promptUser() {
    botToken = readlineSync.question('Enter your Discord bot token: ', { defaultInput: botToken });
    channelId = readlineSync.question('Enter the channel ID: ', { defaultInput: channelId });
    mode = readlineSync.question('Enter the mode (quote-id, quote-en, repost): ', { defaultInput: mode });
    delay = readlineSync.questionInt('Enter the delay in milliseconds (1000ms = 1s): ', { defaultInput: delay });
    delAfter = readlineSync.question('Enter the delete delay in milliseconds (leave blank if not needed): ', { defaultInput: delAfter });

    while (!['quote-id', 'quote-en', 'repost'].includes(mode.toLowerCase())) {
        console.log(colors.red('Invalid mode! Please enter a valid mode.'));
        mode = readlineSync.question('Enter the mode (quote-id, quote-en, repost): ', { defaultInput: mode });
    }

    while (isNaN(delay) || delay <= 0) {
        console.log(colors.red('Invalid delay! Please enter a positive number.'));
        delay = readlineSync.questionInt('Enter the delay in milliseconds (1000ms = 1s): ', { defaultInput: delay });
    }

    while (delAfter !== '' && (isNaN(delAfter) || delAfter < 0)) {
        console.log(colors.red('Invalid delete delay! Please enter a non-negative number or leave it blank.'));
        delAfter = readlineSync.question('Enter the delete delay in milliseconds (leave blank if not needed): ', { defaultInput: delAfter });
    }

    if (mode.toLowerCase() === 'repost') {
        while (isNaN(repostLastChat) || repostLastChat <= 0) {
            console.log(colors.red('Invalid number of last chat messages for repost! Please enter a positive number.'));
            repostLastChat = readlineSync.questionInt('Enter the number of last chat messages for repost: ', { defaultInput: repostLastChat });
        }
    }

    const backupData = `BOT_TOKEN = ${botToken}\nCHANNEL_ID = ${channelId}\nMODE = ${mode}\nDELAY = ${delay}\nDEL_AFTER = ${delAfter}\nREPOST_LAST_CHAT = ${repostLastChat}`;
    fs.writeFileSync('backup.txt', backupData);
}

function askForSettings() {
    const usePreviousSettings = readlineSync.keyInYNStrict('Do you want to use the previous settings?');
    if (usePreviousSettings) {
        const backupContent = fs.readFileSync('backup.txt', 'utf8');
        const lines = backupContent.split('\n');
        lines.forEach(line => {
            const [key, value] = line.split('=').map(entry => entry.trim());
            if (key && value) {
                switch (key) {
                    case 'BOT_TOKEN':
                        botToken = value;
                        break;
                    case 'CHANNEL_ID':
                        channelId = value;
                        break;
                    case 'MODE':
                        mode = value;
                        break;
                    case 'DELAY':
                        delay = parseInt(value);
                        break;
                    case 'DEL_AFTER':
                        delAfter = value;
                        break;
                    case 'REPOST_LAST_CHAT':
                        repostLastChat = parseInt(value);
                        break;
                    default:
                        break;
                }
            }
        });
    } else {
        promptUser();
    }
}

if (fs.existsSync('backup.txt') && fs.statSync('backup.txt').size > 0) {
    askForSettings();
} else {
    promptUser();
}

let bot;

try {
    bot = new Discord(botToken);
} catch (error) {
    console.error(colors.red('Error initializing Discord bot:'), error.message);
    process.exit(1); 
}

async function getRandomQuoteID() {
    const randomIndex = Math.floor(Math.random() * quoteID.length);
    return quoteID[randomIndex].quote;
}

async function getRandomQuoteEN() {
    const randomIndex = Math.floor(Math.random() * quoteEN.length);
    return quoteEN[randomIndex].text;
}

bot.getUserInformation().then(userInfo => {
    const me = userInfo.username + '#' + userInfo.discriminator;
    console.log(colors.green('Logged in as %s'), me);
}).catch(error => {
    console.error(colors.red('Error getting user information:'), error.message);
});

console.log(colors.yellow('MODE: %s'), mode);

function processMessage(_, contentCallback) {
    bot.getMessagesInChannel(channelId, 1).then(messageData => {
        contentCallback(messageData.reverse()[0].content).then(response => {
            bot.sendMessageToChannel(channelId, response).then(sentMessage => {
                const sentMessageContent = sentMessage.content;
                console.log(colors.green('[SEND][%s] %s'), sentMessage.id, sentMessageContent);
                if (delAfter) {
                    setTimeout(() => {
                        bot.deleteMessageInChannel(channelId, sentMessage.id).then(deletedMessage => {
                            if (deletedMessage) {
                                console.log(colors.red('[DELETE][%s] %s'), deletedMessage.id, sentMessageContent);
                            } else {
                                console.log(colors.red('[DELETE][%s] Deleted successfully'), sentMessage.id);
                            }
                        }).catch(error => {
                            console.error(colors.red('[DELETE] Error:'), error.message);
                        });
                    }, delAfter);
                }
            });
        });
    });
}

switch (mode) {
    case 'quote-id':
        setInterval(() => processMessage(null, getRandomQuoteID), delay);
        break;
    case 'quote-en':
        setInterval(() => processMessage(null, getRandomQuoteEN), delay);
        break;
    case 'repost':
        setInterval(() => processMessage(repostLastChat, content => Promise.resolve(content)), delay);
        break;
    default:
        console.log(colors.yellow('[!] Available modes: quote-id, quote-en, repost'));
}
