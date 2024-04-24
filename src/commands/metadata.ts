import {
    ApplicationCommandType,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';

// import { Args } from './index.js';
import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';

export const ChatCommandMetadata: {
    [command: string]: RESTPostAPIChatInputApplicationCommandsJSONBody;
} = {
    BET: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getRef('chatCommands.bet', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('chatCommands.bet'),
        description: Lang.getRef('commandDescs.bet', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('commandDescs.bet'),
        dm_permission: true,
        default_member_permissions: undefined,
    },
};

export const MessageCommandMetadata: {
    [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {};

export const UserCommandMetadata: {
    [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {};
