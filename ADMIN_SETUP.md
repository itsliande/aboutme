# Firebase Admin Setup für GitHub Pages

## Schritt 1: Firebase Authentication aktivieren

1. **Firebase Console öffnen:**
   - Gehe zu [Firebase Console](https://console.firebase.google.com/)
   - Wähle dein Projekt "aboutme-49bfb"

2. **Authentication aktivieren:**
   - Klicke auf "Authentication" im linken Menü
   - Gehe zum Tab "Sign-in method"
   - Aktiviere "Email/Password" Authentication
   - Klicke "Enable" und "Save"

## Schritt 2: Admin-Benutzer erstellen

1. **Zum Users Tab:**
   - Gehe zu Authentication > Users
   - Klicke "Add user"

2. **Admin-Benutzer hinzufügen:**
   ```
   Email: admin@yourdomain.com
   Password: [sicheres Passwort]
   ```

## Schritt 3: Firestore Security Rules erweitern

Gehe zu Firestore Database > Rules und ersetze mit:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Hi-Counter - öffentlich lesbar, schreibbar
    match /counters/{document} {
      allow read, write: if true;
    }
    
    // Admin-Bereich - nur für authentifizierte Benutzer
    match /admin/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Aktivitäts-Logs - nur für Admins
    match /logs/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Alle anderen Dokumente sperren
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Schritt 4: Deployment auf GitHub Pages

1. **Repository Setup:**
   - Pushe alle Dateien zu deinem GitHub Repository
   - Gehe zu Repository Settings > Pages
   - Wähle Source: Deploy from branch
   - Branch: main / master
   - Folder: / (root)

2. **URLs nach Deployment:**
   ```
   Hauptseite: https://yourusername.github.io/aboutme/
   Admin Login: https://yourusername.github.io/aboutme/admin-login.html
   Admin Dashboard: https://yourusername.github.io/aboutme/admin.html
   ```

## Schritt 5: Sicherheitshinweise

1. **Authorized Domains:**
   - Gehe zu Firebase Authentication > Settings
   - Füge deine GitHub Pages Domain hinzu:
     `yourusername.github.io`

2. **Sichere Passwörter:**
   - Verwende starke Passwörter für Admin-Accounts
   - Ändere regelmäßig die Passwörter

3. **HTTPS:**
   - GitHub Pages verwendet automatisch HTTPS
   - Firebase funktioniert nur mit HTTPS

## Features des Admin-Bereichs:

✅ **Sicherer Login** mit Firebase Authentication
✅ **Echtzeit-Dashboard** mit Hi-Counter Statistiken  
✅ **Counter-Management** (Reset-Funktionen)
✅ **System-Status** Überwachung
✅ **Aktivitäts-Log** (erweiterbar)
✅ **Responsive Design** für mobile Geräte
✅ **Auto-Logout** Sicherheit

## Erweiterte Features (optional):

- **Multi-Admin Support:** Mehrere Admin-Benutzer
- **Detaillierte Logs:** Vollständige Aktivitätsprotokolle
- **Analytics:** Erweiterte Statistiken und Grafiken
- **Backup/Restore:** Daten-Backup Funktionen
- **User Management:** Benutzer-Verwaltung Interface