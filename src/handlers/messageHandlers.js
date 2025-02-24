const { Markup } = require('telegraf');
const { MESSAGES } = require('../constants');
const { getOrCreateTopic } = require('../utils/topic');
const Ticket = require('../models/ticket');
const { safeSendMessage, safeSendPhoto, safeSendDocument, safeSendVideo } = require('../utils/messageHandler');
const { userLastCodeType } = require('../handlers/actionHandlers'); // ✅ Code-Typ Speicher importiert

const handlePrivateMessage = async (ctx) => {
    if (!ctx.message.text) return;

    const submittedCode = ctx.message.text.trim();
    const codePattern = /^[A-Z0-9]{32}$/;

    if (codePattern.test(submittedCode)) {
        const userId = ctx.from.id.toString();
        
        // ✅ **Hier wird geprüft, ob der User vorher einen Code-Typ (25€, 50€, 100€) gewählt hat**
        if (!userLastCodeType.has(userId)) {
            console.warn(`⚠️ WARNUNG: Kein gespeicherter Code-Typ für User ${userId}, setze Standard (50€)`);
            userLastCodeType.set(userId, "50€"); // Standard: 50€
        }

        const codeType = userLastCodeType.get(userId); // **Code-Typ abrufen**
        console.log(`📨 Code empfangen von User ${userId}: ${submittedCode} (Typ: ${codeType})`);

        // ✅ **Passende Gruppen-ID basierend auf Code-Typ setzen**
        let groupId;
        if (codeType === "100€") {
            groupId = process.env.GROUP_ID_100;
        } else if (codeType === "25€") {
            groupId = process.env.GROUP_ID_25;
        } else {
            groupId = process.env.GROUP_ID_50;
        }

        console.log(`🔍 Gruppen-ID für ${codeType}: ${groupId}`);

        const userInfo = `**Eingereichter Code**\n\n` +
            `👤 Benutzer: ${ctx.from.first_name} (@${ctx.from.username || 'none'})\n` +
            `🆔 **User ID:** ${ctx.from.id}\n` +
            `🔢 **Code:** \`${submittedCode}\`\n` +
            `💰 **Typ: ${codeType}**`;

        // ✅ **Accept/Ablehnen Buttons enthalten jetzt den Code-Typ**
        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('✅ Akzeptieren', `accept_${ctx.from.id}_${codeType}`),
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
    } catch (error) {
        console.error("❌ Fehler bei der Verarbeitung einer Support-Nachricht:", error);
    }
};

module.exports = {
    handlePrivateMessage
};