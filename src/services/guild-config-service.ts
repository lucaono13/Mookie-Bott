import { plainToInstance } from 'class-transformer';
import { renameSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import { Logger } from './logger.js';
import { MBGuildFeature as GuildFeature } from '../enums/index.js';
import { GuildConfig } from '../models/config-models.js';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'guild-configs.json');

type GuildConfigFile = { [guildId: string]: GuildConfig };

export class GuildConfigService {
    private configs = new Map<string, GuildConfig>();

    public async load(): Promise<void> {
        let text: string;
        try {
            text = await readFile(CONFIG_FILE, 'utf-8');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                Logger.info(Logs.info.guildConfigFileMissing);
                this.configs = new Map();
                return;
            }
            throw error;
        }

        let parsed: GuildConfigFile = JSON.parse(text);
        let loaded = new Map<string, GuildConfig>();

        for (let [guildId, config] of Object.entries(parsed)) {
            let configInstance = plainToInstance(GuildConfig, config);
            loaded.set(guildId, configInstance);
        }
        this.configs = loaded;
        Logger.info(Logs.info.guildConfigLoaded.replaceAll('{COUNT}', loaded.size.toString()));
    }

    public getAll(): GuildConfig[] {
        return [...this.configs.values()];
    }

    public get(guildId: string): GuildConfig | undefined {
        return this.configs.get(guildId);
    }

    public getOrCreate(guildId: string): GuildConfig {
        let existing = this.configs.get(guildId);
        if (existing) {
            if (!existing.active) {
                existing.active = true;
                this.update(existing);
            }
            return existing;
        }

        let created = createDefaultConfig(guildId);
        this.configs.set(guildId, created);
        this.save();
        Logger.info(Logs.info.guildConfigCreated.replaceAll('{GUILD_ID}', guildId));
        return created;
    }

    public isFeatureEnabled(guildId: string, feature: GuildFeature): boolean {
        return this.configs.get(guildId)?.features[feature]?.enabled ?? false;
    }

    public update(config: GuildConfig): void {
        config.updatedAt = new Date().toISOString();
        this.configs.set(config.guildId, config);
        this.save();
    }

    public deactivate(guildId: string): void {
        let existing = this.configs.get(guildId);
        if (!existing || !existing.active) {
            return;
        }
        existing.active = false;
        this.update(existing);
    }

    private save(): void {
        let snapshot: GuildConfigFile = Object.fromEntries(this.configs);
        let tmpFile = `${CONFIG_FILE}.tmp`;
        writeFileSync(tmpFile, JSON.stringify(snapshot, null, 2), 'utf-8');
        renameSync(tmpFile, CONFIG_FILE);
    }
}

function createDefaultConfig(guildId: string): GuildConfig {
    let curTime = new Date().toISOString();
    let config: GuildConfig = {
        guildId: guildId,
        active: true,
        createdAt: curTime,
        updatedAt: curTime,
        features: {
            [GuildFeature.HEMOMANCER]: { enabled: false },
            [GuildFeature.HMMMM]: { enabled: true },
            [GuildFeature.SPELLTABLE_TRIGGER]: { enabled: true },
            [GuildFeature.SONG_OF_THE_DAY]: { enabled: false },
            [GuildFeature.BETS]: { enabled: false },
            [GuildFeature.HALL_OF_FAME]: { enabled: false },
            [GuildFeature.KERMIT_MONTH]: { enabled: false },
        },
    };
    return config;
}
