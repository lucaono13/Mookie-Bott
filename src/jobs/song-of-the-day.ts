import { Client, EmbedBuilder, Guild, NewsChannel, TextChannel } from 'discord.js';
import { DateTimeFormatOptions } from 'luxon';
import { Collection, Db, MongoClient } from 'mongodb';
import { createRequire } from 'node:module';

import { Job } from './index.js';
import { Language } from '../models/enum-helpers/language.js';
import { GuildConfigService, Lang, Logger } from '../services/index.js';
import { ClientUtils } from '../utils/client-utils.js';
import { MessageUtils } from '../utils/message-utils.js';
import { MBGuildFeature } from '../enums/guild-feature.js';

const require = createRequire(import.meta.url);

let Config = require('../../config/config.json');
let Logs = require('../../lang/logs.json');

export class SongOfTheDay implements Job {
    public name = 'Song of the Day';
    public schedule: string = Config.jobs.songOfTheDay.schedule;
    public log: boolean = Config.jobs.songOfTheDay.log;

    private client: Client;

    constructor(private botClient: Client, private guildConfigService: GuildConfigService) {
        this.client = botClient;
    }
    runOnce: boolean;
    initialDelaySecs: number;

    private convertMS(ms: number): string {
        let total_seconds = Math.floor(ms / 1000);
        let total_minutes = Math.floor(total_seconds / 60);

        let seconds = (total_seconds % 60).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
        });
        let minutes = total_minutes % 60;

        return `${minutes}:${seconds}`;
    }

    private convertDate(date: string): string {
        let epochDate = Date.parse(date);
        let dateObj = new Date(epochDate);

        return `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
    }

    public async run(): Promise<void> {
        for (let config of this.guildConfigService.getAll()) {
            let sotd = config.features[MBGuildFeature.SONG_OF_THE_DAY];
            if (!config.active || !sotd.enabled || !sotd.musicChannelId) {
                continue;
            }
            let guild = await ClientUtils.getGuild(this.client, config.guildId);
            let channel = await guild.channels.fetch(sotd.musicChannelId);
        
            // rework below into reading the json file of the songs instead of mongo
            const mongoClient = new MongoClient(Config.client.mongodb_url);
            let dateOptions: DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            let today = new Date();
            let previouslySelected = true;
            let selectedNumber: number;
            let song;
            await mongoClient.connect();
            const db: Db = mongoClient.db(Config.client.music_db);
            const musicCol: Collection = db.collection(Config.client.music_collection);

            while (previouslySelected) {
                // Get random number and search in DB and see if the selected ID has already been used
                selectedNumber = Math.floor(Math.random() * 1200);
                song = await musicCol.findOne({ id: selectedNumber });
                previouslySelected = song['selected'];
            }

            // Update DB to show that song is selected
            await musicCol.updateOne({ id: selectedNumber }, { $set: { selected: true } });

            // Create and send embed with music
            let embed: EmbedBuilder = Lang.getEmbed('displayEmbeds.songOfTheDay', Language.Default, {
                DATE: today.toLocaleDateString('en-US', dateOptions),
                SONG_NAME: song['name'],
                SONG_URL: song['url'],
                ARTISTS: song['artist'].join(', '),
                ALBUM_NAME: song['album']['name'],
                DURATION: this.convertMS(song['duration']),
                POPULARITY: song['popularity'],
                ALBUM_IMAGE: song['album']['image'],
                RELEASE_DATE: this.convertDate(song['release_date']),
            });

            // Checking the configs of each of the guilds and if the song of the day feature is enabled,
            // send the embed to the correct channel
            const configs: object = Config.client.guild_configs;
            Object.keys(configs).forEach(async guild_id => {
                if (configs[guild_id]['features']['song_of_the_day']) {
                    let guild: Guild = await ClientUtils.getGuild(this.client, guild_id);
                    const musicChannel: TextChannel | NewsChannel = await ClientUtils.findTextChannel(
                        guild,
                        String(configs[guild_id]['music_channel_id'])
                    );
                    await MessageUtils.send(musicChannel, embed);
                    Logger.info(`[${guild.name} (${guild_id})] - ${Logs.info.songOfTheDay}`);
                }
            });
        }
    }
}
