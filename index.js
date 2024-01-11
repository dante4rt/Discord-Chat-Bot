require('dotenv').config();
const Discord = require('./discord');
const colors = require('colors');
const fs = require('fs');
const readlineSync = require('readline-sync');
const translate = require('translate-google');

function shouldUsePreviousSettings() {
  const envFileExists = fs.existsSync('.env');

  if (envFileExists) {
    const usePrevious = readlineSync.keyInYNStrict(
      'Do you want to use the previous settings?'
    );

    if (usePrevious) {
      try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const envLines = envContent.split('\n');
        envLines.forEach((line) => {
          const [key, value] = line.split('=').map((entry) => entry.trim());
          if (key && value) {
            process.env[key] = value;
          }
        });
        return true;
      } catch (error) {
        console.error('Error reading .env file:', error.message);
      }
    }
  }

  return false;
}

const usePreviousSettings = shouldUsePreviousSettings();

let botToken = process.env.BOT_TOKEN;
let channelId = process.env.CHANNEL_ID;
let mode = process.env.MODE || 'quote';
let delay = process.env.DELAY || 60000;
let delAfter = process.env.DEL_AFTER || '';
let repostLastChat = process.env.REPOST_LAST_CHAT || 10;
let translateTo = process.env.TRANSLATE_TO || 'en';

const quoteEN = require('./quotes-en.json');

if (!usePreviousSettings) {
  botToken = readlineSync.question('Enter your Discord bot token: ', {
    defaultInput: botToken,
  });
  channelId = readlineSync.question('Enter the channel ID: ', {
    defaultInput: channelId,
  });
  mode = readlineSync.question('Enter the mode (quote, repost): ', {
    defaultInput: mode,
  });
  delay = readlineSync.questionInt(
    'Enter the delay in milliseconds (1000ms = 1s): ',
    { defaultInput: delay }
  );
  delAfter = readlineSync.question(
    'Enter the delete delay in milliseconds (leave blank if not needed): ',
    { defaultInput: delAfter }
  );

  while (!['quote', 'repost'].includes(mode.toLowerCase())) {
    console.log(colors.red('Invalid mode! Please enter a valid mode.'));
    mode = readlineSync.question('Enter the mode (quote, repost): ', {
      defaultInput: mode,
    });
  }

  while (isNaN(delay) || delay <= 0) {
    console.log(colors.red('Invalid delay! Please enter a positive number.'));
    delay = readlineSync.questionInt(
      'Enter the delay in milliseconds (1000ms = 1s): ',
      { defaultInput: delay }
    );
  }

  while (delAfter !== '' && (isNaN(delAfter) || delAfter < 0)) {
    console.log(
      colors.red(
        'Invalid delete delay! Please enter a non-negative number or leave it blank.'
      )
    );
    delAfter = readlineSync.question(
      'Enter the delete delay in milliseconds (leave blank if not needed): ',
      { defaultInput: delAfter }
    );
  }

  if (mode.toLowerCase() === 'repost') {
    while (isNaN(repostLastChat) || repostLastChat <= 0) {
      console.log(
        colors.red(
          'Invalid number of last chat messages for repost! Please enter a positive number.'
        )
      );
      repostLastChat = readlineSync.questionInt(
        'Enter the number of last chat messages for repost: ',
        { defaultInput: repostLastChat }
      );
    }
  }

  translateTo = readlineSync.question(
    'Enter the translation language code (check LANGUAGE.md) or leave blank for English (en): ',
    {
      defaultInput: translateTo,
    }
  );

  const envData = `BOT_TOKEN=${botToken}\nCHANNEL_ID=${channelId}\nMODE=${mode}\nDELAY=${delay}\nDEL_AFTER=${delAfter}\nREPOST_LAST_CHAT=${repostLastChat}\nTRANSLATE_TO=${translateTo}`;
  fs.writeFileSync('.env', envData);
}

let bot;

try {
  bot = new Discord(botToken);
} catch (error) {
  console.error(colors.red('Error initializing Discord bot:'), error.message);
  process.exit(1);
}

async function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quoteEN.length);
  const textToTranslate = quoteEN[randomIndex].text;

  let translatedText = textToTranslate;

  if (translateTo && translateTo.toLowerCase() !== 'en') {
    try {
      translatedText = await translate(textToTranslate, { to: translateTo });
    } catch (error) {
      console.error(colors.red('Translation error:'), error.message);
    }
  }

  return translatedText;
}

bot
  .getUserInformation()
  .then((userInfo) => {
    const me = userInfo.username + '#' + userInfo.discriminator;
    console.log(colors.green('Logged in as %s'), me);
  })
  .catch((error) => {
    console.error(colors.red('Error getting user information:'), error.message);
  });
console.log(colors.yellow('MODE: %s'), mode);

function processMessage(_, contentCallback) {
  bot.getMessagesInChannel(channelId, 1).then((messageData) => {
    const hasMessages = messageData && messageData.length > 0;

    if (!hasMessages) {
      console.warn(
        colors.yellow('No messages in the channel. Sending a message anyway.')
      );
    }

    contentCallback(hasMessages ? messageData.reverse()[0].content : '').then(
      (response) => {
        bot.sendMessageToChannel(channelId, response).then((sentMessage) => {
          const sentMessageContent = sentMessage.content;
          console.log(
            colors.green('[SEND][%s] %s'),
            sentMessage.id,
            sentMessageContent
          );

          if (delAfter) {
            setTimeout(() => {
              bot
                .deleteMessageInChannel(channelId, sentMessage.id)
                .then((deletedMessage) => {
                  if (deletedMessage) {
                    console.log(
                      colors.red('[DELETE][%s] %s'),
                      deletedMessage.id,
                      sentMessageContent
                    );
                  } else {
                    console.log(
                      colors.red('[DELETE][%s] Deleted successfully'),
                      sentMessage.id
                    );
                  }
                })
                .catch((error) => {
                  console.error(colors.red('[DELETE] Error:'), error.message);
                });
            }, delAfter);
          }
        });
      }
    );
  });
}

setInterval(() => processMessage(null, getRandomQuote), delay);
