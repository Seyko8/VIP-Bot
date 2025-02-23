const { Telegraf } = require('telegraf');
const { MESSAGES } = require('./constants');
const { handleStart, handleClose } = require('./handlers/commandHandlers');
const { handleAction } = require('./handlers/actionHandlers');
const { handlePrivateMessage, handleSupportMessage } = require('./handlers/messageHandlers');
const rateLimitMiddleware = require('./middleware/rateLimit');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(rateLimitMiddleware);

bot.command('start', handleStart);
bot.command('close', handleClose);

bot.action(/^redeem$/, handleAction);
bot.action(/^(accept|deny|ticket)_\d+$/, handleAction);

bot.on('message', async (ctx) => {
    if (ctx.message.from.id === ctx.botInfo.id) {
        return;
    }

    if (ctx.chat.type === 'private') {
        await handlePrivateMessage(ctx);
    } else if (ctx.chat.id.toString() === process.env.ADMIN_GROUP_ID) {
        await handleSupportMessage(ctx);
    }
});

bot.catch((err, ctx) => {
    ctx.reply(MESSAGES.GENERAL_ERROR);
});

bot.launch().then(() => {
}).catch(err => {
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
