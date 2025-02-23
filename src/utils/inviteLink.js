const createInviteLink = async (ctx, userId, groupId) => {
    if (!groupId) {
        console.error("❌ Fehler: Gruppen-ID ist undefined!");
        return null;
    }

    const date = new Date().toISOString().split('T')[0];
    const title = `${userId}-${date}`;
    
    try {
        const link = await ctx.telegram.createChatInviteLink(
            groupId,  // Hier wird die richtige Gruppen-ID genutzt
            {
                name: title,
                member_limit: 1,
                creates_join_request: false
            }
        );
        return link.invite_link;
    } catch (error) {
        console.error('❌ Fehler beim Erstellen des Einladungslinks:', error);
        return null;
    }
}

module.exports = { createInviteLink };