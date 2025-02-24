const { Telegram } = require('telegraf');

const createInviteLink = async (ctx, userId, chatId, options) => {
    try {
        const link = await ctx.telegram.createChatInviteLink(chatId, {
            name: `${userId}-${new Date().toISOString().split('T')[0]}`,
            ...options
        });
        return link.invite_link;
    } catch (error) {
        console.error('❌ Fehler beim Erstellen des Einladungslinks:', error);
        throw error;
    }
};

module.exports = {
    createInviteLink
};