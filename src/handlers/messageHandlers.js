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
            let codeType = userLastCodeType.get(ctx.from.id.toString()) || "❓ Unbekannt (manuell prüfen)"; // ✅ Code-Typ abrufen

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
            await safeSendMessage(ctx, ctx.chat.id, 
                codeType === "100€" ? MESSAGES.WAITING_100_APPROVAL :
                codeType === "25€" ? MESSAGES.WAITING_25_APPROVAL : 
                MESSAGES.WAITING_APPROVAL
            );
            return;
        }
    }

    // ✅ Prüfen, ob der User einen **25€, 50€, oder 100€ Code** per Reply auf eine Bot-Nachricht sendet
    const lastMessage = ctx.message.reply_to_message?.text;
    if (lastMessage) {
        let codeType = "❓ Unbekannt (manuell prüfen)"; // Standard
        if (lastMessage.includes(MESSAGES.SEND_25_CODE)) codeType = "25€";
        if (lastMessage.includes(MESSAGES.SEND_CODE)) codeType = "50€";
        if (lastMessage.includes(MESSAGES.SEND_100_CODE)) codeType = "100€";

        // ✅ Code speichern für die spätere Verwendung
        userLastCodeType.set(ctx.from.id.toString(), codeType);

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
        await safeSendMessage(ctx, ctx.chat.id, 
            codeType === "100€" ? MESSAGES.WAITING_100_APPROVAL :
            codeType === "25€" ? MESSAGES.WAITING_25_APPROVAL : 
            MESSAGES.WAITING_APPROVAL
        );
        return;
    }

    // ✅ Support-Nachrichten verarbeiten (unverändert)
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

// ✅ **Support-Bereich wiederhergestellt**
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

        const supportResponse = MESSAGES.SUPPORT_RESPONSE;

        let sent = false;
        if (ctx.message.photo) {
            sent = await safeSendPhoto(ctx, parseInt(ticket.userId), ctx.message.photo[ctx.message.photo.length - 1].file_id, {
                caption: ctx.message.caption ? `${supportResponse}\n${ctx.message.caption}` : supportResponse
            }) !== null;
        } else if (ctx.message.document) {
            sent = await safeSendDocument(ctx, parseInt(ticket.userId), ctx.message.document.file_id, {
                caption: ctx.message.caption ? `${supportResponse}\n${ctx.message.caption}` : supportResponse
            }) !== null;
        } else if (ctx.message.video) {
            sent = await safeSendVideo(ctx, parseInt(ticket.userId), ctx.message.video.file_id, {
                caption: ctx.message.caption ? `${supportResponse}\n${ctx.message.caption}` : supportResponse
            }) !== null;
        } else if (ctx.message.text) {
            sent = await safeSendMessage(ctx, parseInt(ticket.userId), `${supportResponse}\n${ctx.message.text}`) !== null;
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

// ✅ **Funktionen exportieren**
module.exports = {
    handlePrivateMessage,
    handleSupportMessage
};
