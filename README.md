# Discord-Chat-Bot
A simple Discord bot for sending random quotes and reposting messages in a channel.

## Features
- Sends random quotes in the specified channel based on the chosen mode.
- Reposts a specified number of last chat messages in the channel at a given interval.
- Configurable settings for bot token, channel ID, mode, delay, and more.
- Backup and history functionalities for ease of use.

## Usage
- Clone the repository.
- Install dependencies using `npm install`.
- Configure the bot by running the script and providing necessary information.
- Run the bot using `node index.js`.

## Configuration
The bot can be configured via the `.env` file or by providing environment variables. Additionally, a backup file (backup.txt) and a history file (history.txt) are maintained for easy reference.

## Dependencies
- discord.js - Discord API library.
- colors - Adds colors to console.log.
- readline-sync - Synchronous Readline for interacting with the user.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
