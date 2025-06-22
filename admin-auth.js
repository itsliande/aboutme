// Firebase Admin Authentication für GitHub Pages
(function() {
    const firebaseConfig = {
        apiKey: "AIzaSyAj1VyMdSTz76GXrVN-QS_rFd2oUdz-D4Y",
        authDomain: "aboutme-49bfb.firebaseapp.com",
        projectId: "aboutme-49bfb",
        storageBucket: "aboutme-49bfb.firebasestorage.app",
        messagingSenderId: "135756692299",
        appId: "1:135756692299:web:1999c654468d4300f706ce"
    };

    let auth = null;
    let db = null;

    // Firebase initialisieren
    function initializeAdminFirebase() {
        if (typeof firebase === 'undefined') {
            console.log('⏳ Firebase SDK noch nicht geladen, warte...');
            setTimeout(initializeAdminFirebase, 100);
            return;
        }

        try {
            console.log('🔥 Initialisiere Firebase für Admin...');
            
            // Firebase App initialisieren
            const app = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();

            console.log('✅ Firebase Admin erfolgreich initialisiert');
            
            // Auth State Listener
            auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ Admin bereits angemeldet:', user.email);
                    redirectToAdmin();
                } else {
                    console.log('👤 Kein Admin angemeldet');
                }
            });

        } catch (error) {
            console.error('❌ Firebase Admin Initialisierung fehlgeschlagen:', error);
            showStatus('Firebase-Initialisierung fehlgeschlagen', 'error');
        }
    }

    // Login Form Handler
    function setupLoginForm() {
        const form = document.getElementById('adminLoginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }

    // Login verarbeiten
    async function handleLogin() {
        if (!auth) {
            showStatus('Firebase noch nicht initialisiert', 'error');
            return;
        }

        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const loginBtn = document.getElementById('adminLoginBtn');

        // UI State: Loading
        setLoadingState(true);
        clearStatus();

        try {
            console.log('🔐 Versuche Admin-Login für:', email);

            // Firebase Auth Login
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            console.log('✅ Admin-Login erfolgreich:', user.email);

            // Erfolgs-Status
            showStatus('Login erfolgreich! Weiterleitung...', 'success');

            // Admin-Log erstellen (optional)
            await logAdminActivity('admin_login', { email: user.email });

            // Weiterleitung nach kurzer Verzögerung
            setTimeout(redirectToAdmin, 1500);

        } catch (error) {
            console.error('❌ Admin-Login fehlgeschlagen:', error);
            handleLoginError(error);
        } finally {
            setLoadingState(false);
        }
    }

    // Login-Fehler behandeln
    function handleLoginError(error) {
        let errorMessage = 'Login fehlgeschlagen';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Admin-Benutzer nicht gefunden';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Falsches Passwort';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Ungültige E-Mail-Adresse';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Zu viele Anmeldeversuche. Versuche es später erneut.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Netzwerkfehler. Prüfe deine Internetverbindung.';
                break;
            default:
                errorMessage = error.message || 'Unbekannter Fehler';
        }

        showStatus(errorMessage, 'error');
    }

    // UI Helper Functions
    function setLoadingState(loading) {
        const btn = document.getElementById('adminLoginBtn');
        const email = document.getElementById('adminEmail');
        const password = document.getElementById('adminPassword');

        if (loading) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Anmelden...</span>';
            email.disabled = true;
            password.disabled = true;
        } else {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Anmelden</span>';
            email.disabled = false;
            password.disabled = false;
        }
    }

    function showStatus(message, type) {
        const statusEl = document.getElementById('adminLoginStatus');
        if (!statusEl) return;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        statusEl.innerHTML = `
            <div class="status-message status-${type}">
                <i class="${icons[type] || icons.info}"></i>
                ${message}
            </div>
        `;
    }

    function clearStatus() {
        const statusEl = document.getElementById('adminLoginStatus');
        if (statusEl) statusEl.innerHTML = '';
    }

    function redirectToAdmin() {
        window.location.href = 'admin.html';
    }

    // Admin-Aktivität protokollieren
    async function logAdminActivity(action, data = {}) {
        if (!db || !auth?.currentUser) return;

        try {
            await db.collection('admin_logs').add({
                action,
                user: auth.currentUser.email,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                data,
                userAgent: navigator.userAgent,
                ip: 'client-side' // IP wird server-seitig erfasst
            });
        } catch (error) {
            console.warn('⚠️ Admin-Log fehlgeschlagen:', error);
        }
    }

    // Initialisierung starten
    initializeAdminFirebase();

    // Event Listeners nach DOM Load
    document.addEventListener('DOMContentLoaded', setupLoginForm);

})();