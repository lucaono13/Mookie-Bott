import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';

import { BetOption } from '../../enums/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { ClientUtils, FormatUtils, InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class BetCommand implements Command {
    public names = [Lang.getRef('chatCommands.bet', Language.Default)];
    public deferType = CommandDeferType.PUBLIC;
    //Do we want a cooldown?
    //public cooldown = new RateLimiter(1, 5000);
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let args = {
            option: intr.options.getString(
                Lang.getRef('arguments.option', Language.Default)
            ) as BetOption,
        };

        let embed: EmbedBuilder;
        //Set embed in here using args?
        switch (args.option) {
        }

        await InteractionUtils.send(intr, embed);
    }
}
