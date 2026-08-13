import { MBGuildFeature as GuildFeature } from '../enums/guild-feature.js';

export interface BotSite {
    name: string;
    enabled: boolean;
    url: string;
    authorization: string;
    body: string;
}

export class FeatureConfig {
    enabled: boolean;
}

export class SongOfTheDayConfig extends FeatureConfig {
    musicChannelId?: string;
}

export class BetsConfig extends FeatureConfig {
    betsChannelId?: string;
}

export class HallOfFameConfig extends FeatureConfig {
    adminChannelId?: string;
    hallOfFameChannelId?: string;
}


export class GuildFeatureConfigs {
    [GuildFeature.HEMOMANCER]: FeatureConfig;
    [GuildFeature.HMMMM]: FeatureConfig;
    [GuildFeature.SPELLTABLE_TRIGGER]: FeatureConfig;
    [GuildFeature.SONG_OF_THE_DAY]: SongOfTheDayConfig;
    [GuildFeature.BETS]: BetsConfig;
    [GuildFeature.HALL_OF_FAME]: HallOfFameConfig;
    [GuildFeature.KERMIT_MONTH]: FeatureConfig;
}

export class GuildConfig {
    guildId: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    features: GuildFeatureConfigs;
}
