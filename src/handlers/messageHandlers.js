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
            const userInfo = `📌 **Eingereichter Code**\n\n`
                + `👤 Benutzer: ${ctx.from.first_name} (@${ctx.from.username || 'none'})\n`
                + `🆔 **User ID:** ${ctx.from.id}\n`
                + `🔢 **Code:** \`${submittedCode}\`\n`
                + `💰 **Typ: Unbekannt (manuell prüfen)**`;

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

    // ✅ 25€ Code prüfen
    if (ctx.message.reply_to_message?.text === MESSAGES.SEND_25_CODE) {
        const submittedCode = ctx.message.text.trim();
        const codePattern = /^[A-Z0-9]{32}$/;

        if (!codePattern.test(submittedCode)) {
            await safeSendMessage(ctx, ctx.chat.id, MESSAGES.INVALID_CODE_FORMAT);
            return;
        }

        const userInfo = `📌 **Eingereichter Code**\n\n`
            + `👤 Benutzer: ${ctx.from.first_name} (@${ctx.from.username || 'none'})\n`
            + `🆔 **User ID:** ${ctx.from.id}\n`
            + `🔢 **Code:** \`${submittedCode}\`\n`
            + `💰 **Typ: 25€ Code** ✅`;

        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('✅ Akzeptieren', `accept_25_${ctx.from.id}`),
                Markup.button.callback('❌ Ablehnen', `deny_25_${ctx.from.id}`)
            ],
            [Markup.button.callback('🎫 Ticket erstellen', `ticket_${ctx.from.id}`)]
        ]);

        await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, userInfo, keyboard);
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.WAITING_APPROVAL);
        return;
    }

    // ✅ 100€ Code prüfen
    if (ctx.message.reply_to_message?.text === MESSAGES.SEND_100_CODE) {
        const submittedCode = ctx.message.text.trim();
        const codePattern = /^[A-Z0-9]{32}$/;

        if (!codePattern.test(submittedCode)) {
            await safeSendMessage(ctx, ctx.chat.id, MESSAGES.INVALID_CODE_FORMAT);
            return;
        }

        const userInfo = `📌 **Eingereichter Code**\n\n`
            + `👤 Benutzer: ${ctx.from.first_name} (@${ctx.from.username || 'none'})\n`
            + `🆔 **User ID:** ${ctx.from.id}\n`
            + `🔢 **Code:** \`${submittedCode}\`\n`
            + `💰 **Typ: 100€ Code** ✅`;

        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('✅ Akzeptieren', `accept_100_${ctx.from.id}`),
                Markup.button.callback('❌ Ablehnen', `deny_100_${ctx.from.id}`)
            ],
            [Markup.button.callback('🎫 Ticket erstellen', `ticket_${ctx.from.id}`)]
        ]);

        await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, userInfo, keyboard);
        await safeSendMessage(ctx, ctx.chat.id, MESSAGES.WAITING_100_APPROVAL);
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

// ✅ **Funktionen exportieren**
module.exports = {
    handlePrivateMessage
};
