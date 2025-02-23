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

        // ✅ Abrufen, welchen Code-Typ der User eingelöst hat
        const storedUserId = userId.toString();
        const codeType = userLastCodeType.get(storedUserId) || "50€"; // Falls kein Typ gespeichert ist, Standard = 50€

        // ✅ Die richtige Gruppen-ID setzen
        let groupId;
        if (codeType === "100€") {
            groupId = process.env.GROUP_ID_100;
        } else if (codeType === "25€") {
            groupId = process.env.GROUP_ID_25;
        } else {
            groupId = process.env.GROUP_ID_50;
        }

        console.log(`🔍 Erstelle Invite-Link für User: ${userId} mit Code-Typ: ${codeType} und Gruppen-ID: ${groupId}`);
        const inviteLink = await createInviteLink(ctx, userId, groupId);

        if (!inviteLink) {
            console.error("❌ Fehler beim Erstellen des Invite-Links!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_INVITE_LINK);
        }

        // ✅ Unterschiedliche Bestätigungsmeldungen je nach Code-Typ
        let message;
        if (codeType === "100€") {
            message = MESSAGES.CODE_100_ACCEPTED;
        } else if (codeType === "25€") {
            message = MESSAGES.CODE_25_ACCEPTED;
        } else {
            message = MESSAGES.CODE_ACCEPTED;
        }

        console.log(`✅ Invite-Link erfolgreich erstellt: ${inviteLink}`);
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
