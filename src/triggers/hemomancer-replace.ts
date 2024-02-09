import { Message } from 'discord.js';
import { createRequire } from 'node:module';

import { Trigger } from './trigger.js';
import { EventData } from '../models/internal-models.js';
import { Logger } from '../services/index.js';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

export class HemomancerReplace implements Trigger {
    // public requireGuild: boolean;
    public requireGuild = false;

    private hemomancerWords = {
        witch: 'sorceress',
        wizard: 'mage',
        zombie: 'ghoul',
        vampire: 'hemomancer',
        werewolf: 'lycanthrope',
        mummy: 'pharaoh',
        fairy: 'pixie',
    };

    public triggered(msg: Message): boolean {
        let toTrigger = false;
        Object.keys(this.hemomancerWords).forEach(word => {
            if (msg.content.includes(word) == true) {
                toTrigger = true;
            }
        });
        if (toTrigger) {
            return true;
        }
        return false;
    }

    public async execute(msg: Message, _: EventData): Promise<void> {
        let content: string = msg.content;
        Object.keys(this.hemomancerWords).forEach(word => {
            content = content.replace(word, this.hemomancerWords[word]);
        });
        msg.reply({
            content: content,
            allowedMentions: { repliedUser: false },
        });
        Logger.info(Logs.info.hemomancer);
    }
}
