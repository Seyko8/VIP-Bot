const { MESSAGES } = require('../constants');

const isBlockedError = (error) => {
    return error.message.includes('Forbidden: bot was blocked by the user') ||
           error.message.includes('bot was kicked from the group chat') ||
           error.message.includes('user is deactivated') ||
           error.message.includes('chat not found');
};

const safeSendMessage = async (ctx, chatId, message, options = {}) => {
    try {
        return await ctx.telegram.sendMessage(chatId, message, options);
    } catch (error) {
        if (isBlockedError(error)) {
            return null;
        }
        throw error;
    }
};

const safeSendPhoto = async (ctx, chatId, photo, options = {}) => {
    try {
        return await ctx.telegram.sendPhoto(chatId, photo, options);
    } catch (error) {
        if (isBlockedError(error)) {
            return null;
        }
        throw error;
    }
};

const safeSendDocument = async (ctx, chatId, document, options = {}) => {
    try {
        return await ctx.telegram.sendDocument(chatId, document, options);
    } catch (error) {
        if (isBlockedError(error)) {
            return null;
        }
        throw error;
    }
};

const safeSendVideo = async (ctx, chatId, video, options = {}) => {
    try {
        return await ctx.telegram.sendVideo(chatId, video, options);
    } catch (error) {
        if (isBlockedError(error)) {
            return null;
        }
        throw error;
    }
};

const safeEditMessageText = async (ctx, text, options = {}) => {
    try {
        return await ctx.editMessageText(text, options);
    } catch (error) {
        if (isBlockedError(error)) {
            return null;
        }
        throw error;
    }
};

module.exports = {
    safeSendMessage,
    safeSendPhoto,
    safeSendDocument,
    safeSendVideo,
    safeEditMessageText,
    isBlockedError
}; 