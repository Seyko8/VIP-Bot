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

    ticket: async (ctx, userId) => {
        console.log(`📩 Support-Ticket wird für User: ${userId} erstellt.`);
        const threadId = await getOrCreateTopic(ctx, userId);
        if (!threadId) {
            console.error("❌ Fehler beim Erstellen des Support-Tickets!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_CREATING_TICKET);
        }
        return safeSendMessage(ctx, ctx.chat.id, MESSAGES.TICKET_CREATED);
    },

    accept: async (ctx, userId) => {
        console.log(`✅ Accept gedrückt für User: ${userId}`);

        if (!userId || isNaN(userId)) {
            console.error("❌ Fehler: Ungültige User-ID!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.GENERAL_ERROR);
        }

        // ✅ **Code-Typ aus der Map abrufen**
        const storedUserId = userId.toString();
        const codeType = userLastCodeType.get(storedUserId) || "50€"; // Falls kein Typ gespeichert ist, Standard = 50€

        // ✅ **Gruppen-ID anhand des Code-Typs aus ENV**
        let groupIds = [];
        if (codeType === "100€") {
            groupIds = [
                process.env.GROUP_ID_100_1,
                process.env.GROUP_ID_100_2,
                process.env.GROUP_ID_100_3,
                process.env.GROUP_ID_100_4,
            ];
        } else if (codeType === "25€") {
            groupIds = [process.env.GROUP_ID_25];
        } else {
            groupIds = [
                process.env.GROUP_ID_50_1,
                process.env.GROUP_ID_50_2,
            ];
        }

        console.log(`🔍 Gruppen-IDs für ${codeType}: ${groupIds}`);

        if (groupIds.includes(undefined)) {
            console.error("❌ Fehler: Eine oder mehrere Gruppen-IDs sind undefined!");
            return safeSendMessage(ctx, ctx.chat.id, "⚠️ Fehler: Eine oder mehrere Gruppen-IDs nicht gefunden. Bitte prüfe die .env Datei!");
        }

        // ✅ **Invite-Link generieren**
        const inviteLinks = [];
        const inviteLinkCount = codeType === "100€" ? 4 : 1; // Reduziere die Anzahl der Links für 25€
        for (let i = 0; i < inviteLinkCount; i++) {
            const inviteLink = await createInviteLink(ctx, userId, groupIds[i % groupIds.length], { expires_in: 86400, member_limit: 1 });
            if (!inviteLink) {
                console.error("❌ Fehler beim Erstellen des Invite-Links!");
                return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_INVITE_LINK);
            }
            inviteLinks.push(inviteLink);
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

        console.log(`✅ Invite-Links erstellt: ${inviteLinks.join('\n')}`);
        await safeSendMessage(ctx, userId, `${message}\n🔗 **Deine Invite-Links:**\n${inviteLinks.join('\n')}`);

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

    const [action, userId] = callbackData.split('_');
    const handler = actionHandlers[action];

    if (!handler) {
        console.error(`❌ Unbekannte Aktion: ${callbackData}`);
        return;
    }

    try {
        console.log(`🔍 Verarbeite Aktion: ${action} für User: ${userId} | Code-Typ: ${userLastCodeType.get(userId)}`);
        return await handler(ctx, userId);
    } catch (error) {
        console.error(`❌ Fehler bei der Ausführung der Aktion ${action}:`, error);
    }
};

module.exports = {
    handleAction,
    userLastCodeType // ✅ Exportiert, damit `messageHandlers.js` darauf zugreifen kann
};