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
        userLastCodeType.set(ctx.from.id.toString(), "25€"); // ✅ Code-Typ speichern
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_25_CODE);
    },

    redeem_100: async (ctx) => {
        console.log(`🔍 100€ Code einlösen angefordert von User: ${ctx.from.id}`);
        userLastCodeType.set(ctx.from.id.toString(), "100€"); // ✅ Code-Typ speichern
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_100_CODE);
    },

    redeem: async (ctx) => {
        console.log(`🔍 50€ Code einlösen angefordert von User: ${ctx.from.id}`);
        userLastCodeType.set(ctx.from.id.toString(), "50€"); // ✅ Code-Typ speichern
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

    accept: async (ctx, userId) => {
        console.log(`✅ Code akzeptiert für User: ${userId}`);

        if (!userId || isNaN(userId)) {
            console.error("❌ Ungültige userId erhalten!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.GENERAL_ERROR);
        }

        const inviteLink = await createInviteLink(ctx, userId);
        
        if (!inviteLink) {
            console.error("❌ Fehler beim Erstellen des Invite-Links!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_INVITE_LINK);
        }

        console.log(`✅ Invite-Link erfolgreich erstellt: ${inviteLink}`);
        await safeSendMessage(ctx, userId, `${MESSAGES.CODE_ACCEPTED}\n🔗 **Dein Invite-Link:**\n${inviteLink}`);

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
        console.log(`🔍 Verarbeite Aktion: ${action} für User: ${userId}`);
        return await handler(ctx, userId);
    } catch (error) {
        console.error(`❌ Fehler bei der Ausführung der Aktion ${action}:`, error);
    }
};

const handleTicketCreation = async (ctx, userId) => {
    console.log(`🎫 Ticket-Erstellung für User ${userId} gestartet.`);
    const threadId = await getOrCreateTopic(ctx, userId);

    if (!threadId) {
        console.error("❌ Fehler beim Erstellen des Tickets!");
        return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_CREATING_TICKET);
    }

    await safeSendMessage(ctx, userId, MESSAGES.TICKET_CREATED);
    return safeEditMessageText(ctx, MESSAGES.TICKET_CREATED_ADMIN);
};

module.exports = {
    handleAction,
    handleTicketCreation,
    actionHandlers,
    userLastCodeType // ✅ WICHTIG: Hier exportieren, damit `messageHandlers.js` darauf zugreifen kann
};
