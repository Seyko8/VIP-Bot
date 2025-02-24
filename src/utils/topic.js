const Ticket = require('../models/ticket');
const { MESSAGES } = require('../constants');

const getOrCreateTopic = async (ctx, userId) => {
    try {
        console.log("🔍 Suche nach einem bestehenden offenen Ticket für User:", userId);
        let ticket = await Ticket.findOne({ 
            where: { 
                userId: userId.toString(),
                status: 'open'
            } 
        });
        
        if (ticket) {
            console.log("🔍 Offenes Ticket gefunden. Überprüfe den Zugriff auf das Thema mit threadId:", ticket.threadId);
            try {
                await ctx.telegram.sendMessage(
                    process.env.ADMIN_GROUP_ID,
                    MESSAGES.CHECK_TOPIC_ACCESS,
                    { message_thread_id: parseInt(ticket.threadId) }
                );
                console.log("✅ Zugriff auf bestehendes Thema bestätigt.");
                return parseInt(ticket.threadId);
            } catch (error) {
                console.error("❌ Fehler beim Überprüfen des Zugriffs auf das Thema:", error);
                ticket.status = 'closed';
                await ticket.save();
            }
        }

        console.log("🔍 Erstelle ein neues Support-Ticket-Thema für User:", userId);
        const newTopic = await ctx.telegram.createForumTopic(
            process.env.ADMIN_GROUP_ID,
            `Support-Ticket: ${userId}`
        );

        console.log("🔍 Speichere neues Ticket in der Datenbank.");
        ticket = await Ticket.create({
            userId: userId.toString(),
            threadId: newTopic.message_thread_id.toString(),
            username: ctx.from.username || null,
            status: 'open'
        });

        const message = MESSAGES.NEW_SUPPORT_TICKET
            .replace('{userId}', userId)
            .replace('{username}', ctx.from.username ? '@' + ctx.from.username : 'Kein Username')
            .replace('{name}', `${ctx.from.first_name} ${ctx.from.last_name || ''}`)
            .replace('{language}', ctx.from.language_code || 'Keine Sprache festgelegt');

        console.log("🔍 Sende Benachrichtigung über das neue Support-Ticket-Thema.");
        await ctx.telegram.sendMessage(
            process.env.ADMIN_GROUP_ID,
            message,
            { message_thread_id: newTopic.message_thread_id }
        );

        console.log("✅ Neues Support-Ticket-Thema erfolgreich erstellt mit threadId:", newTopic.message_thread_id);
        return newTopic.message_thread_id;
    } catch (error) {
        console.error('❌ Fehler bei der Erstellung des Forum-Themas:', error);
        return null;
    }
}

module.exports = { getOrCreateTopic }; 