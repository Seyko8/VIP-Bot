const { MESSAGES } = require('../constants');
const { safeSendMessage } = require('../utils/messageHandler');

const handlePrivateMessage = async (ctx, userLastCodeType) => {
    const userId = ctx.from.id.toString();
    const lastCodeType = userLastCodeType.get(userId);

    if (lastCodeType === "25€") {
        await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, MESSAGES.USER_MESSAGE.replace('{userId}', userId).replace('{username}', ctx.from.username ? `@${ctx.from.username}` : '').replace('{name}', `${ctx.from.first_name} ${ctx.from.last_name || ''}`).replace('{text}', ctx.message.text));
        return await safeSendMessage(ctx, ctx.chat.id, MESSAGES.WAITING_25_APPROVAL);
    }

    if (lastCodeType === "50€") {
        await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, MESSAGES.USER_MESSAGE.replace('{userId}', userId).replace('{username}', ctx.from.username ? `@${ctx.from.username}` : '').replace('{name}', `${ctx.from.first_name} ${ctx.from.last_name || ''}`).replace('{text}', ctx.message.text));
        return await safeSendMessage(ctx, ctx.chat.id, MESSAGES.WAITING_APPROVAL);
    }

    if (lastCodeType === "100€") {
        await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, MESSAGES.USER_MESSAGE.replace('{userId}', userId).replace('{username}', ctx.from.username ? `@${ctx.from.username}` : '').replace('{name}', `${ctx.from.first_name} ${ctx.from.last_name || ''}`).replace('{text}', ctx.message.text));
        return await safeSendMessage(ctx, ctx.chat.id, MESSAGES.WAITING_100_APPROVAL);
    }

    console.log(`🔍 Support-Nachricht von User ${userId}`);
    await safeSendMessage(ctx, process.env.ADMIN_GROUP_ID, MESSAGES.USER_MESSAGE.replace('{userId}', userId).replace('{username}', ctx.from.username ? `@${ctx.from.username}` : '').replace('{name}', `${ctx.from.first_name} ${ctx.from.last_name || ''}`).replace('{text}', ctx.message.text));
    return await safeSendMessage(ctx, ctx.chat.id, MESSAGES.MESSAGE_FORWARDED);
};

const handleSupportMessage = async (ctx) => {
    // Hier kannst du weitere Logik hinzufügen, um Support-Nachrichten zu verarbeiten
};

module.exports = {
    handlePrivateMessage,
    handleSupportMessage
};