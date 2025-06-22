// Firebase Konfiguration - Browser-kompatible Version
(function() {
    const firebaseConfig = {
        apiKey: "AIzaSyAj1VyMdSTz76GXrVN-QS_rFd2oUdz-D4Y",
        authDomain: "aboutme-49bfb.firebaseapp.com",
        projectId: "aboutme-49bfb",
        storageBucket: "aboutme-49bfb.firebasestorage.app",
        messagingSenderId: "135756692299",
        appId: "1:135756692299:web:1999c654468d4300f706ce"
    };

    // Warte bis Firebase SDK geladen ist
    function initializeFirebase() {
        if (typeof firebase === 'undefined') {
            console.log('Firebase SDK noch nicht geladen, warte...');
            setTimeout(initializeFirebase, 100);
            return;
        }

        try {
            // Firebase initialisieren
            const app = firebase.initializeApp(firebaseConfig);
            const db = firebase.firestore();

            console.log('Firebase erfolgreich initialisiert');

            // Globale Firebase-Variablen für script.js
            window.firebaseApp = app;
            window.firestoreDb = db;
            window.firebaseLoaded = true;

            // Event für erfolgreiche Initialisierung
            window.dispatchEvent(new CustomEvent('firebaseReady'));
            
        } catch (error) {
            console.error('Firebase Initialisierung fehlgeschlagen:', error);
            window.firebaseLoaded = false;
        }
    }

    // Starte Initialisierung
    initializeFirebase();
})();
