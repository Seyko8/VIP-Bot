const createInviteLink = async (ctx, userId) => {
    const date = new Date().toISOString().split('T')[0];
    const title = `${userId}-${date}`;
    
    try {
        const link = await ctx.telegram.createChatInviteLink(
            process.env.INVITED_GROUP_ID,
            {
                name: title,
                member_limit: 1,
                creates_join_request: false
            }
        );
        return link.invite_link;
    } catch (error) {
        console.error('Error creating invite link:', error);
        return null;
    }
}

module.exports = { createInviteLink }; 