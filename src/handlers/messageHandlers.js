const { Markup } = require('telegraf');
const { MESSAGES } = require('../constants');
const { getOrCreateTopic } = require('../utils/topic');
const Ticket = require('../models/ticket');
const { safeSendMessage, safeSendPhoto, safeSendDocument, safeSendVideo } = require('../utils/messageHandler');
const { userLastCodeType } = require('./actionHandlers'); // ✅ Code-Typ Speicher importieren

const handlePrivateMessage = async (ctx) => {
    if (ctx.message.text) {
        const submittedCode = ctx.message.text.trim();
        const codePattern = /^[A-Z0-9]{32}$/;

        // ✅ Prüfen, ob es ein gültiger Code ist
        if (codePattern.test(submittedCode)) {
            const codeType = userLastCodeType.get(ctx.from.id) || "❓ Unbekannt (manuell prüfen)"; // ✅ Code-Typ abrufen

            console.log(`📨 Code empfangen von User ${ctx.from.id}: ${submittedCode} (Typ: ${codeType})`);

            const userInfo = `**Eingereichter Code**\n\n` +
                `👤 Benutzer: ${ctx.from.first_name} (@${ctx.from.username || 'none'})\n` +
                `🆔 **User ID:** ${ctx.from.id}\n` +
                `🔢 **Code:** \`${submittedCode}\`\n` +
                `💰 **Typ: ${codeType}**`;

            const keyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback('✅ Akzeptieren', `accept_${ctx.from.id}`),
                    Markup.button.callback('❌ Ablehnen', `deny_${ctx.from.id}`)
                ],
                [Markup.button.callback('🎫 Ticket erstellen', `ticket_${ctx.from.id}`)]
            ]);

            await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, userInfo, keyboard);
            await safeSendMessage(ctx, ctx.chat.id, codeType === "100€" ? MESSAGES.WAITING_100_APPROVAL : MESSAGES.WAITING_APPROVAL);
            return;
        }
    }

    // ✅ Prüfen, ob der User einen **25€ oder 100€ Code** per Reply auf eine Bot-Nachricht sendet
    const lastMessage = ctx.message.reply_to_message?.text;
    if (lastMessage) {
        let codeType = "❓ Unbekannt (manuell prüfen)"; // Default
        if (lastMessage.includes(MESSAGES.SEND_25_CODE)) codeType = "25€";
        if (lastMessage.includes(MESSAGES.SEND_100_CODE)) codeType = "100€";

        const submittedCode = ctx.message.text.trim();
        const codePattern = /^[A-Z0-9]{32}$/;

        if (!codePattern.test(submittedCode)) {
            await safeSendMessage(ctx, ctx.chat.id, MESSAGES.INVALID_CODE_FORMAT);
            return;
        }

        console.log(`✅ Manuell erkannter Code-Typ: ${codeType}`);

        const userInfo = `**Eingereichter Code**\n\n` +
            `👤 Benutzer: ${ctx.from.first_name} (@${ctx.from.username || 'none'})\n` +
            `🆔 **User ID:** ${ctx.from.id}\n` +
            `🔢 **Code:** \`${submittedCode}\`\n` +
            `💰 **Typ: ${codeType}**`;

        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('✅ Akzeptieren', `accept_${ctx.from.id}`),
                Markup.button.callback('❌ Ablehnen', `deny_${ctx.from.id}`)
            ],
            [Markup.button.callback('🎫 Ticket erstellen', `ticket_${ctx.from.id}`)]
        ]);

        await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, userInfo, keyboard);
        await safeSendMessage(ctx, ctx.chat.id, codeType === "100€" ? MESSAGES.WAITING_100_APPROVAL : MESSAGES.WAITING_APPROVAL);
        return;
    }

    // ✅ Wenn keine Antwort erkannt wurde, dann wird es als Support behandelt
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
