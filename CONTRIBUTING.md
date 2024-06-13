# Developing Commands/Triggers/Jobs

## Commands

These are usually slash commands (using `/` in chat), but there is also message and user commands which appear when you right click on a message or profile that run a command based on the message/profile that was selected.

These are found in the `src/commands/*` folder. It is separated into each type of command and each command has their own file. Each folder has at least one example (for chat use the `test-command.ts` as an example)

-   To add to bot to be registered
    1. Add the command function to the `index.ts` of the command type folder _(`src/commands/chat/`, `src/commands/message/`, and `src/commands/user/`)_.
    2. Add the command function to the `index.ts` of the command folder (`src/commands/`).
    3. Add command function to the imports at the start of `src/start-bot.ts` (each type of command has their own import section).
    4. Add command function call to the list called `commands` in the start function in `src/start-bot.ts`.

#### Other files

-   `src/commands/args` - If your command requires arguments, you can create them here
-   `src/commands/metadata` - Metadata for commands

## Triggers

These are 'commands' that occur when a specific trigger occurs (e.g. a specific word). In this bot, the Spelltable link creation is an example of a trigger command.

These are found in the `src/triggers/` folder. Each trigger is separated into its own file.

-   To add the trigger to the bot <sup>_does not need to be registered_</sup>
    1. Add trigger function to the `index.ts` in the `src/triggers` folder.
    2. Add trigger function to the import list in `src/start-bot.ts`.
    3. Add trigger function call to the list called `triggers` in the start function in `src/start-bot.ts`.

## Jobs

These are 'commands' that occur on a set schedule set by cron jobs. For this bot, Song of the Day and Kermit month are both Jobs.

These are found in the `src/jobs` folder. Each job is separated into its own file.

For developing a job you need to add a cron schedule to `config/config.json`. I use [this site](https://crontab.cronhub.io) to create cron expressions since it supports 6 fields (in order: second, minute, hour, day of month, month, day of week).

> [!CAUTION]
> **Do not set the cron job to be quicker than 1 time per minute. Please be reasonable in your scheduling**

-   To add the job to the bot <sup>_does not need to be registered_</sup>
    1. Add job function to the `index.ts` in the `src/jobs` folder.
    2. Add job function to the import list in the `src/start-bot.ts`.
    3. Add job function call to the list called `jobs` in the start function in `src/start-bot.ts`.

## Files to keep in mind when developing features/commands

-   `config/config.json`
    -   Variables for use across the bot (e.g. MongoDB URL/DB)
    -   The necessary intents for the bot to run properly
    -   Job scheduling with cron
    -   Rate limiting settings
-   `lang/logs.json`
    -   Logging strings
-   `lang/lang.en-US.json`
    -   Embeds
    -   Command/arguments descriptions
    -   Other strings used for messages

## Other 'command' types that we haven't used yet

-   `Reactions`
-   `Buttons`
