const { Telegraf } = require('telegraf');
const { MESSAGES } = require('./constants');
const { handleStart, handleClose } = require('./handlers/commandHandlers');
const { handleAction, userLastCodeType } = require('./handlers/actionHandlers');
const { handlePrivateMessage, handleSupportMessage } = require('./handlers/messageHandlers');
const rateLimitMiddleware = require('./middleware/rateLimit');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(rateLimitMiddleware);

// ✅ **Speichert den letzten Code-Typ (25€, 50€, 100€)**
bot.context.userLastCodeType = userLastCodeType;

bot.command('start', handleStart);
bot.command('close', handleClose);

bot.action(/^redeem$/, handleAction);
bot.action(/^(accept|deny|ticket|faq-paket)_\d+$/, handleAction);

// ✅ **Markierung für 25€, 50€, 100€ Codes**
bot.action('redeem_25', async (ctx) => {
    console.log(`🔍 25€ Code angefordert von User: ${ctx.from.id}`);
    ctx.userLastCodeType.set(ctx.from.id.toString(), "25€");
    await ctx.reply(MESSAGES.SEND_25_CODE);
});

bot.action('redeem_100', async (ctx) => {
    console.log(`🔍 100€ Code angefordert von User: ${ctx.from.id}`);
    ctx.userLastCodeType.set(ctx.from.id.toString(), "100€");
    await ctx.reply(MESSAGES.SEND_100_CODE);
});

bot.action('redeem', async (ctx) => {
    console.log(`🔍 50€ Code angefordert von User: ${ctx.from.id}`);
    ctx.userLastCodeType.set(ctx.from.id.toString(), "50€");
    await ctx.reply(MESSAGES.SEND_CODE);
});

bot.action('faq-paket', async (ctx) => {
    console.log(`🔍 FAQ-Paket angefordert von User: ${ctx.from.id}`);
    
    const faqText = `
📌 **FAQ – Häufig gestellte Fragen**  

**• Sind direkte Zahlungen an ein Wallet möglich?**  
✅ Ja! Schreib **[@VIPWalletDirekt](https://t.me/VIPWalletDirekt)** an, um die Zahlungsinformationen zu erhalten.  

**• Ist der VIP-Status einmalig?**  
✅ Ja, sobald du einmal VIP bist, bleibst du für immer drin!  

**• Kann ich nicht einfach per Bank oder PayPal zahlen?**  
❌ Nein, wir akzeptieren **nur** Voucher-Codes.  

**• Die genannte Seite schickt mir keinen Code, was tun?**  
❗ Kein Stress! Du kannst deinen Voucher auch über eine **andere** Seite besorgen.  
⚠️ **Achtung:** Falscheingaben bei den Codes führen zu einem **permanenten Bann** auf Worldskandi!  
`;

    await ctx.reply(faqText, { parse_mode: 'Markdown' });
});


// ✅ **Nachrichten-Handler (Code senden & Support)**
bot.on('message', async (ctx) => {
    if (ctx.message.from.id === ctx.botInfo.id) {
        return;
    }

    if (ctx.chat.type === 'private') {
        await handlePrivateMessage(ctx, ctx.userLastCodeType);
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