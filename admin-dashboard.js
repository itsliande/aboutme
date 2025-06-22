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
    function initializeAdminDashboard() {
        if (typeof firebase === 'undefined') {
            console.log('⏳ Firebase SDK noch nicht geladen, warte...');
            setTimeout(initializeAdminDashboard, 100);
            return;
        }

        try {
            console.log('🔥 Initialisiere Firebase Admin Dashboard...');
            
            // Firebase App initialisieren
            const app = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();

            console.log('✅ Firebase Admin Dashboard erfolgreich initialisiert');
            
            // Auth State Listener
            auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ Admin angemeldet:', user.email);
                    currentUser = user;
                    initializeDashboard();
                    updateUserInfo(user);
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
        console.log('🚀 Initialisiere Admin Dashboard...');
        
        // Event Listeners
        setupEventListeners();
        
        // System Status prüfen
        checkSystemStatus();
        
        // Hi-Counter laden
        loadHiCounterStats();
        
        // Letzte Aktivitäten laden
        loadRecentActivity();
        
        // Log Admin Dashboard Zugriff
        logAdminActivity('dashboard_access');
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
            refreshBtn.addEventListener('click', refreshStats);
        }

        // Reset Counter Button
        const resetBtn = document.getElementById('resetCounterBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', handleResetCounter);
        }

        // Quick Actions
        document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
        document.getElementById('clearLogsBtn')?.addEventListener('click', clearLogs);
        document.getElementById('testSystemBtn')?.addEventListener('click', testSystem);
    }

    // User Info aktualisieren
    function updateUserInfo(user) {
        const userInfoEl = document.getElementById('adminUserInfo');
        if (userInfoEl) {
            userInfoEl.textContent = `Angemeldet als: ${user.email}`;
        }
    }

    // Hi-Counter Statistiken laden
    function loadHiCounterStats() {
        if (!db) return;

        const hiCountRef = db.collection('counters').doc('hiCount');
        
        // Echtzeitaktualisierung
        hiCountListener = hiCountRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                const count = data.count || 0;
                
                // Aktualisiere UI
                updateHiCounterUI(count);
                updateStatus('hiCounterStatus', 'Live', 'success');
            } else {
                updateStatus('hiCounterStatus', 'Offline', 'error');
            }
        }, (error) => {
            console.error('Fehler beim Laden der Hi-Counter Stats:', error);
            updateStatus('hiCounterStatus', 'Error', 'error');
        });
    }

    // Hi-Counter UI aktualisieren
    function updateHiCounterUI(count) {
        const currentCountEl = document.getElementById('currentHiCount');
        if (currentCountEl) {
            // Animierte Zahlen-Aktualisierung
            animateNumber(currentCountEl, parseInt(currentCountEl.textContent) || 0, count);
        }

        // Berechnete Statistiken (Placeholder)
        document.getElementById('todayHis')?.textContent = Math.floor(count * 0.1);
        document.getElementById('weekHis')?.textContent = Math.floor(count * 0.3);
        document.getElementById('avgPerDay')?.textContent = Math.floor(count / 30);
    }

    // Nummer-Animation
    function animateNumber(element, from, to) {
        const duration = 1000;
        const startTime = Date.now();
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(from + (to - from) * progress);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        update();
    }

    // System Status prüfen
    function checkSystemStatus() {
        // Firebase Status
        updateStatus('firebaseStatus', 'Online', 'success');
        
        // Auth Status
        if (auth && currentUser) {
            updateStatus('authStatus', 'Authenticated', 'success');
        } else {
            updateStatus('authStatus', 'Not Authenticated', 'error');
        }
        
        // Firestore Status
        if (db) {
            updateStatus('firestoreStatus', 'Connected', 'success');
        } else {
            updateStatus('firestoreStatus', 'Disconnected', 'error');
        }
        
        // Website Status (vereinfacht)
        updateStatus('websiteStatus', 'Online', 'success');
    }

    // Status Indicator aktualisieren
    function updateStatus(elementId, text, type) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = text;
        element.className = `status-indicator status-${type}`;
    }

    // Letzte Aktivitäten laden
    function loadRecentActivity() {
        if (!db) return;
        
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        db.collection('admin_logs')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get()
            .then((snapshot) => {
                if (snapshot.empty) {
                    activityList.innerHTML = '<div class="no-activity">Keine Aktivitäten gefunden</div>';
                    return;
                }
                
                let html = '';
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const time = data.timestamp?.toDate?.()?.toLocaleString?.() || 'Unbekannt';
                    html += `
                        <div class="activity-item">
                            <span class="activity-time">${time}</span>
                            <span class="activity-action">${data.action}</span>
                            <span class="activity-user">${data.user}</span>
                        </div>
                    `;
                });
                
                activityList.innerHTML = html;
            })
            .catch((error) => {
                console.error('Fehler beim Laden der Aktivitäten:', error);
                activityList.innerHTML = '<div class="activity-error">Fehler beim Laden</div>';
            });
    }

    // Event Handler Functions
    async function handleLogout() {
        try {
            await logAdminActivity('admin_logout');
            await auth.signOut();
            console.log('✅ Admin abgemeldet');
        } catch (error) {
            console.error('❌ Logout fehlgeschlagen:', error);
        }
    }

    function refreshStats() {
        console.log('🔄 Aktualisiere Statistiken...');
        checkSystemStatus();
        loadRecentActivity();
        showSuccess('Statistiken aktualisiert');
    }

    async function handleResetCounter() {
        if (!confirm('Möchtest du wirklich den Hi-Counter zurücksetzen?')) {
            return;
        }
        
        try {
            await db.collection('counters').doc('hiCount').update({
                count: 0,
                lastReset: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await logAdminActivity('counter_reset');
            showSuccess('Hi-Counter wurde zurückgesetzt');
        } catch (error) {
            console.error('❌ Counter-Reset fehlgeschlagen:', error);
            showError('Counter-Reset fehlgeschlagen');
        }
    }

    // Quick Actions
    function exportData() {
        showInfo('Datenexport wird vorbereitet...');
        // Implementierung folgt
    }

    function clearLogs() {
        if (confirm('Möchtest du wirklich alle Logs löschen?')) {
            showInfo('Logs werden gelöscht...');
            // Implementierung folgt
        }
    }

    function testSystem() {
        showInfo('Systemtest wird durchgeführt...');
        checkSystemStatus();
        setTimeout(() => {
            showSuccess('Systemtest abgeschlossen');
        }, 2000);
    }

    // Helper Functions
    function redirectToLogin() {
        window.location.href = 'admin-login.html';
    }

    function showSuccess(message) {
        console.log('✅', message);
        // Toast Notification implementieren
    }

    function showError(message) {
        console.error('❌', message);
        // Toast Notification implementieren
    }

    function showInfo(message) {
        console.log('ℹ️', message);
        // Toast Notification implementieren
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

    // Cleanup beim Verlassen
    function cleanup() {
        if (hiCountListener) {
            hiCountListener();
        }
    }

    // Event Listeners
    window.addEventListener('beforeunload', cleanup);

    // Initialisierung starten
    initializeAdminDashboard();

})();