# Firebase Firestore Security Rules Setup

Das Problem liegt an den Firestore Security Rules. Hier sind die Schritte zur Lösung:

## 1. Firebase Console öffnen
- Gehe zu [Firebase Console](https://console.firebase.google.com/)
- Wähle dein Projekt "aboutme-49bfb" aus

## 2. Firestore Security Rules ändern
- Klicke auf "Firestore Database" im linken Menü
- Gehe zum Tab "Rules" 
- Ersetze die aktuellen Rules mit:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Erlaubt Lesen und Schreiben für die counters Collection
    match /counters/{document} {
      allow read, write: if true;
    }
    
    // Optional: Für andere Collections restriktiver
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 3. Rules veröffentlichen
- Klicke auf "Publish" um die neuen Rules zu aktivieren

## Alternative: Nur Hi-Counter erlauben
Für mehr Sicherheit, nur spezifisch den Hi-Counter:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /counters/hiCount {
      allow read, write: if true;
    }
  }
}
```

Nach dem Ändern der Rules sollte der Hi-Counter synchronisiert funktionieren!