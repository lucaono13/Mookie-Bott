import {
    ActionRowBuilder,
    Attachment,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Collection,
    ComponentType,
    EmbedBuilder,
    InteractionCollector,
    Message,
    MessageContextMenuCommandInteraction,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    NewsChannel,
    PermissionsString,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
    User,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { Db, Collection as MCollection, MongoClient } from 'mongodb';
import { createRequire } from 'node:module';
import { v4 as uuidv4 } from 'uuid';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang, Logger } from '../../services/index.js';
import { ClientUtils, FormatUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

const require = createRequire(import.meta.url);

let Config = require('../../../config/config.json');

export class HallOfFame implements Command {
    public names = [Lang.getRef('messageCommands.hallOfFame', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.NONE;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(
        intr: MessageContextMenuCommandInteraction,
        data: EventData
    ): Promise<void> {
        const message: Message = intr.targetMessage;
        const requester: User = intr.user;
        const author: User = message.author;
        const uid = uuidv4();
        const attachments: Collection<string, Attachment> = message.attachments;

        const modal = new ModalBuilder()
            .setCustomId('hall-of-fame-modal-' + uid)
            .setTitle('Create Hall of Fame Request');

        const entryTitle = new TextInputBuilder()
            .setCustomId('hof-title-' + uid)
            .setLabel('Entry Title')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionBox = new TextInputBuilder()
            .setCustomId('hof-description-' + uid)
            .setLabel('Description/Context?')
            .setPlaceholder('Not required')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const actionRow1 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            entryTitle
        );

        const actionRow2 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            descriptionBox
        );

        modal.addComponents(actionRow1, actionRow2);

        await intr.showModal(modal);

        const submittedHOF: ModalSubmitInteraction = await intr
            .awaitModalSubmit({
                filter: i => i.user.id === intr.user.id,
                time: 0,
            })
            .catch(error => {
                console.error(error);
                return null;
            });
        if (submittedHOF) {
            const adminChannel: TextChannel | NewsChannel = await ClientUtils.findTextChannel(
                intr.guild,
                Config.client.admin_channel_id
            );
            const hallOfFameChannel: TextChannel | NewsChannel = await ClientUtils.findTextChannel(
                intr.guild,
                Config.client.hall_of_fame_channel_id
            );

            const approveButton = new ButtonBuilder()
                .setCustomId('hofApprove' + uid)
                .setLabel('Approve!')
                .setStyle(ButtonStyle.Success);

            const rejectButton = new ButtonBuilder()
                .setCustomId('hofReject' + uid)
                .setLabel('Reject!')
                .setStyle(ButtonStyle.Danger);

            const approveRejectButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                approveButton,
                rejectButton
            );

            let descriptionText: string = submittedHOF.fields.getTextInputValue(
                'hof-description-' + uid
            );

            let requestEmbed: EmbedBuilder = Lang.getEmbed(
                'displayEmbeds.hallOfFameRequest',
                data.lang,
                {
                    ENTRY_TITLE: submittedHOF.fields.getTextInputValue('hof-title-' + uid),
                    POST_AUTHOR: FormatUtils.userMention(author.id),
                    POST_URL: message.url,
                    POST_CONTENT: message.content,
                    POST_DESCRIPTION: descriptionText.length > 0 ? descriptionText : 'None given',
                    REQUESTER: FormatUtils.userMention(requester.id),
                    FILES:
                        attachments.size > 0
                            ? 'Check to make sure the attachments are not malicious!'
                            : 'No attachments.',
                    TIME: new Date().toString(),
                }
            );

            const approveOrReject: Message = await adminChannel.send({
                embeds: [requestEmbed],
                components: [approveRejectButtons],
            });

            const modAppDen: Message = await approveOrReject.fetch();

            submittedHOF.reply({
                content:
                    'Hall of Fame Request Created! Wait until a mod approves/rejects the request!',
                ephemeral: true,
            });

            const approveRejectCollector: InteractionCollector<ButtonInteraction> =
                modAppDen.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 0,
                });

            approveRejectCollector.on('collect', async i => {
                approveRejectCollector.stop();
                if (i.customId === 'hofReject' + uid) {
                    i.update({
                        content: 'Post rejected!',
                        components: [],
                    });
                } else if (i.customId === 'hofApprove' + uid) {
                    i.update({
                        content: 'Approved to the Hall of Fame!',
                        components: [],
                        files: [],
                    });
                    let entryEmbed: EmbedBuilder;
                    if (descriptionText.length > 0) {
                        entryEmbed = Lang.getEmbed(
                            'displayEmbeds.hallOfFameEntry_Desc',
                            data.lang,
                            {
                                ENTRY_TITLE: submittedHOF.fields.getTextInputValue(
                                    'hof-title-' + uid
                                ),
                                POST_AUTHOR: FormatUtils.userMention(author.id),
                                POST_URL: message.url,
                                POST_CONTENT: message.content,
                                POST_DESCRIPTION: descriptionText,
                                REQUESTER: FormatUtils.userMention(intr.user.id),
                                TIME: new Date().toString(),
                            }
                        );
                    } else {
                        entryEmbed = Lang.getEmbed(
                            'displayEmbeds.hallOfFameEntry_NoDesc',
                            data.lang,
                            {
                                ENTRY_TITLE: submittedHOF.fields.getTextInputValue(
                                    'hof-title-' + uid
                                ),
                                POST_AUTHOR: FormatUtils.userMention(author.id),
                                POST_URL: message.url,
                                POST_CONTENT: message.content,
                                REQUESTER: FormatUtils.userMention(intr.user.id),
                                TIME: new Date().toString(),
                            }
                        );
                    }
                    let hofPostAttachment: Attachment[] = [];
                    if (attachments.size > 0) {
                        attachments.forEach(file => {
                            hofPostAttachment.push(file);
                        });
                    }
                    // Add to MongoDB
                    const mongoClient = new MongoClient(Config.client.mongodb_url);
                    await mongoClient.connect();
                    const db: Db = mongoClient.db('messages');
                    const hallOfFameColl: MCollection = db.collection('hallOfFame');
                    const mongoDBEntry = {
                        message_link: message.url,
                        author: author,
                        message_content: message.content,
                        requester: requester,
                        description: descriptionText,
                        date_posted: message.createdTimestamp,
                        entry_title: submittedHOF.fields.getTextInputValue('hof-title-' + uid),
                        files: hofPostAttachment,
                    };

                    // Send to hall of fame channel
                    await hallOfFameChannel.send({
                        embeds: [entryEmbed],
                        files: hofPostAttachment,
                    });
                    await hallOfFameColl.insertOne(mongoDBEntry);
                    await mongoClient.close();
                    Logger.info('Hall of Fame Entry created!');
                }
            });
        }
    }
}
