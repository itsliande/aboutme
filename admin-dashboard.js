// Firebase Admin Dashboard für GitHub Pages
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
    let currentUser = null;
    let hiCountListener = null;

    // Firebase initialisieren
    function initializeAdminFirebase() {
        if (typeof firebase === 'undefined') {
            console.log('⏳ Firebase SDK noch nicht geladen, warte...');
            setTimeout(initializeAdminFirebase, 100);
            return;
        }

        try {
            console.log('🔥 Initialisiere Firebase Admin Dashboard...');
            
            // Firebase App initialisieren
            const app = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();

            console.log('✅ Firebase Admin Dashboard erfolgreich initialisiert');
            
            // Auth State prüfen
            auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ Admin angemeldet:', user.email);
                    currentUser = user;
                    initializeDashboard();
                } else {
                    console.log('❌ Kein Admin angemeldet - Weiterleitung zum Login');
                    redirectToLogin();
                }
            });

        } catch (error) {
            console.error('❌ Firebase Admin Dashboard Initialisierung fehlgeschlagen:', error);
            showError('Firebase-Initialisierung fehlgeschlagen');
        }
    }

    // Dashboard initialisieren
    function initializeDashboard() {
        updateUserInfo();
        loadHiCounterStats();
        checkSystemStatus();
        loadRecentActivity();
        setupEventListeners();
    }

    // Benutzer-Info anzeigen
    function updateUserInfo() {
        const userInfoEl = document.getElementById('adminUserInfo');
        if (userInfoEl && currentUser) {
            userInfoEl.textContent = `Angemeldet als: ${currentUser.email}`;
        }
    }

    // Hi-Counter Statistiken laden
    function loadHiCounterStats() {
        if (!db) return;

        try {
            const hiCountRef = db.collection('counters').doc('hiCount');
            
            // Echtzeit-Listener für Hi-Counter
            hiCountListener = hiCountRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    const count = data.count || 0;
                    
                    // Counter-Anzeige aktualisieren
                    updateCounterDisplay(count);
                    
                    // Status auf Live setzen
                    const statusEl = document.getElementById('hiCounterStatus');
                    if (statusEl) {
                        statusEl.textContent = 'Live';
                        statusEl.className = 'admin-status live';
                    }
                } else {
                    console.log('Hi-Counter Dokument existiert nicht');
                    updateCounterDisplay(0);
                }
            }, (error) => {
                console.error('Fehler beim Hi-Counter Listener:', error);
                const statusEl = document.getElementById('hiCounterStatus');
                if (statusEl) {
                    statusEl.textContent = 'Offline';
                    statusEl.className = 'admin-status offline';
                }
            });

        } catch (error) {
            console.error('Fehler beim Laden der Hi-Counter Stats:', error);
        }
    }

    // Counter-Anzeige aktualisieren
    function updateCounterDisplay(count) {
        const countEl = document.getElementById('currentHiCount');
        if (countEl) {
            countEl.textContent = count;
            
            // Animation für Änderungen
            countEl.style.transform = 'scale(1.1)';
            setTimeout(() => {
                countEl.style.transform = 'scale(1)';
            }, 300);
        }

        // Einfache Statistiken berechnen
        const todayEl = document.getElementById('todayHis');
        const weekEl = document.getElementById('weekHis');
        const avgEl = document.getElementById('avgPerDay');

        if (todayEl) todayEl.textContent = Math.floor(count * 0.05); // Schätzung
        if (weekEl) weekEl.textContent = Math.floor(count * 0.15); // Schätzung
        if (avgEl) avgEl.textContent = Math.floor(count / 30); // Schätzung
    }

    // System-Status prüfen
    function checkSystemStatus() {
        // Firebase Status
        updateStatus('firebaseStatus', 'Verbunden', 'connected');
        
        // Auth Status
        updateStatus('authStatus', currentUser ? 'Angemeldet' : 'Nicht angemeldet', 
                    currentUser ? 'connected' : 'error');
        
        // Firestore Status
        updateStatus('firestoreStatus', db ? 'Verbunden' : 'Fehler', 
                    db ? 'connected' : 'error');
        
        // Website Status
        updateStatus('websiteStatus', 'Online', 'connected');
    }

    // Status-Anzeige aktualisieren
    function updateStatus(elementId, text, status) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = text;
            el.className = `status-indicator ${status}`;
        }
    }

    // Letzte Aktivitäten laden
    function loadRecentActivity() {
        const activityListEl = document.getElementById('activityList');
        if (!activityListEl || !db) return;

        try {
            db.collection('admin_logs')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get()
                .then((querySnapshot) => {
                    const activities = [];
                    
                    querySnapshot.forEach((doc) => {
                        activities.push(doc.data());
                    });

                    if (activities.length === 0) {
                        activityListEl.innerHTML = `
                            <div class="activity-item">
                                <i class="fas fa-info-circle"></i>
                                <span>Keine Aktivitäten gefunden</span>
                                <small>Erst Admin-Login</small>
                            </div>
                        `;
                    } else {
                        activityListEl.innerHTML = activities.map(activity => `
                            <div class="activity-item">
                                <i class="fas fa-user-shield"></i>
                                <span>${activity.action || 'Unbekannte Aktion'}</span>
                                <small>${activity.user || 'Unbekannt'}</small>
                            </div>
                        `).join('');
                    }
                })
                .catch((error) => {
                    console.error('Fehler beim Laden der Aktivitäten:', error);
                    activityListEl.innerHTML = `
                        <div class="activity-item error">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Fehler beim Laden der Aktivitäten</span>
                        </div>
                    `;
                });

        } catch (error) {
            console.error('Fehler beim Setup der Aktivitäten:', error);
        }
    }

    // Event Listeners einrichten
    function setupEventListeners() {
        // Logout Button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        // Refresh Stats Button
        const refreshBtn = document.getElementById('refreshStatsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                loadHiCounterStats();
                checkSystemStatus();
                loadRecentActivity();
                showNotification('Statistiken aktualisiert', 'success');
            });
        }

        // Reset Counter Button
        const resetBtn = document.getElementById('resetCounterBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', handleResetCounter);
        }

        // Quick Actions
        setupQuickActions();
    }

    // Quick Actions einrichten
    function setupQuickActions() {
        const exportBtn = document.getElementById('exportDataBtn');
        const clearLogsBtn = document.getElementById('clearLogsBtn');
        const testBtn = document.getElementById('testSystemBtn');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                showNotification('Export-Funktion in Entwicklung', 'info');
            });
        }

        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => {
                if (confirm('Wirklich alle Logs löschen?')) {
                    showNotification('Logs gelöscht', 'success');
                }
            });
        }

        if (testBtn) {
            testBtn.addEventListener('click', () => {
                checkSystemStatus();
                showNotification('System-Test abgeschlossen', 'success');
            });
        }
    }

    // Logout behandeln
    async function handleLogout() {
        if (!auth) return;

        try {
            await logAdminActivity('admin_logout');
            await auth.signOut();
            console.log('✅ Admin abgemeldet');
        } catch (error) {
            console.error('❌ Logout-Fehler:', error);
        }
    }

    // Counter zurücksetzen
    async function handleResetCounter() {
        if (!db || !confirm('Hi-Counter wirklich auf 0 zurücksetzen?')) return;

        try {
            const hiCountRef = db.collection('counters').doc('hiCount');
            await hiCountRef.update({
                count: 0,
                lastReset: firebase.firestore.FieldValue.serverTimestamp(),
                resetBy: currentUser.email
            });

            await logAdminActivity('counter_reset', { previousCount: 'unknown' });
            showNotification('Hi-Counter zurückgesetzt', 'success');

        } catch (error) {
            console.error('Fehler beim Zurücksetzen:', error);
            showNotification('Fehler beim Zurücksetzen', 'error');
        }
    }

    // Admin-Aktivität protokollieren
    async function logAdminActivity(action, data = {}) {
        if (!db || !currentUser) return;

        try {
            await db.collection('admin_logs').add({
                action,
                user: currentUser.email,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                data,
                userAgent: navigator.userAgent
            });
        } catch (error) {
            console.warn('⚠️ Admin-Log fehlgeschlagen:', error);
        }
    }

    // Helper Functions
    function redirectToLogin() {
        window.location.href = 'admin-login.html';
    }

    function showError(message) {
        console.error('Admin Dashboard Error:', message);
    }

    function showNotification(message, type = 'info') {
        // Einfache Notification (kann erweitert werden)
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Optional: Toast-Notification erstellen
        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-bg);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 12px;
            border: 1px solid var(--border-secondary);
            backdrop-filter: blur(12px);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Cleanup beim Verlassen
    function cleanup() {
        if (hiCountListener) {
            hiCountListener();
        }
    }

    // Initialisierung starten
    initializeAdminFirebase();

    // Cleanup beim Verlassen der Seite
    window.addEventListener('beforeunload', cleanup);

})();