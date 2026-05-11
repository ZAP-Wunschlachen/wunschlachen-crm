# CRM Email Service — Setup

## Installation

1. Extension in den Directus `extensions/` Ordner kopieren
2. `npm install` im Extension-Ordner ausführen
3. `npm run build` ausführen
4. Directus neu starten

## Umgebungsvariablen

### IONOS
```env
EMAIL_PROVIDER=ionos
EMAIL_USER=crm@wunschlachen.de
EMAIL_PASSWORD=dein-passwort
```

### Gmail
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=crm@wunschlachen.de
EMAIL_PASSWORD=app-spezifisches-passwort
```

**Wichtig für Gmail:** Du musst ein [App-Passwort](https://myaccount.google.com/apppasswords) erstellen, nicht das normale Login-Passwort verwenden.

### Custom Provider
```env
EMAIL_PROVIDER=custom
EMAIL_USER=user@example.com
EMAIL_PASSWORD=passwort
EMAIL_IMAP_HOST=imap.example.com
EMAIL_IMAP_PORT=993
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=465
```

## API Endpoints

### E-Mail senden
```
POST /email-service/send
{
  "to": "empfaenger@example.com",
  "subject": "Betreff",
  "body_html": "<p>HTML Inhalt</p>",
  "body_text": "Text Fallback",
  "lead_id": "123",         // optional: erstellt automatisch Activity
  "contact_id": "456"       // optional
}
```

### Inbox abrufen
```
GET /email-service/inbox?limit=50&folder=INBOX
```

### E-Mails synchronisieren (Inbox → nursing_home_lead_activities)
```
POST /email-service/sync?limit=20
```
Gleicht eingehende E-Mails mit Kontakten ab und erstellt `email_received` Activities.

### Konfigurierte Accounts
```
GET /email-service/accounts
```

## Mehrere Accounts

Aktuell wird ein Account über Env-Vars konfiguriert. Für mehrere Accounts (IONOS + Gmail gleichzeitig) kann die Extension erweitert werden um Accounts aus einer `crm_email_accounts` Collection zu laden.
