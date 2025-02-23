const { Markup } = require('telegraf');
const { MESSAGES } = require('../constants');
const { getOrCreateTopic } = require('../utils/topic');
const { createInviteLink } = require('../utils/inviteLink');
const { safeSendMessage, safeEditMessageText } = require('../utils/messageHandler');

// Speichert, welchen Code-Typ der User zuletzt ausgewählt hat
const userLastCodeType = new Map();

const actionHandlers = {
    redeem_25: async (ctx) => {
        console.log(`🔍 25€ Code einlösen angefordert von User: ${ctx.from.id}`);
        userLastCodeType.set(ctx.from.id, "25€"); // Code-Typ speichern
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_25_CODE);
    },

    redeem_100: async (ctx) => {
        console.log(`🔍 100€ Code einlösen angefordert von User: ${ctx.from.id}`);
        userLastCodeType.set(ctx.from.id, "100€"); // Code-Typ speichern
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_100_CODE);
    },

    redeem: async (ctx) => {
        await safeEditMessageText(ctx, MESSAGES.WELCOME);
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.SEND_CODE, {
            reply_markup: {
                force_reply: true,
                selective: true
            }
        });
    },
    
    ticket: async (ctx) => {
        const threadId = await getOrCreateTopic(ctx, ctx.from.id);
        if (!threadId) {
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_CREATING_TICKET);
        }
        return safeSendMessage(ctx, ctx.chat.id, MESSAGES.TICKET_CREATED);
    },
    
    accept: async (ctx, userId) => {
        const inviteLink = await createInviteLink(ctx, userId);
        
        if (!inviteLink) {
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_INVITE_LINK);
        }

        const originalMessage = ctx.callbackQuery.message.text;
        const updatedMessage = `${originalMessage}\n\nStatus: ✅ Akzeptiert`;
        
        await safeSendMessage(ctx, userId, `${MESSAGES.CODE_ACCEPTED}\n${inviteLink}`);
        return safeEditMessageText(ctx, updatedMessage);
    },
    
    deny: async (ctx, userId) => {
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('✉️ Support kontaktieren', `ticket_${userId}`)]
        ]);

        const originalMessage = ctx.callbackQuery.message.text;
        const updatedMessage = `${originalMessage}\n\nStatus: ❌ Abgelehnt`;
        
        await safeSendMessage(ctx, userId, MESSAGES.CODE_DENIED, keyboard);
        return safeEditMessageText(ctx, updatedMessage);
    }
};

const handleAction = async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const [action, userId] = callbackData.split('_');
    const handler = actionHandlers[action];
    
    if (!handler) {
        return;
    }
    
    try {
        return await handler(ctx, userId);
    } catch (error) {
        return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_GENERIC);
    }
};

const handleTicketCreation = async (ctx, userId) => {
    const threadId = await getOrCreateTopic(ctx, userId);
    
    if (!threadId) {
        return safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_CREATING_TICKET);
    }
    
    await safeSendMessage(ctx, userId, MESSAGES.TICKET_CREATED);
    return safeEditMessageText(ctx, MESSAGES.TICKET_CREATED_ADMIN);
};

module.exports = {
    handleAction,
    handleTicketCreation,
    actionHandlers,
    userLastCodeType // WICHTIG: Hier exportieren, damit `messageHandlers.js` darauf zugreifen kann
};
