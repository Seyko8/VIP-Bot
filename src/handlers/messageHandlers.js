const { Markup } = require('telegraf');
const { MESSAGES } = require('../constants');
const { getOrCreateTopic } = require('../utils/topic');
const Ticket = require('../models/ticket');
const { safeSendMessage, safeSendPhoto, safeSendDocument, safeSendVideo } = require('../utils/messageHandler');

const handlePrivateMessage = async (ctx) => {
    if (ctx.message.text) {
        const submittedCode = ctx.message.text.trim();
        const codePattern = /^[A-Z0-9]{32}$/;

        if (codePattern.test(submittedCode)) {
            const userInfo = MESSAGES.USER_INFO_TEMPLATE
                .replace('{userId}', ctx.from.id)
                .replace('{username}', ctx.from.username || 'none')
                .replace('{name}', `${ctx.from.first_name} ${ctx.from.last_name || ''}`)
                .replace('{code}', submittedCode);

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
        }
    }

    if (ctx.message.reply_to_message?.text === MESSAGES.SEND_CODE) {
        const submittedCode = ctx.message.text.trim();
        const codePattern = /^[A-Z0-9]{32}$/;

        if (!codePattern.test(submittedCode)) {
            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🎫 Code einlösen', callback_data: 'redeem' }],
                        [{ text: '✉️ Support kontaktieren', callback_data: `ticket_${ctx.from.id}` }]
                    ]
                }
            };
            await safeSendMessage(ctx, ctx.chat.id, MESSAGES.INVALID_CODE_FORMAT, keyboard);
            return;
        }

        const userInfo = MESSAGES.USER_INFO_TEMPLATE
            .replace('{userId}', ctx.from.id)
            .replace('{username}', ctx.from.username || 'none')
            .replace('{name}', `${ctx.from.first_name} ${ctx.from.last_name || ''}`)
            .replace('{code}', ctx.message.text);

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
    }

    try {
        const threadId = await getOrCreateTopic(ctx, ctx.from.id);
        if (threadId) {
            const message = MESSAGES.USER_MESSAGE
                .replace('{userId}', ctx.from.id)
                .replace('{username}', ctx.from.username ? ` (@${ctx.from.username})` : '')
                .replace('{text}', ctx.message.text);

            await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, message, {
                message_thread_id: threadId,
                parse_mode: 'HTML'
            });
            await safeSendMessage(ctx, ctx.chat.id, MESSAGES.MESSAGE_FORWARDED);
        }
    } catch (error) { }
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

        const supportName = ctx.message.from.username ?
            `@${ctx.message.from.username}` :
            ctx.message.from.first_name;

        let sent = false;
        const supportResponse = MESSAGES.SUPPORT_RESPONSE;

        if (ctx.message.photo) {
            const result = await safeSendPhoto(
                ctx,
                parseInt(ticket.userId),
                ctx.message.photo[ctx.message.photo.length - 1].file_id,
                {
                    caption: ctx.message.caption ?
                        `${supportResponse}\n${ctx.message.caption}` :
                        supportResponse
                }
            );
            sent = result !== null;
        } else if (ctx.message.document) {
            const result = await safeSendDocument(
                ctx,
                parseInt(ticket.userId),
                ctx.message.document.file_id,
                {
                    caption: ctx.message.caption ?
                        `${supportResponse}\n${ctx.message.caption}` :
                        supportResponse
                }
            );
            sent = result !== null;
        } else if (ctx.message.video) {
            const result = await safeSendVideo(
                ctx,
                parseInt(ticket.userId),
                ctx.message.video.file_id,
                {
                    caption: ctx.message.caption ?
                        `${supportResponse}\n${ctx.message.caption}` :
                        supportResponse
                }
            );
            sent = result !== null;
        } else if (ctx.message.text) {
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
    } catch (error) { }
};

module.exports = {
    handlePrivateMessage,
    handleSupportMessage
}; 