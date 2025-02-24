const { Markup } = require('telegraf');
const { MESSAGES } = require('../constants');
const { getOrCreateTopic } = require('../utils/topic');
const Ticket = require('../models/ticket');
const { safeSendMessage, safeSendPhoto, safeSendDocument, safeSendVideo } = require('../utils/messageHandler');

const handlePrivateMessage = async (ctx, userLastCodeType) => {
    if (!ctx.message.text) return;

    const submittedCode = ctx.message.text.trim();
    const codePattern = /^[A-Z0-9]{32}$/;

    if (codePattern.test(submittedCode)) {
        console.log(`📧 Code empfangen von User ${ctx.from.id}: ${submittedCode}`);

        const codeType = userLastCodeType.get(ctx.from.id.toString()) || "50€";

        const userInfo = `**Eingereichter Code (${codeType})**\n\n` +
            `👤 Benutzer: ${ctx.from.first_name} (@${ctx.from.username || 'none'})\n` +
            `🆔 **User ID:** ${ctx.from.id}\n` +
            `🔢 **Code:** \`${submittedCode}\``;

        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('✅ Akzeptieren', `accept_${ctx.from.id}`),
                Markup.button.callback('❌ Ablehnen', `deny_${ctx.from.id}`)
            ],
            [Markup.button.callback('🎫 Ticket erstellen', `ticket_${ctx.from.id}`)]
        ]);

        await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, userInfo, keyboard);
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.WAITING_APPROVAL);
        return;
    } else {
        await safeSendMessage(ctx, ctx.chat.id, "Ungültiger Code. Bitte geben Sie einen 32-stelligen Code ein.");
    }
};

const handleSupportMessage = async (ctx) => {
    if (!ctx.message.message_thread_id) {
        return;
    }

    try {
        const ticket = await Ticket.findOne({
            where: {
                threadId: ctx.message.message_thread_id.toString(),
                status: 'open'
            }
        });

        if (!ticket) {
            return safeSendMessage(ctx, ctx.chat.id, MESSAGES.NO_TICKET_FOUND.replace('{threadId}', ctx.message.message_thread_id));
        }

        let sent = false;
        const supportResponse = MESSAGES.SUPPORT_RESPONSE;

        if (ctx.message.text) {
            const result = await safeSendMessage(
                ctx,
                parseInt(ticket.userId),
                `${supportResponse}\n${ctx.message.text}`
            );
            sent = result !== null;
        }

        if (sent) {
            await safeSendMessage(ctx, ctx.chat.id, MESSAGES.MESSAGE_SENT_ADMIN, {
                message_thread_id: ctx.message.message_thread_id
            });
        } else {
            const errorMessage = MESSAGES.ERROR_SENDING_MESSAGE
                .replace('{userId}', ticket.userId)
                .replace('{username}', ticket.username || 'Kein Username');

            await safeSendMessage(ctx, ctx.chat.id, errorMessage, {
                message_thread_id: ctx.message.message_thread_id
            });
        }
    } catch (error) {
        console.error("❌ Fehler bei der Verarbeitung einer Support-Nachricht:", error);
    }
};

module.exports = {
    handlePrivateMessage,
    handleSupportMessage
};