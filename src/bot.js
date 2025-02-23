const { Telegraf, Markup } = require('telegraf');
const { MESSAGES } = require('./constants');
const { handleStart, handleClose } = require('./handlers/commandHandlers');
const { handleAction, userLastCodeType } = require('./handlers/actionHandlers'); // ✅ Code-Typ speichern
const { handlePrivateMessage, handleSupportMessage } = require('./handlers/messageHandlers');
const rateLimitMiddleware = require('./middleware/rateLimit');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(rateLimitMiddleware);

bot.command('start', handleStart);
bot.command('close', handleClose);

bot.action(/^redeem$/, handleAction);
bot.action(/^(accept|deny|ticket)_\d+$/, handleAction);

// ✅ **KORRIGIERT: Code-Typ speichern für 25€, 50€, 100€**
bot.action('redeem_25', async (ctx) => {
    console.log(`🔍 25€ Code angefordert von User: ${ctx.from.id}`);
    userLastCodeType.set(ctx.from.id.toString(), "25€"); // ✅ Code-Typ speichern
    await ctx.reply(MESSAGES.SEND_25_CODE);
});

bot.action('redeem_100', async (ctx) => {
    console.log(`🔍 100€ Code angefordert von User: ${ctx.from.id}`);
    userLastCodeType.set(ctx.from.id.toString(), "100€"); // ✅ Code-Typ speichern
    await ctx.reply(MESSAGES.SEND_100_CODE);
});

bot.action('redeem', async (ctx) => {
    console.log(`🔍 50€ Code angefordert von User: ${ctx.from.id}`);
    userLastCodeType.set(ctx.from.id.toString(), "50€"); // ✅ Code-Typ speichern
    await ctx.reply(MESSAGES.SEND_CODE);
});

// ✅ **FAQ & Support Knopf**
bot.action('faq_packages', async (ctx) => {
    await ctx.reply(MESSAGES.FAQ_TEXT);
});

bot.action('ticket', async (ctx) => {
    await ctx.reply(MESSAGES.TICKET_CREATED);
});

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
    console.log("✅ Bot läuft...");
}).catch(err => {
    console.error("❌ Fehler beim Starten des Bots:", err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));