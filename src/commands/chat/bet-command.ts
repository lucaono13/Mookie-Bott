import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    NewsChannel,
    PermissionsString,
    TextChannel,
} from 'discord.js';

// import { BetOption } from '../../enums/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { ClientUtils, InteractionUtils, MessageUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class BetCommand implements Command {
    public names = [Lang.getRef('chatCommands.bet', Language.Default)];
    public deferType = CommandDeferType.PUBLIC;
    //Do we want a cooldown?
    //public cooldown = new RateLimiter(1, 5000);
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        intr.ephemeral = true;
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

        // Finds the mookie-bets channel
        let betsChannel: NewsChannel | TextChannel = await ClientUtils.findTextChannel(
            intr.guild,
            'mookie-bets'
        );

        // Sends the bet to the bets channel only
        // TODO: fix this so it actually is ephemeral and doesn't show up
        await InteractionUtils.send(intr, 'Bet created in the bets channel!', true);
        await MessageUtils.send(betsChannel, embed);
    }
}
