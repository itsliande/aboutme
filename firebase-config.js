// Firebase Konfiguration - Browser-kompatible Version mit Debug-Logging
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
            console.log('Starte Firebase Initialisierung...');
            
            // Firebase initialisieren
            const app = firebase.initializeApp(firebaseConfig);
            const db = firebase.firestore();

            console.log('Firebase erfolgreich initialisiert');
            console.log('Firebase App:', app);
            console.log('Firestore DB:', db);

            // Teste Firestore Verbindung
            const testRef = db.collection('test').doc('connection');
            testRef.get().then(() => {
                console.log('✅ Firestore Verbindung erfolgreich');
            }).catch((error) => {
                console.error('❌ Firestore Verbindung fehlgeschlagen:', error);
                console.error('Mögliche Ursachen:');
                console.error('1. Firestore Security Rules zu restriktiv');
                console.error('2. API-Key ungültig');
                console.error('3. Projekt-ID falsch');
            });

            // Globale Firebase-Variablen für script.js
            window.firebaseApp = app;
            window.firestoreDb = db;
            window.firebaseLoaded = true;

            // Event für erfolgreiche Initialisierung
            window.dispatchEvent(new CustomEvent('firebaseReady'));
            
        } catch (error) {
            console.error('❌ Firebase Initialisierung fehlgeschlagen:', error);
            console.error('Error Code:', error.code);
            console.error('Error Message:', error.message);
            window.firebaseLoaded = false;
        }
    }

    // Starte Initialisierung
    initializeFirebase();
})();
