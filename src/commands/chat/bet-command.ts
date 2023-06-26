import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';

// import { BetOption } from '../../enums/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class BetCommand implements Command {
    public names = [Lang.getRef('chatCommands.bet', Language.Default)];
    public deferType = CommandDeferType.PUBLIC;
    //Do we want a cooldown?
    //public cooldown = new RateLimiter(1, 5000);
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let args = {
            bet: intr.options.getString('bet', true),
            stakes: intr.options.getString('stakes', true),
            yes: intr.options.getString('yes', true),
            no: intr.options.getString('no', true),
        };

        let embed: EmbedBuilder;
        // Adds arguments to embed
        embed = Lang.getEmbed('displayEmbeds.betCommands', data.lang, {
            BET_NAME: args.bet,
            BET_STAKES: args.stakes,
            YES_BETS: args.yes,
            NO_BETS: args.no,
        });

        await InteractionUtils.send(intr, embed);
    }
}
