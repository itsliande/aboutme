// Admin Login Funktionalität für GitHub Pages
let auth = null;
let isFirebaseReady = false;

// Firebase Initialisierung abwarten
function waitForFirebase() {
    return new Promise((resolve) => {
        if (isFirebaseReady && auth) {
            resolve();
            return;
        }

        // Warte auf Firebase Ready Event
        window.addEventListener('firebaseReady', () => {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                auth = firebase.auth();
                isFirebaseReady = true;
                console.log('🔐 Firebase Auth für Admin-Login bereit');
                resolve();
            }
        });

        // Fallback-Timer
        setTimeout(() => {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                auth = firebase.auth();
                isFirebaseReady = true;
                console.log('🔐 Firebase Auth Fallback initialisiert');
                resolve();
            }
        }, 3000);
    });
}

// Login Status prüfen
async function checkAuthState() {
    await waitForFirebase();
    
    if (auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ Admin bereits angemeldet:', user.email);
                // Weiterleitung zur Admin-Seite
                window.location.href = 'admin.html';
            } else {
                console.log('👤 Kein Admin angemeldet');
            }
        });
    }
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginStatus = document.getElementById('loginStatus');
    
    // Warte auf Firebase
    await waitForFirebase();
    
    if (!auth) {
        loginStatus.innerHTML = `
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                Firebase nicht verfügbar. Bitte Seite neu laden.
            </div>
        `;
        return;
    }
    
    // Loading State
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmelden...';
    loginStatus.innerHTML = '';
    
    try {
        // Firebase Auth Login
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Admin Login erfolgreich:', user.email);
        
        // Erfolg anzeigen
        loginStatus.innerHTML = `
            <div class="status-success">
                <i class="fas fa-check-circle"></i>
                Login erfolgreich! Weiterleitung zum Admin-Bereich...
            </div>
        `;
        
        // Weiterleitung nach kurzer Verzögerung
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        
    } catch (error) {
        console.error('❌ Admin Login fehlgeschlagen:', error);
        
        let errorMessage = 'Login fehlgeschlagen';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Admin-Benutzer nicht gefunden';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Falsches Admin-Passwort';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Ungültige E-Mail-Adresse';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Zu viele Anmeldeversuche. Versuche es später erneut.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Netzwerkfehler. Internetverbindung prüfen.';
                break;
            default:
                errorMessage = `Fehler: ${error.message}`;
        }
        
        loginStatus.innerHTML = `
            <div class="status-error">
                <i class="fas fa-exclamation-triangle"></i>
                ${errorMessage}
            </div>
        `;
        
        // Button zurücksetzen
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
    }
});

// Enter-Taste Support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Seite geladen
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Admin Login Seite geladen');
    checkAuthState();
    
    // Focus auf Email-Feld
    document.getElementById('email').focus();
});