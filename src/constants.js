exports.MESSAGES = {
    WELCOME: `Willkommen bei unserem exklusiven VIP-Bereich! 🌟

        
⚠️Codes bitte nicht über Support versenden!!`,

    // ✅ Nachrichten für verschiedene Code-Pakete
    SEND_CODE: '🔹 Bitte sende mir deinen **50€ Code**. Der Code muss in der Nachricht sein und darf kein Bild/Video sein.',
    SEND_25_CODE: '🎫 Bitte sende mir deinen **25€ Code**. Der Code muss in der Nachricht sein und darf kein Bild/Video sein.',
    SEND_100_CODE: '💎 Bitte sende mir deinen **100€ Code**. Der Code muss in der Nachricht sein und darf kein Bild/Video sein.',

    // ✅ Wartemeldungen für verschiedene Codes
    WAITING_APPROVAL: '⏳ Dein **50€ Code** wurde eingereicht. Ein Admin wird ihn bald überprüfen.',
    WAITING_25_APPROVAL: '⏳ Dein **25€ Code** wurde eingereicht. Ein Admin wird ihn bald überprüfen.',
    WAITING_100_APPROVAL: '⏳ Dein **100€ Code** wurde eingereicht. Ein Admin wird ihn bald überprüfen.',

    // ✅ Erfolgsnachrichten für verschiedene Codes
    CODE_ACCEPTED: '✅ Dein **50€ Code** wurde akzeptiert! Hier ist dein Einladungslink:',
    CODE_25_ACCEPTED: '✅ Dein **25€ Code** wurde akzeptiert! Hier ist dein Einladungslink:',
    CODE_100_ACCEPTED: '✅ Dein **100€ Code** wurde akzeptiert! Hier ist dein Einladungslink:',

    // ✅ Ablehnungen, Support und allgemeine Nachrichten
    CODE_DENIED: '❌ Dein Code wurde leider abgelehnt. Bei Fragen kannst du gerne den Support kontaktieren.',
    MESSAGE_FORWARDED: '📨 Deine Nachricht wurde an den Support weitergeleitet.',
    INVALID_CODE_FORMAT: '❌ Ungültiges Code-Format. Bitte sende den gültigen 32-stelligen Code oder kontaktiere den Support.',
    ERROR_INVITE_LINK: '⚠️ Fehler beim Erstellen des Einladungslinks.',

    // ✅ Ticket- und Support-Meldungen
    TICKET_CREATED: '🎫 Dein Support-Ticket wurde erstellt. Bitte beschreibe dein Anliegen.',
    ERROR_CREATING_TICKET: '❌ Es gab einen Fehler beim Erstellen deines Tickets. Bitte versuche es später erneut.',
    TICKET_CLOSED: '🚪 Ticket wurde geschlossen.',
    TICKET_CLOSED_USER: '📩 Dein Support-Ticket wurde geschlossen. Bei weiteren Fragen kannst du jederzeit ein neues Ticket öffnen.',
    ERROR_CLOSING_TICKET: '⚠️ Fehler beim Schließen des Tickets.',

    // ✅ Admin-Meldungen
    CODE_ACCEPT_ADMIN: '✅ Code akzeptiert',
    CODE_DENY_ADMIN: '❌ Code abgelehnt',
    TICKET_CREATED_ADMIN: '🎫 Ticket erstellt',

    // ✅ Fehler- und Debug-Meldungen
    GENERAL_ERROR: '⚠️ Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
    MESSAGE_SENT_ADMIN: '✅ Nachricht wurde an den User weitergeleitet.',
    ERROR_SENDING_MESSAGE: '⚠️ Fehler beim Senden der Nachricht an den User.',
    
    RATE_LIMIT_EXCEEDED: '⚠️ Du hast zu viele Anfragen gesendet. Bitte warte einen Moment, bevor du es erneut versuchst.'
};

// ✅ Rate Limit Konfiguration
exports.RATE_LIMIT = {
    WINDOW_MS: 60000,  // 1 Minute
    MAX_REQUESTS: 10   // Maximal 10 Anfragen pro Minute
};