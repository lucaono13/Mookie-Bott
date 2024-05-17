import { Client, EmbedBuilder, Guild, NewsChannel, TextChannel } from 'discord.js';
import { DateTimeFormatOptions } from 'luxon';
import { Collection, Db, MongoClient } from 'mongodb';
import { createRequire } from 'node:module';

import { Job } from './index.js';
import { Language } from '../models/enum-helpers/language.js';
import { Lang } from '../services/index.js';
import { ClientUtils } from '../utils/client-utils.js';
import { MessageUtils } from '../utils/message-utils.js';

const require = createRequire(import.meta.url);

let Config = require('../../config/config.json');

export class SongOfTheDay implements Job {
    public name = 'Song of the Day';
    public schedule: string = Config.jobs.songOfTheDay.schedule;
    public log: boolean = Config.jobs.songOfTheDay.log;

    private client: Client;

    constructor(private botClient: Client) {
        this.client = botClient;
    }

    private convertMS(ms: number): string {
        let total_seconds = Math.floor(ms / 1000);
        let total_minutes = Math.floor(total_seconds / 60);

        let seconds = total_seconds % 60;
        let minutes = total_minutes % 60;

        return `${minutes}:${seconds}`;
    }

    private convertDate(date: string): string {
        let epochDate = Date.parse(date);
        let dateObj = new Date(epochDate);

        return `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
    }

    public async run(): Promise<void> {
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

        // Get music channel
        let theGuild: Guild = await ClientUtils.getGuild(this.client, Config.client.server_id);
        let musicChannel: TextChannel | NewsChannel = await ClientUtils.findTextChannel(
            theGuild,
            Config.client.music_channel_name
        );

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
        await MessageUtils.send(musicChannel, embed);
    }
}
