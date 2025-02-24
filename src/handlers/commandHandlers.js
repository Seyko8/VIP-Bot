const { Markup } = require('telegraf');
const { MESSAGES } = require('../constants');
const Ticket = require('../models/ticket');
const rateLimiter = require('../utils/rateLimiter');
const { safeSendMessage } = require('../utils/messageHandler');

const handleStart = (ctx) => {
    if (ctx.chat.type !== 'private') return;
    
    if (rateLimiter.isRateLimited(ctx.from.id)) {
        return safeSendMessage(ctx, ctx.chat.id, MESSAGES.RATE_LIMIT_EXCEEDED);
    }

    // ✅ Neue Buttons für 25€, 100€ und FAQ-Paket hinzugefügt (Rest bleibt gleich)
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎫 50€ Paket', 'redeem')],
        [Markup.button.callback('💰 25€ Paket', 'redeem_25')],
        [Markup.button.callback('💎 100€ Paket', 'redeem_100')],
        [Markup.button.callback('📚 FAQ-Paket', 'faq-paket')],
        [Markup.button.callback('✉️ Support kontaktieren', 'ticket')]
    ]);

    safeSendMessage(ctx, ctx.chat.id, MESSAGES.WELCOME, keyboard);
};

const handleClose = async (ctx) => {
    if (!ctx.message.is_topic_message) return;

    try {
        const ticket = await Ticket.findOne({ 
            where: { threadId: ctx.message.message_thread_id.toString() }
        });

        if (ticket) {
            await ticket.update({ status: 'closed' });
            await safeSendMessage(ctx, ctx.chat.id, MESSAGES.TICKET_CLOSED);
            await safeSendMessage(ctx, ticket.userId, MESSAGES.TICKET_CLOSED_USER);
        }
    } catch (error) {
        console.error('Error closing ticket:', error);
        safeSendMessage(ctx, ctx.chat.id, MESSAGES.ERROR_CLOSING_TICKET);
    }
};

module.exports = {
    handleStart,
    handleClose
};
