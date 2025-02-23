exports.MESSAGES = {
    WELCOME: `Willkommen bei unserem exklusiven VIP-Bereich! 🌟
\n
\n
    So wirst du Mitglied:
\n
    1️⃣ Kaufe einen 50€ Crypto Voucher über diesen Link:
\n
    (NUR CRYPTO-VOUCHER)
\n
    👉 https://kartedirekt.de/product/crypto-voucher-eur50
\n
    ❗ Wichtig: Du kannst auf der Website mit Paypal zahlen, FALLS kein Code generiert werden kann versucht andere Seiten❗
\n
\n
    2️⃣ Deine Vorteile als VIP-Mitglied (50€):
\n
        ✅ Regelmäßige Updates
\n
        ✅ Exklusive Inhalte
\n
        ✅ 24/7 Chat ohne Regeln
\n
    ‼️Und vieles mehr
\n
    🚀 Sichere dir jetzt deinen VIP-Zugang!
\n
\n
    👉 Bitte klicke auf den Knopf "Code einlösen" um deinen Zugang zu erhalten.
\n
⚠️Codes bitte nicht über Support versenden!!`,
    WAITING_APPROVAL: 'Vielen Dank für deine Anfrage. Ein Admin wird sich schnellstmöglich um dich kümmern.',
    TICKET_CREATED: 'Dein Support-Ticket wurde erstellt. Bitte beschreibe dein Anliegen.',
    ERROR_CREATING_TICKET: 'Es gab einen Fehler beim Erstellen deines Tickets. Bitte versuche es später erneut.',
    CODE_DENIED: 'Dein Code wurde leider abgelehnt. Bei Fragen kannst du gerne den Support kontaktieren.',
    MESSAGE_FORWARDED: 'Deine Nachricht wurde an den Support weitergeleitet.',
    SEND_CODE: 'Bitte sende mir deinen Code. Der Code muss in der Nachricht sein und darf kein Bild/Video sein.',
    INVALID_CODE_FORMAT: 'Ungültiges Code-Format. Bitte sende den gültigen 32-stelligen Code oder kontaktiere den Support.',
    CODE_ACCEPTED: 'Dein Code wurde akzeptiert! Hier ist dein Einladungslink:',
    CODE_ACCEPT_ADMIN: 'Code akzeptiert ✅',
    CODE_DENY_ADMIN: 'Code abgelehnt ❌',
    TICKET_CREATED_ADMIN: 'Ticket erstellt 🎫',
    ERROR_INVITE_LINK: 'Fehler beim Erstellen des Einladungslinks.',
    TICKET_CLOSED: 'Ticket wurde geschlossen.',
    TICKET_CLOSED_USER: 'Dein Support-Ticket wurde geschlossen. Bei weiteren Fragen kannst du jederzeit ein neues Ticket öffnen.',
    ERROR_CLOSING_TICKET: 'Fehler beim Schließen des Tickets.',
    NO_TICKET_FOUND: 'Kein aktives Ticket gefunden.\n\nThread ID: {threadId}\nBitte prüfe die Datenbank oder erstelle ein neues Ticket.',
    MESSAGE_SENT_ADMIN: '✅ Nachricht wurde an den User weitergeleitet.',
    ERROR_SENDING_MESSAGE: '❌ Fehler beim Senden der Nachricht an den User.\n\nUser ID: {userId}\nUsername: {username}\n\nMögliche Gründe:\n- User hat den Bot blockiert\n- User-Account wurde gelöscht\n- Bot wurde vom User gestoppt',
    TICKET_AUTO_CLOSED: 'Ticket wurde automatisch geschlossen.',
    SUPPORT_RESPONSE: 'Support Antwort:',
    USER_MESSAGE: 'Von User {userId}{username}:\n{text}',
    CHECK_TOPIC_ACCESS: 'Prüfe Topic-Zugriff...',
    NEW_SUPPORT_TICKET: '🆕 Neues Support-Ticket\n\nUser ID: {userId}\nUsername: {username}\nName: {name}\nSprache: {language}',
    GENERAL_ERROR: 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
    USER_INFO_TEMPLATE: `
User ID: {userId}
Username: @{username}
Name: {name}
Code: {code}
    `,
    RATE_LIMIT_EXCEEDED: 'Du hast zu viele Anfragen gesendet. Bitte warte einen Moment, bevor du es erneut versuchst.'
};

exports.RATE_LIMIT = {
    WINDOW_MS: 60000,
    MAX_REQUESTS: 10
};