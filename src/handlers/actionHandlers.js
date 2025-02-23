const { Markup } = require('telegraf');
const { MESSAGES } = require('../constants');
const { getOrCreateTopic } = require('../utils/topic');
const { createInviteLink } = require('../utils/inviteLink');
const { safeSendMessage, safeEditMessageText } = require('../utils/messageHandler');

// Speichert den letzten ausgewählten Code-Typ des Users
const userLastCodeType = new Map();

const actionHandlers = {
    redeem_25: async (ctx) => {
        console.log(`🔍 25€ Code einlösen angefordert von User: ${ctx.from.id}`);
        userLastCodeType.set(ctx.from.id.toString(), "25€"); 
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_25_CODE);
    },

    redeem_100: async (ctx) => {
        console.log(`🔍 100€ Code einlösen angefordert von User: ${ctx.from.id}`);
        userLastCodeType.set(ctx.from.id.toString(), "100€");
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_100_CODE);
    },

    redeem: async (ctx) => {
        console.log(`🔍 50€ Code einlösen angefordert von User: ${ctx.from.id}`);
        userLastCodeType.set(ctx.from.id.toString(), "50€");
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_CODE);
    },
    
    ticket: async (ctx) => {
        console.log(`📩 Support-Ticket wird für User: ${ctx.from.id} erstellt.`);
        const threadId = await getOrCreateTopic(ctx, ctx.from.id);
        if (!threadId) {
            console.error("❌ Fehler beim Erstellen des Support-Tickets!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_CREATING_TICKET);
        }
        return safeSendMessage(ctx, ctx.chat.id, MESSAGES.TICKET_CREATED);
    },

    accept: async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        console.log(`✅ Accept gedrückt: ${callbackData}`);

        // 🔍 User-ID aus den Callback-Daten extrahieren
        const match = callbackData.match(/^accept_(\d+)_(\d+)$/);
        if (!match) {
            console.error("❌ Fehler: Konnte User-ID nicht aus Callback-Daten extrahieren!");
            return;
        }

        const userId = match[1];
        const groupId = match[2];

        console.log(`✅ Code akzeptiert für User: ${userId}, Gruppe: ${groupId}`);

        if (!userId || isNaN(userId)) {
            console.error("❌ Ungültige userId erhalten!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.GENERAL_ERROR);
        }

        // ✅ Die richtige Gruppen-ID setzen
        const inviteLink = await createInviteLink(ctx, userId, groupId);

        if (!inviteLink) {
            console.error("❌ Fehler beim Erstellen des Invite-Links!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_INVITE_LINK);
        }

        console.log(`✅ Invite-Link erfolgreich erstellt: ${inviteLink}`);
        await safeSendMessage(ctx, userId, `${MESSAGES.CODE_ACCEPTED}\n🔗 **Dein Invite-Link:**\n${inviteLink}`);

        const updatedMessage = `${ctx.callbackQuery.message.text}\n\nStatus: ✅ Akzeptiert`;
        return safeEditMessageText(ctx, updatedMessage);
    },
    
    deny: async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        console.log(`❌ Deny gedrückt: ${callbackData}`);

        // 🔍 User-ID aus den Callback-Daten extrahieren
        const match = callbackData.match(/^deny_(\d+)$/);
        if (!match) {
            console.error("❌ Fehler: Konnte User-ID nicht aus Callback-Daten extrahieren!");
            return;
        }

        const userId = match[1];

        console.log(`❌ Code für User ${userId} abgelehnt.`);
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('✉️ Support kontaktieren', `ticket_${userId}`)]
        ]);

        const updatedMessage = `${ctx.callbackQuery.message.text}\n\nStatus: ❌ Abgelehnt`;
        await safeSendMessage(ctx, userId, MESSAGES.CODE_DENIED, keyboard);
        return safeEditMessageText(ctx, updatedMessage);
    }
};

const handleAction = async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    console.log("🔍 Empfangene Callback-Daten:", callbackData);

    const [action] = callbackData.split('_');
    const handler = actionHandlers[action];

    if (!handler) {
        console.error(`❌ Unbekannte Aktion: ${callbackData}`);
        return;
    }

    try {
        console.log(`🔍 Verarbeite Aktion: ${action}`);
        return await handler(ctx);
    } catch (error) {
        console.error(`❌ Fehler bei der Ausführung der Aktion ${action}:`, error);
    }
};

module.exports = {
    handleAction,
    actionHandlers,
    userLastCodeType
};