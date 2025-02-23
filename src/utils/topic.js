const Ticket = require('../models/ticket');
const { MESSAGES } = require('../constants');

const getOrCreateTopic = async (ctx, userId) => {
    try {
        let ticket = await Ticket.findOne({ 
            where: { 
                userId: userId.toString(),
                status: 'open'
            } 
        });
        
        if (ticket) {
            try {
                await ctx.telegram.sendMessage(
                    process.env.ADMIN_GROUP_ID,
                    MESSAGES.CHECK_TOPIC_ACCESS,
                    { message_thread_id: parseInt(ticket.threadId) }
                );
                return parseInt(ticket.threadId);
            } catch (error) {
                ticket.status = 'closed';
                await ticket.save();
            }
        }

        const newTopic = await ctx.telegram.createForumTopic(
            process.env.ADMIN_GROUP_ID,
            `Support-Ticket: ${userId}`
        );

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

        await ctx.telegram.sendMessage(
            process.env.ADMIN_GROUP_ID,
            message,
            { message_thread_id: newTopic.message_thread_id }
        );

        return newTopic.message_thread_id;
    } catch (error) {
        console.error('Error with forum topic:', error);
        return null;
    }
}

module.exports = { getOrCreateTopic }; 