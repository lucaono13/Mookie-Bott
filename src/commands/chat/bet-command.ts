import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildBasedChannel,
    InteractionCollector,
    InteractionResponse,
    Message,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    PermissionsString,
    TextInputBuilder,
    TextInputStyle,
    ThreadChannel,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction,
} from 'discord.js';
// import { createRequire } from 'node:module';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang, Logger } from '../../services/index.js';
import { FormatUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

// const require = createRequire(import.meta.url);
// let Logs = require('../../../lang/logs.json');
export class BetCommand implements Command {
    public names = [Lang.getRef('chatCommands.bet', Language.Default)];
    public deferType = CommandDeferType.NONE;
    //Do we want a cooldown?
    //public cooldown = new RateLimiter(1, 5000);
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        const betsForumChannel: GuildBasedChannel = intr.guild.channels.cache.find(
            channel => channel.name === 'mookie-betts'
        );
        if (!betsForumChannel) {
            // eslint-disable-next-line quotes
            Logger.error("No channel in server named 'mookie-bets'");
            return;
        }
        const modal = new ModalBuilder().setCustomId('bets').setTitle('Create New Bet');

        const betName = new TextInputBuilder()
            .setCustomId('betName')
            .setLabel('What is the bet?')
            .setStyle(TextInputStyle.Short);

        const choice_1 = new TextInputBuilder()
            .setCustomId('choice_1')
            .setLabel('Choice 1 Option')
            .setStyle(TextInputStyle.Short);

        const choice_2 = new TextInputBuilder()
            .setCustomId('choice_2')
            .setLabel('Choice 2 Option')
            .setStyle(TextInputStyle.Short);

        const stakes = new TextInputBuilder()
            .setCustomId('stakes')
            .setLabel('What are the stakes?')
            .setStyle(TextInputStyle.Short);

        const actionRow1 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            betName
        );
        const actionRow2 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            choice_1
        );
        const actionRow3 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            choice_2
        );
        const actionRow4 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            stakes
        );

        modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

        await intr.showModal(modal);

        const submittedBet: ModalSubmitInteraction = await intr
            .awaitModalSubmit({
                filter: i => i.user.id === intr.user.id,
                time: 0,
            })
            .catch(error => {
                console.error(error);
                return null;
            });

        if (submittedBet) {
            const userSelectChoice1 = new UserSelectMenuBuilder()
                .setCustomId(submittedBet.fields.getTextInputValue('betName') + '_choice_1_users')
                .setPlaceholder(
                    'People who chose ' + submittedBet.fields.getTextInputValue('choice_1')
                )
                .setMinValues(1)
                .setMaxValues(20);
            const userSelectChoice2 = new UserSelectMenuBuilder()
                .setCustomId(submittedBet.fields.getTextInputValue('betName') + '_choice_2_users')
                .setPlaceholder(
                    'People who chose ' + submittedBet.fields.getTextInputValue('choice_2')
                )
                .setMinValues(1)
                .setMaxValues(20);

            const endUserSelection = new ButtonBuilder()
                .setCustomId('buttonSubmit')
                .setLabel('Users confirmed!')
                .setStyle(ButtonStyle.Success);

            const cancelUserSelection = new ButtonBuilder()
                .setCustomId('buttonCancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);

            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                cancelUserSelection,
                endUserSelection
            );

            const userSelectButton1 = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
                userSelectChoice1
            );
            const userSelectButton2 = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
                userSelectChoice2
            );

            const selectingUsers: InteractionResponse = await submittedBet.reply({
                ephemeral: true,
                content: 'Select users for each bet option. (min. 1 each)',
                components: [userSelectButton1, userSelectButton2, buttonRow],
            });

            const reply: Message = await selectingUsers.fetch();

            let userCollector: InteractionCollector<UserSelectMenuInteraction> =
                reply.createMessageComponentCollector({
                    componentType: ComponentType.UserSelect,
                    time: 0,
                    dispose: true,
                });

            let buttonCollector: InteractionCollector<ButtonInteraction> =
                reply.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 0,
                });

            let choice_1s: string[] = [];
            let choice_2s: string[] = [];

            buttonCollector.on('collect', async i => {
                if (i.customId === 'buttonCancel') {
                    buttonCollector.stop();
                    i.update({
                        content: 'Bet creation cancelled',
                        components: [],
                    });
                    submittedBet.editReply({
                        content: 'Bet creation cancelled',
                        components: [],
                    });
                    userCollector.empty();
                } else if (i.customId === 'buttonSubmit') {
                    if (choice_1s.length + choice_2s.length == 0) {
                        i.update({
                            content:
                                'No users have been selected. Please select at least 1 user per choice.',
                            components: [userSelectButton1, userSelectButton2, buttonRow],
                        });
                        userCollector.empty();
                    } else {
                        if (!choice_1s.length || !choice_2s.length) {
                            i.update({
                                content:
                                    'At least one choice has no users selected! Please select at least 1 user per choice.',
                                components: [userSelectButton1, userSelectButton2, buttonRow],
                            });
                        } else {
                            const usersSet1: Set<string> = new Set(choice_1s);
                            const dupes: string[] = choice_2s.filter(item => usersSet1.has(item));
                            if (dupes.length > 0) {
                                i.update({
                                    content:
                                        'Some users are selected in both choices. Please ensure everyone appears only once.',
                                    components: [userSelectButton1, userSelectButton2, buttonRow],
                                });
                                userCollector.empty();
                            } else {
                                i.update({
                                    content:
                                        'Users have been selected! Bet has been created in ' +
                                        FormatUtils.channelMention(betsForumChannel.id),
                                    components: [],
                                });
                                userCollector.stop();
                            }
                        }
                    }
                }
            });

            userCollector.on('collect', async interaction => {
                interaction.customId.endsWith('1_users')
                    ? (choice_1s = interaction.values)
                    : (choice_2s = interaction.values);
                interaction.deferUpdate();
            });

            userCollector.on('end', async _ => {
                choice_1s.forEach((user: string, idx: number) => {
                    choice_1s[idx] = FormatUtils.userMention(user);
                });
                choice_2s.forEach((user: string, idx: number) => {
                    choice_2s[idx] = FormatUtils.userMention(user);
                });

                let betsForum: any = await betsForumChannel.fetch();

                // This should literally not happen as I'm making sure that the channel is literally the right type, but just in case
                if (betsForum.type != 15) {
                    Logger.error('Somehow, someway the channel is not the correct type.');
                    reply.edit({
                        content:
                            // eslint-disable-next-line quotes
                            "Error creating bet. Ask Luca to see what's up. Tell him what steps you did and what happened.",
                        components: [],
                    });
                    return;
                }
                let embed: EmbedBuilder = Lang.getEmbed('displayEmbeds.betCommands', data.lang, {
                    BET_NAME: submittedBet.fields.getTextInputValue('betName'),
                    BET_STAKES: submittedBet.fields.getTextInputValue('stakes'),
                    CHOICE_1: submittedBet.fields.getTextInputValue('choice_1'),
                    CHOICE_1_BETS: choice_1s.join(', '),
                    CHOICE_2: submittedBet.fields.getTextInputValue('choice_2'),
                    CHOICE_2_BETS: choice_2s.join(', '),
                    USER: intr.user.username,
                });
                let createdBet: ThreadChannel = await betsForum.threads.create({
                    name: submittedBet.fields.getTextInputValue('betName'),
                    message: {
                        embeds: [embed],
                    },
                });
                let allUsers: string[] = [];
                choice_1s.forEach((user: string) => {
                    allUsers.push(user);
                });
                choice_2s.forEach((user: string) => {
                    allUsers.push(user);
                });
                await createdBet.send({
                    content: allUsers.join(' '),
                });
            });
        }
    }
}
