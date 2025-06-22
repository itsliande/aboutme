# About Me Profile Card mit Firebase Admin

Eine personalisierte Profile Card für Social Media Bios (Discord, Instagram, etc.) mit Firebase-Backend und Admin-Dashboard.

## Features
- **Responsive Design** - Funktioniert auf allen Geräten
- **Animierte Elemente** - Moderne Animationen und Übergänge
- **Social Media Links** - Verknüpfung zu Instagram, Pronoun Page, Spotify
- **Hi-Counter** - Echtzeit-Counter mit Firebase-Synchronisation
- **Admin Dashboard** - Content-Management und Counter-Kontrolle
- **Echtzeit-Updates** - Sofortige Anzeige von Änderungen
- **Firebase Backend** - Sicherer Cloud-Speicher
- **Dunkles Theme** - Modernes, augenfreundliches Design
- **Mobile-optimiert** - Perfect für alle Bildschirmgrößen

## Setup
1. **Firebase konfigurieren:**
   - Befolge die Anweisungen in `ADMIN_SETUP.md`
   - Erstelle ein Firebase-Projekt
   - Aktiviere Authentication und Firestore

2. **Admin-Benutzer erstellen:**
   - Erstelle einen Admin-Benutzer in Firebase Authentication
   - Verwende den Admin-Login unter `/admin-login.html`

3. **Deployment:**
   - Hoste die Seite auf GitHub Pages, Netlify oder Vercel
   - Verlinke die URL in deinen Social Media Bios

## URLs nach Deployment
- **Hauptseite:** `https://yourusername.github.io/aboutme/`
- **Admin Login:** `https://yourusername.github.io/aboutme/admin-login.html`
- **Admin Dashboard:** `https://yourusername.github.io/aboutme/admin.html`

## Admin-Features
- ✅ Sicherer Login mit Firebase Authentication
- ✅ Echtzeit Hi-Counter Management
- ✅ Profile-Informationen bearbeiten (Name, Pronomen, Avatar)
- ✅ Social Links verwalten
- ✅ System-Status Überwachung
- ✅ Aktivitäts-Protokollierung
- ✅ Responsive Design für mobile Verwaltung

## Anpassung
- **Profile:** Bearbeite über das Admin-Dashboard
- **Styling:** Passe Farben und Design in `style.css` an
- **Funktionen:** Erweitere Features in `script.js` und `admin-dashboard.js`

## Sicherheit
- Firebase Authentication für Admin-Zugang
- Firestore Security Rules für Datenschutz
- HTTPS-only Betrieb
- Tägliches Hi-Limit zur Spam-Vermeidung