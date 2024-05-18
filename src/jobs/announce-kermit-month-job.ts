import { Client, EmbedBuilder, Guild, NewsChannel, TextChannel } from 'discord.js';
import { createRequire } from 'node:module';

import { Job } from './index.js';
import { Language } from '../models/enum-helpers/language.js';
import { Lang, Logger } from '../services/index.js';
import { ClientUtils, MessageUtils } from '../utils/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Logs = require('../../lang/logs.json');

export class AnnounceKermitMonth implements Job {
    public name = 'Announce Kermit Month';
    public schedule: string = Config.jobs.kermitMonth.schedule;
    public log: boolean = Config.jobs.kermitMonth.log;

    private client: Client;

    constructor(private botClient: Client) {
        this.client = botClient;
    }

    public async run(): Promise<void> {
        // TODO: Remove the guild being hard-coded
        let theGuild: Guild = await ClientUtils.getGuild(this.client, Config.client.server_id);
        // Change the server icon and banner
        theGuild.setIcon(
            'https://media.discordapp.net/attachments/1122737373466329148/1124221117385670716/mookermit.png?width=563&height=563'
        );
        theGuild.setBanner(
            'https://media.discordapp.net/attachments/1124376164098642100/1124449273942130749/kermookie_banner.png?width=899&height=506'
        );

        let notifyChannel: TextChannel | NewsChannel = await ClientUtils.findNotifyChannel(
            theGuild,
            Language.Default
        );
        let embed: EmbedBuilder = Lang.getEmbed('displayEmbeds.kermitMonth', Language.Default);
        Logger.info(Logs.info.kermitMonth);
        await MessageUtils.send(notifyChannel, embed);
    }
}
