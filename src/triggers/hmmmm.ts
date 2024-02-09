import { Message } from 'discord.js';
import { createRequire } from 'node:module';

import { Trigger } from './trigger.js';
import { EventData } from '../models/internal-models.js';
import { Logger } from '../services/index.js';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

export class HemomancerHmm implements Trigger {
    // public requireGuild: boolean;
    public requireGuild = false;

    public triggered(msg: Message): boolean {
        if (msg.content.match('^.*hm{4,}.*$') != null) {
            return true;
        }
        return false;
    }

    public async execute(msg: Message, _: EventData): Promise<void> {
        msg.reply({
            files: [{ attachment: './src/img/hmmmm.jpeg' }],
            allowedMentions: { repliedUser: false },
        });
        Logger.info(Logs.info.hmmmm);
    }
}
