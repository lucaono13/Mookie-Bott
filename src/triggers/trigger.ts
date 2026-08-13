import { Message } from 'discord.js';

import { MBGuildFeature } from '../enums/guild-feature.js';
import { EventData } from '../models/internal-models.js';

export interface Trigger {
    requireGuild: boolean;
    feature?: MBGuildFeature;
    triggered(msg: Message): boolean;
    execute(msg: Message, data: EventData): Promise<void>;
}
