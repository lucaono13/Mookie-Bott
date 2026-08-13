import { Client, EmbedBuilder, Guild, NewsChannel, TextChannel } from 'discord.js';
import { createRequire } from 'node:module';

import { Job } from './index.js';
import { Language } from '../models/enum-helpers/language.js';
import { GuildConfigService, Lang, Logger } from '../services/index.js';
import { ClientUtils, MessageUtils } from '../utils/index.js';
import { MBGuildFeature } from '../enums/guild-feature.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Logs = require('../../lang/logs.json');

export class AnnounceKermitMonth implements Job {
    public name = 'Announce Kermit Month';
    public schedule: string = Config.jobs.kermitMonth.schedule;
    public log: boolean = Config.jobs.kermitMonth.log;

    private client: Client;

    constructor(private botClient: Client, private guildConfigService: GuildConfigService) {
        this.client = botClient;
    }
    runOnce: boolean;
    initialDelaySecs: number;

    public async run(): Promise<void> {
        for (let config of this.guildConfigService.getAll()) {
            let kermit_month = config.features[MBGuildFeature.KERMIT_MONTH];
            if (!config.active || !kermit_month.enabled ) {
                continue;
            }
        
            // TODO: Remove the guild being hard-coded
            let theGuild: Guild = await ClientUtils.getGuild(this.client, config.guildId);
            // Change the server icon and banner
            theGuild.setIcon(
                './src/assets/imgs/mookermit.png'
            );
            theGuild.setBanner(
                './src/assets/imgs/kermookie_banner.png'
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
}
