# Mookie Bott

[![discord.js](https://img.shields.io/github/package-json/dependency-version/KevinNovak/Discord-Bot-TypeScript-Template/discord.js)](https://discord.js.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)
[![Pull Requests](https://img.shields.io/badge/Pull%20Requests-Welcome!-brightgreen)](https://github.com/KevinNovak/Discord-Bot-TypeScript-Template/pulls)

**Mookie Bott** - A discord.js bot written with TypeScript based on a template.

## Commands/Triggers/Jobs

1. Bet _(Command)_
    - Using input from the user, creates a post in a Forum channel that contains what the bet is, who is on each side and what the stakes are
    - Pings the users in the bet so they are a part of the post immediately
2. Hemomancer Replacement _(Trigger)_
    - Inspired by a popular TikTok, replaces specific words with their "hemomancer" counterpart (i.e. vampire -> hemomancer)
3. **Hmmmm** _(Trigger)_
    - Also inspired by the same TikTok for the Hemomancer Replacement trigger, it sends a specific photo whenever a user sends "hmmmm" in any channel (must have at least 4 'm's to trigger)
4. Spelltable Spectate _(Trigger)_
    - Whenever someone sends a Spelltable link in any channel, it will reply with the Spelltable spectator link
5. Kermit Month _(Job)_
    - Every July 1st at 8:30am, sets the server into Kermit month (changing server banner and icon)
6. Song of the Day _(Job)_
    - Every morning at 9am, it queries a MongoDB database for a random song and posts it to the music channel

## Dev Setup (for local)

1. Obtain a bot token.
    - You'll need to create a new bot in your [Discord Developer Portal](https://discord.com/developers/applications/).
        - See [here](https://www.writebots.com/discord-bot-token/) for detailed instructions.
        - At the end you should have a **bot token**..
2. Copy the `example.env`
    - Rename it `.env`.
    - Edit the following values:
        - `CLIENT_TOKEN` - Your Discord bot's token.
        - `CLIENT_ID` - Your discord bot's [user ID](https://techswift.org/2020/04/22/how-to-find-your-user-id-on-discord/).
        - `SERVER_ID` - Get the channel ID of the server you are going to test on by ensuring that you have developer mod enabled in the Advanced Discord setting. Then right click on the server icon and select `Copy Server ID`.
        - Optional if you have a MongoDB instance running
            - `MONGODB_URL` - DB URL usually starting with `mongodb://`
            - `MUSIC_DB` - The name of the database in MongoDB
            - `MUSIC_COLLECTION` - The Mongo collection in the database
3. Install packages.
    - Ensure that [`yarn`](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable) is installed.
    - Navigate into the downloaded directory.
    - Change yarn version using `yarn set version berry`.
    - Run the command `yarn install` to install packages.
4. Register commands.
    - In order to use slash commands, they first [have to be registered](https://discordjs.guide/creating-your-bot/command-deployment.html).
    - Type `yarn run commands:register` to register the bot's commands.
        - Run this script any time you change a command name, structure, or add/remove commands.
        - This is so Discord knows what your commands look like.
        - It may take up to an hour for command changes to appear. <sup>_In my time working with this bot, it has been very quick to see changes (about a minute if I had to guess)_</sup>

## Console Commands

Commands you can run before starting the bot:

1. `yarn run commands:view`
    - View all commands registered for the bot
2. `yarn run commands:register`
    - Register all commands set in the commands list in `src/start-bot.ts`.
3. `yarn run commands:rename <OLD_NAME> <NEW_NAME>`
    - Rename a command
4. `yarn run commands:delete <COMMAND_NAME>`
    - Delete a specific command
5. `yarn run commands:clear`
    - Delete **all** commands

## Start Scripts

_Note: We don't need sharding for this bot since we are making this as a single instance_

-   Normal Mode
    -   Type `yarn start`.
    -   Starts a single instance of the bot.
