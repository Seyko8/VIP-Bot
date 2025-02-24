exports.MESSAGES = {
    WELCOME: `Willkommen bei unserem exklusiven VIP-Bereich! 🌟

So wirst du Mitglied:

1️⃣ Kaufe einen Crypto Voucher über diesen Link:
👉 https://kartedirekt.de/zahlungsmittel/crypto-voucher

💡 (NUR CRYPTO-VOUCHER!)

❗ Wichtig: Du kannst auf der Website mit PayPal zahlen.
Falls kein Code generiert werden kann, versuche andere Seiten. ❗

Deine Vorteile als VIP-Mitglied:

✅ Regelmäßige Updates
✅ Exklusive Inhalte
✅ 24/7 Chat ohne Regeln
✅ Für VIP+ Member mehrere Speicherfunktionen!
‼️ Und vieles mehr!

VIP-Pakete:

💰 25€ 24H Paket: •Eine 24H Gruppe ohne Schließung und nie endenden Videos und Bilder! 

💎 50€ VIP Paket: •Unser VIP Ordner Paket mit über 190 von euch gefragten OF, MYM und Breezels-Leaks + 24H Gruppe inklusive

👑 100€ VIP+ Paket: •Die oben genannten Punkte + Eine Speicherfunktion für die 24H Gruppe + Zusendung von allen Videos, die in die Hauptgruppe geschickt werden + Snapkanal, wo exklusive Snapchat-Videos kommen 

👉 Klicke auf den Knopf “Code einlösen”, um deinen Zugang zu erhalten.

⚠️ Codes bitte nicht über den Support versenden! ⚠️`, // ✅ **Hier fehlte das Komma `,` am Ende!**
  
    WAITING_APPROVAL: 'Vielen Dank für deine Anfrage. Ein Admin wird sich schnellstmöglich um dich kümmern.',
    TICKET_CREATED: 'Dein Support-Ticket wurde erstellt. Bitte beschreibe dein Anliegen.',
    ERROR_CREATING_TICKET: 'Es gab einen Fehler beim Erstellen deines Tickets. Bitte versuche es später erneut.',
    CODE_DENIED: 'Dein Code wurde leider abgelehnt. Bei Fragen kannst du gerne den Support kontaktieren.',
    MESSAGE_FORWARDED: 'Deine Nachricht wurde an den Support weitergeleitet.',

    SEND_CODE: 'Bitte sende mir deinen **50€ Code**. Der Code muss in der Nachricht sein und darf kein Bild/Video sein.',
    SEND_25_CODE: 'Bitte sende mir deinen **25€ Code**. Der Code muss in der Nachricht sein und darf kein Bild/Video sein.',
    SEND_100_CODE: 'Bitte sende mir deinen **100€ Code**. Der Code muss in der Nachricht sein und darf kein Bild/Video sein.',

    WAITING_25_APPROVAL: 'Dein **25€ Code** wurde eingereicht. Ein Admin wird ihn bald überprüfen.',
    WAITING_100_APPROVAL: 'Dein **100€ Code** wurde eingereicht. Ein Admin wird ihn bald überprüfen.',

    CODE_ACCEPTED: '✅ Dein **50€ Code** wurde akzeptiert! Hier ist dein Einladungslink:',
    CODE_25_ACCEPTED: '✅ Dein **25€ Code** wurde akzeptiert! Hier ist dein Einladungslink:',
    CODE_100_ACCEPTED: '✅ Dein **100€ Code** wurde akzeptiert! Hier ist dein Einladungslink:',

    CODE_ACCEPT_ADMIN: 'Code akzeptiert ✅',
    CODE_DENY_ADMIN: 'Code abgelehnt ❌',
    TICKET_CREATED_ADMIN: 'Ticket erstellt 🎫',
    ERROR_INVITE_LINK: 'Fehler beim Erstellen des Einladungslinks.',
    TICKET_CLOSED: 'Ticket wurde geschlossen.',
    TICKET_CLOSED_USER: 'Dein Support-Ticket wurde geschlossen. Bei weiteren Fragen kannst du jederzeit ein neues Ticket öffnen.',
    ERROR_CLOSING_TICKET: 'Fehler beim Schließen des Tickets.',
    NO_TICKET_FOUND: 'Kein aktives Ticket gefunden.\n\nThread ID: {threadId}\nBitte prüfe die Datenbank oder erstelle ein neues Ticket.',
    MESSAGE_SENT_ADMIN: '✅ Nachricht wurde an den User weitergeleitet.',
    ERROR_SENDING_MESSAGE: '❌ Fehler beim Senden der Nachricht an den User.\n\nUser ID: {userId}\nUsername: {username}\n\nMögliche Gründe:\n- User hat den Bot blockiert\n- User-Account wurde gelöscht\n- Chat nicht gefunden',
    TICKET_AUTO_CLOSED: 'Ticket wurde automatisch geschlossen.',
    SUPPORT_RESPONSE: 'Support Antwort:',
    USER_MESSAGE: 'Von User {userId} @{username}:\n{text}',
    CHECK_TOPIC_ACCESS: 'Prüfe Topic-Zugriff...',
    NEW_SUPPORT_TICKET: '🆕 Neues Support-Ticket\n\nUser ID: {userId}\nUsername: {username}\nName: {name}\nSprache: {language}',
    GENERAL_ERROR: 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
    
    USER_INFO_TEMPLATE: `
User ID: {userId}
Username: @{username}
Name: {name}
Code: {code}
`
}; // ✅ **MESSAGES-Objekt wurde hier jetzt korrekt geschlossen**

exports.RATE_LIMIT = {
    WINDOW_MS: 60000,
    MAX_REQUESTS: 10
};