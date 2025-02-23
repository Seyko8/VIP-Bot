const { Markup } = require('telegraf');
const { MESSAGES } = require('../constants');
const { getOrCreateTopic } = require('../utils/topic');
const { createInviteLink } = require('../utils/inviteLink');
const { safeSendMessage, safeEditMessageText } = require('../utils/messageHandler');

// ✅ **Speichert den letzten Code-Typ (25€, 50€, 100€) pro User**
const userLastCodeType = new Map();

const actionHandlers = {
    redeem_25: async (ctx) => {
        console.log(`🔍 25€ Code angefordert von User: ${ctx.from.id}`);
        userLastCodeType.set(ctx.from.id.toString(), "25€");
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_25_CODE);
    },

    redeem_100: async (ctx) => {
        console.log(`🔍 100€ Code angefordert von User: ${ctx.from.id}`);
        userLastCodeType.set(ctx.from.id.toString(), "100€");
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_100_CODE);
    },

    redeem: async (ctx) => {
        console.log(`🔍 50€ Code angefordert von User: ${ctx.from.id}`);
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

    accept: async (ctx, userId, codeType) => {
        console.log(`✅ Accept gedrückt für User: ${userId}, Code-Typ: ${codeType}`);

        if (!userId || isNaN(userId)) {
            console.error("❌ Fehler: Ungültige User-ID!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.GENERAL_ERROR);
        }

        // ✅ **Gruppen-ID anhand des Code-Typs aus ENV**
        let groupId;
        if (codeType === "100€") {
            groupId = process.env.GROUP_ID_100;
        } else if (codeType === "25€") {
            groupId = process.env.GROUP_ID_25;
        } else {
            groupId = process.env.GROUP_ID_50;
        }

        console.log(`🔍 Gruppen-ID für ${codeType}: ${groupId}`);

        if (!groupId) {
            console.error("❌ Fehler: Gruppen-ID ist undefined!");
            return safeSendMessage(ctx, ctx.chat.id, "⚠️ Fehler: Gruppen-ID nicht gefunden. Bitte prüfe die .env Datei!");
        }

        // ✅ **Invite-Link generieren**
        const inviteLink = await createInviteLink(ctx, userId, groupId);

        if (!inviteLink) {
            console.error("❌ Fehler beim Erstellen des Invite-Links!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_INVITE_LINK);
        }

        // ✅ **Passende Nachricht basierend auf dem Code-Typ**
        let message;
        if (codeType === "100€") {
            message = MESSAGES.CODE_100_ACCEPTED;
        } else if (codeType === "25€") {
            message = MESSAGES.CODE_25_ACCEPTED;
        } else {
            message = MESSAGES.CODE_ACCEPTED;
        }

        console.log(`✅ Invite-Link erstellt: ${inviteLink}`);
        await safeSendMessage(ctx, userId, `${message}\n🔗 **Dein Invite-Link:**\n${inviteLink}`);

        const updatedMessage = `${ctx.callbackQuery.message.text}\n\nStatus: ✅ Akzeptiert`;
        return safeEditMessageText(ctx, updatedMessage);
    },

    deny: async (ctx, userId) => {
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

    const [action, userId, codeType] = callbackData.split('_');
    const handler = actionHandlers[action];

    if (!handler) {
        console.error(`❌ Unbekannte Aktion: ${callbackData}`);
        return;
    }

    try {
        console.log(`🔍 Verarbeite Aktion: ${action} für User: ${userId} | Code-Typ: ${codeType}`);
        return await handler(ctx, userId, codeType);
    } catch (error) {
        console.error(`❌ Fehler bei der Ausführung der Aktion ${action}:`, error);
    }
};

module.exports = {
    handleAction,
    userLastCodeType
};