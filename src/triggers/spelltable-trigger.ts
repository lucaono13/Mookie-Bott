import { Message } from 'discord.js';
import { createRequire } from 'node:module';

import { Trigger } from './trigger.js';
import { EventData } from '../models/internal-models.js';
import { Logger } from '../services/index.js';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

export class SpelltableLinkTrigger implements Trigger {
    // public requireGuild: boolean;
    public requireGuild = false;

    public triggered(msg: Message): boolean {
        if (msg.content.match('https://spelltable.wizards.com/game/[a-zA-Z0-9]+') != null) {
            return true;
        }
        return false;
    }

    public async execute(msg: Message, _: EventData): Promise<void> {
        let spelltableLink: string[] = msg.content.match(
            'https://spelltable.wizards.com/game/[a-zA-Z0-9]+'
        );

        // let payload: MessagePayload = new MessagePayload(
        //     target: msg,
        //     options:
        // )
        // msg.reply(spelltableLink[0] + '/?spectate=true');
        msg.reply({
            content: spelltableLink[0] + '/?spectate=true',
            allowedMentions: { repliedUser: false },
        });
        Logger.info(
            Logs.info.spelltable.replaceAll(
                '{SPELLTABLE_LINK}',
                spelltableLink[0] + '/?spectate=true'
            )
        );
    }
}
