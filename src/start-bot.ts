import { REST } from '@discordjs/rest';
import { Options, Partials } from 'discord.js';
import { createRequire } from 'node:module';

import { Button } from './buttons/index.js';
import { BetCommand } from './commands/chat/index.js';
import {
    ChatCommandMetadata,
    Command,
    MessageCommandMetadata,
    UserCommandMetadata,
} from './commands/index.js';
import { HallOfFame, ViewDateSent } from './commands/message/index.js';
import { ViewDateJoined } from './commands/user/index.js';
import {
    ButtonHandler,
    CommandHandler,
    GuildJoinHandler,
    GuildLeaveHandler,
    MessageHandler,
    ReactionHandler,
    TriggerHandler,
} from './events/index.js';
import { CustomClient } from './extensions/index.js';
import { AnnounceKermitMonth, Job, SongOfTheDay } from './jobs/index.js';
import { Bot } from './models/bot.js';
import { Reaction } from './reactions/index.js';
import {
    CommandRegistrationService,
    EventDataService,
    JobService,
    Logger,
} from './services/index.js';
import { HemomancerHmm, SpelltableLinkTrigger, Trigger } from './triggers/index.js';

const require = createRequire(import.meta.url);
let Config = require('../config/config.json');
let Logs = require('../lang/logs.json');

async function start(): Promise<void> {
    // Get env variables
    require('dotenv').config();
    Config.client.token = process.env.CLIENT_TOKEN;
    Config.client.id = process.env.CLIENT_ID;
    Config.client.mongodb_url = process.env.MONGODB_URL;
    Config.client.music_db = process.env.MUSIC_DB;
    Config.client.music_collection = process.env.MUSIC_COLLECTION;
    Config.client.server_id = process.env.SERVER_ID;
    Config.client.music_channel_name = process.env.MUSIC_CHANNEL_NAME;
    Config.client.admin_channel_id = process.env.ADMIN_CHANNEL_ID;
    Config.client.hall_of_fame_channel_id = process.env.HOF_CHANNEL_ID;

    // Services
    let eventDataService = new EventDataService();

    // Client
    let client = new CustomClient({
        intents: Config.client.intents,
        partials: (Config.client.partials as string[]).map(partial => Partials[partial]),
        makeCache: Options.cacheWithLimits({
            // Keep default caching behavior
            ...Options.DefaultMakeCacheSettings,
            // Override specific options from config
            ...Config.client.caches,
        }),
    });

    // Commands
    let commands: Command[] = [
        // Chat Commands
        new BetCommand(),

        // Message Context Commands
        new ViewDateSent(),
        new HallOfFame(),

        // User Context Commands
        new ViewDateJoined(),

        // TODO: Add new commands here
    ];

    // Buttons
    let buttons: Button[] = [
        // TODO: Add new buttons here
    ];

    // Reactions
    let reactions: Reaction[] = [
        // TODO: Add new reactions here
    ];

    // Triggers
    let triggers: Trigger[] = [
        // TODO: Add new triggers here
        new SpelltableLinkTrigger(),
        new HemomancerHmm(),
    ];

    // Event handlers
    let guildJoinHandler = new GuildJoinHandler(eventDataService);
    let guildLeaveHandler = new GuildLeaveHandler();
    let commandHandler = new CommandHandler(commands, eventDataService);
    let buttonHandler = new ButtonHandler(buttons, eventDataService);
    let triggerHandler = new TriggerHandler(triggers, eventDataService);
    let messageHandler = new MessageHandler(triggerHandler);
    let reactionHandler = new ReactionHandler(reactions, eventDataService);

    // Jobs
    let jobs: Job[] = [
        // TODO: Add new jobs here
        new AnnounceKermitMonth(client),
        new SongOfTheDay(client),
    ];

    // Bot
    let bot = new Bot(
        Config.client.token,
        client,
        guildJoinHandler,
        guildLeaveHandler,
        messageHandler,
        commandHandler,
        buttonHandler,
        reactionHandler,
        new JobService(jobs)
    );

    // Register Commands when running: yarn run commands
    if (process.argv[2] == 'commands') {
        try {
            let rest = new REST({ version: '10' }).setToken(Config.client.token);
            let commandRegistrationService = new CommandRegistrationService(rest);
            let localCmds = [
                ...Object.values(ChatCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
                ...Object.values(MessageCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
                ...Object.values(UserCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
            ];
            await commandRegistrationService.process(localCmds, process.argv);
        } catch (error) {
            Logger.error(Logs.error.commandAction, error);
        }
        // Wait for any final logs to be written.
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Will exit the process after
        process.exit();
    }

    // Register commands when starting bot
    // try {
    //     let rest = new REST({ version: '10' }).setToken(Config.client.token);
    //     let commandRegistrationService = new CommandRegistrationService(rest);
    //     let localCmds = [
    //         ...Object.values(ChatCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
    //         ...Object.values(MessageCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
    //         ...Object.values(UserCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
    //     ];
    //     await commandRegistrationService.registerCommands(localCmds);
    // } catch (error) {
    //     Logger.error(Logs.error.commandAction, error);
    // }
    // Wait for any final logs to be written.
    await new Promise(resolve => setTimeout(resolve, 1000));

    await bot.start();
}

process.on('unhandledRejection', (reason, _promise) => {
    Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
    Logger.error(Logs.error.unspecified, error);
});
