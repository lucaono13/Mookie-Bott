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
        witches: 'sorceresses',
        Witch: 'Sorceress',
        Witches: 'Sorceresses',
        WITCH: 'SORCERESS',
        WITCHES: 'SORCERESSES',
        wizard: 'mage',
        Wizard: 'Mage',
        WIZARD: 'MAGE',
        zombie: 'ghoul',
        Zombie: 'Ghoul',
        ZOMBIE: 'GHOUL',
        vampire: 'hemomancer',
        Vampire: 'Hemomancer',
        VAMPIRE: 'HEMOMANCER',
        werewolf: 'lycanthrope',
        werewolves: 'lycanthropes',
        Werewolf: 'Lycanthrope',
        Werewolves: 'Lycanthropes',
        WEREWOLF: 'LYCANTHROPE',
        WEREWOLVES: 'LYCANTHROPES',
        mummy: 'pharaoh',
        mummies: 'pharaohs',
        Mummy: 'pharoah',
        Mummies: 'Pharaohs',
        MUMMY: 'PHAROAH',
        MUMMIES: 'PHARAOHS',
        fairy: 'pixie',
        fairies: 'pixies',
        Fairy: 'Pixie',
        Fairies: 'Pixies',
        FAIRY: 'PIXIE',
        FAIRIES: 'PIXIES',
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
        content = msg.content;
        if (msg.author.id == '268547439714238465' || msg.content.startsWith('https://tenor.com/')) {
            return;
        }

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
