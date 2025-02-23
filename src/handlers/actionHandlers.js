const { Markup } = require('telegraf');
const { MESSAGES } = require('../constants');
const { createInviteLink } = require('../utils/inviteLink');
const { safeSendMessage, safeEditMessageText } = require('../utils/messageHandler');

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
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.TICKET_CREATED);
    },

    accept: async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        console.log(`✅ Accept gedrückt: ${callbackData}`);

        // 🔍 Debug: Original Callback-Daten ausgeben
        console.log(`📌 DEBUG: Callback-Daten = ${JSON.stringify(ctx.callbackQuery)}`);

        // 🔍 User-ID & Gruppen-ID korrekt auslesen
        const match = callbackData.match(/^accept_(\d+)_(\d+)$/);
        if (!match) {
            console.error("❌ Fehler: Ungültige Callback-Daten erhalten!", callbackData);
            return safeSendMessage(ctx, ctx.chat.id, "❌ Fehler: Ungültige Callback-Daten!");
        }

        const userId = match[1];
        const groupId = match[2];

        console.log(`✅ Code akzeptiert für User: ${userId}, Gruppe: ${groupId}`);

        // ✅ Invite-Link erstellen
        console.log(`🔍 Erstelle Invite-Link für User: ${userId} in Gruppe: ${groupId}`);
        const inviteLink = await createInviteLink(ctx, userId, groupId);

        if (!inviteLink) {
            console.error("❌ Fehler beim Erstellen des Invite-Links!");
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_INVITE_LINK);
        }

        console.log(`✅ Invite-Link erfolgreich erstellt: ${inviteLink}`);
        await safeSendMessage(ctx, userId, `${MESSAGES.CODE_ACCEPTED}\n🔗 **Dein Invite-Link:**\n${inviteLink}`);

        // ✅ Nachricht in der Admin-Gruppe aktualisieren
        console.log(`📌 DEBUG: Update Admin-Gruppe Nachricht`);
        const updatedMessage = `${ctx.callbackQuery.message.text}\n\nStatus: ✅ Akzeptiert`;
        return safeEditMessageText(ctx, updatedMessage);
    },
    
    deny: async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        console.log(`❌ Deny gedrückt: ${callbackData}`);

        // 🔍 Debug: Original Callback-Daten ausgeben
        console.log(`📌 DEBUG: Callback-Daten = ${JSON.stringify(ctx.callbackQuery)}`);

        const match = callbackData.match(/^deny_(\d+)$/);
        if (!match) {
            console.error("❌ Fehler: Konnte User-ID nicht aus Callback-Daten extrahieren!", callbackData);
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

    // 🔍 Debug: Callback-Daten genauer ansehen
    console.log(`📌 DEBUG: Komplette Callback-Daten = ${JSON.stringify(ctx.callbackQuery)}`);

    const actionType = callbackData.split('_')[0]; // `accept` oder `deny`
    const handler = actionHandlers[actionType];

    if (!handler) {
        console.error(`❌ Unbekannte Aktion: ${callbackData}`);
        return;
    }

    try {
        console.log(`🔍 Verarbeite Aktion: ${actionType}`);
        return await handler(ctx);
    } catch (error) {
        console.error(`❌ Fehler bei der Ausführung der Aktion ${actionType}:`, error);
    }
};

module.exports = {
    handleAction,
    actionHandlers,
    userLastCodeType
};