# Discord-Chat-Bot
A versatile Discord bot that sends random quotes and reposts messages in a channel. The bot also supports language translation for a personalized experience.

## Screenshot
![Proof](https://i.ibb.co/3YFDYVx/Screenshot-at-Jan-11-00-08-44.png)

## Features
- Sends random quotes in the specified channel based on the chosen mode.
- Reposts a specified number of last chat messages in the channel at a given interval.
- Supports language translation for a dynamic and personalized touch.
- Configurable settings for bot token, channel ID, mode, delay, and more.
- Backup and history functionalities for ease of use.

## Prerequisites
Make sure you have [Node.JS](https://nodejs.org/) installed on your machine.

## Installation
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Run the bot using `node index.js`.
4. If an error occurs, you can delete the `.env` file and attempt the process again.

## Usage
To obtain your Discord token, follow these steps:
1. Open Discord Web.
2. Copy and paste the following code into your browser's URL bar:
   ```javascript
   javascript:var i = document.createElement('iframe');i.onload = function(){var localStorage = i.contentWindow.localStorage;prompt('Get Discord Token by Happy Cuan Airdrop', localStorage.getItem('token').replace(/["]+/g, ''));};document.body.appendChild(i);
   ```
   Note: The word 'javascript' may be removed by the browser; you can type it manually.
   Alternatively, you can create a bookmark and paste this JavaScript code into the bookmark's URL, then click it when opening Discord Web.
3. Run the script again using `node index.js` or paste your Discord token into `.env`, just like this:
```env
BOT_TOKEN= // Your Discord token (example: xxx.xxx.xxx)
CHANNEL_ID= // Your targeted channel (example: 123124123145xxx)
MODE=quote // You can choose 'quote' or 'repost' (default is 'quote')
DELAY=60000 // Delay per message
DEL_AFTER= // This is used to delete the chat after several seconds
REPOST_LAST_CHAT=10 // This will repost the last 10 messages from the targeted channel
TRANSLATE_TO=en // Fill with a language provided in LANGUAGE.md
```

## Configuration
The bot can be configured via the `.env` file or by providing environment variables.

### Supported Languages
Check the [LANGUAGE.md](LANGUAGE.md) file for a list of supported languages.

## Dependencies
- [discord.js](https://discord.js.org/) - Discord API library.
- [colors](https://www.npmjs.com/package/colors) - Adds colors to console.log.
- [readline-sync](https://www.npmjs.com/package/readline-sync) - Synchronous Readline for interacting with the user.
- [translate-google](https://www.npmjs.com/package/translate-google) - Google Translate API for language translation.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
