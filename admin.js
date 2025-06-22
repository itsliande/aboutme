// Admin Dashboard Funktionalität für GitHub Pages
let auth = null;
let db = null;
let isFirebaseReady = false;
let currentUser = null;

// Firebase Initialisierung abwarten
function waitForFirebase() {
    return new Promise((resolve) => {
        if (isFirebaseReady && auth && db) {
            resolve();
            return;
        }

        // Warte auf Firebase Ready Event
        window.addEventListener('firebaseReady', () => {
            if (typeof firebase !== 'undefined') {
                auth = firebase.auth();
                db = firebase.firestore();
                isFirebaseReady = true;
                console.log('🔐 Firebase für Admin Dashboard bereit');
                resolve();
            }
        });

        // Fallback-Timer
        setTimeout(() => {
            if (typeof firebase !== 'undefined') {
                auth = firebase.auth();
                db = firebase.firestore();
                isFirebaseReady = true;
                console.log('🔐 Firebase Admin Dashboard Fallback initialisiert');
                resolve();
            }
        }, 3000);
    });
}

// Auth Status prüfen und Zugriff kontrollieren
async function checkAdminAuth() {
    await waitForFirebase();
    
    if (auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                console.log('✅ Admin authentifiziert:', user.email);
                document.getElementById('authStatus').innerHTML = '<span style="color: var(--accent-success);">✅ Angemeldet</span>';
                loadDashboardData();
            } else {
                console.log('❌ Nicht authentifiziert - Weiterleitung zum Login');
                window.location.href = 'admin-login.html';
            }
        });
    } else {
        console.log('❌ Firebase Auth nicht verfügbar');
        window.location.href = 'admin-login.html';
    }
}

// Logout Funktion
async function logout() {
    try {
        await auth.signOut();
        console.log('🚪 Admin abgemeldet');
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Logout Fehler:', error);
    }
}

// Dashboard Daten laden
async function loadDashboardData() {
    try {
        // Firebase Status
        document.getElementById('firebaseStatus').innerHTML = '<span style="color: var(--accent-success);">✅ Verbunden</span>';
        
        // Database Status
        const testDoc = await db.collection('counters').doc('hiCount').get();
        if (testDoc.exists) {
            document.getElementById('databaseStatus').innerHTML = '<span style="color: var(--accent-success);">✅ Verbunden</span>';
        }

        // Hi-Counter Daten laden
        loadHiCounterStats();
        
        // Aktivitäts-Log laden
        loadActivityLog();
        
        // Echtzeitaktualisierungen für Hi-Counter
        db.collection('counters').doc('hiCount').onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                updateCounterDisplay(data);
            }
        });

    } catch (error) {
        console.error('Fehler beim Laden der Dashboard-Daten:', error);
        document.getElementById('databaseStatus').innerHTML = '<span style="color: var(--accent-secondary);">❌ Fehler</span>';
    }
}

// Hi-Counter Statistiken laden
async function loadHiCounterStats() {
    try {
        const hiCountRef = db.collection('counters').doc('hiCount');
        const doc = await hiCountRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            updateCounterDisplay(data);
        } else {
            // Dokument erstellen falls nicht vorhanden
            await hiCountRef.set({
                count: 0,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            updateCounterDisplay({ count: 0 });
        }
    } catch (error) {
        console.error('Fehler beim Laden der Hi-Counter Stats:', error);
    }
}

// Counter Display aktualisieren
function updateCounterDisplay(data) {
    const totalCount = data.count || 0;
    document.getElementById('adminHiCount').textContent = totalCount;
    
    // Simulierte Werte für Demo (in echtem System würdest du diese aus der DB laden)
    document.getElementById('todayHiCount').textContent = Math.floor(totalCount * 0.1) || 0;
    document.getElementById('weekHiCount').textContent = Math.floor(totalCount * 0.3) || 0;
    
    if (data.lastUpdated && data.lastUpdated.toDate) {
        const lastUpdate = data.lastUpdated.toDate();
        document.getElementById('lastHiTime').textContent = formatRelativeTime(lastUpdate);
    } else {
        document.getElementById('lastHiTime').textContent = 'Nie';
    }
}

// Relative Zeit formatieren
function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Gerade eben';
    if (minutes < 60) return `vor ${minutes}m`;
    if (hours < 24) return `vor ${hours}h`;
    return `vor ${days}d`;
}

// Aktivitäts-Log laden
async function loadActivityLog() {
    try {
        // Simuliertes Aktivitäts-Log (in echtem System würdest du eine separate Collection verwenden)
        const logHtml = `
            <div style="color: var(--text-secondary); font-size: 0.9rem;">
                <div style="padding: 8px 0; border-bottom: 1px solid var(--border-secondary);">
                    <strong style="color: var(--accent-success);">Hi-Counter aktualisiert</strong><br>
                    <span style="color: var(--text-muted);">vor 2 Minuten</span>
                </div>
                <div style="padding: 8px 0; border-bottom: 1px solid var(--border-secondary);">
                    <strong style="color: var(--accent-primary);">Admin angemeldet</strong><br>
                    <span style="color: var(--text-muted);">vor 5 Minuten</span>
                </div>
                <div style="padding: 8px 0; border-bottom: 1px solid var(--border-secondary);">
                    <strong style="color: var(--accent-success);">Hi-Counter aktualisiert</strong><br>
                    <span style="color: var(--text-muted);">vor 1 Stunde</span>
                </div>
                <div style="padding: 8px 0;">
                    <strong style="color: var(--accent-warning);">System gestartet</strong><br>
                    <span style="color: var(--text-muted);">vor 2 Stunden</span>
                </div>
            </div>
        `;
        document.getElementById('activityLog').innerHTML = logHtml;
    } catch (error) {
        console.error('Fehler beim Laden des Aktivitäts-Logs:', error);
        document.getElementById('activityLog').innerHTML = '<p style="color: var(--accent-secondary);">Fehler beim Laden des Logs</p>';
    }
}

// Täglichen Counter zurücksetzen (Demo-Funktion)
async function resetDailyCounter() {
    if (!confirm('Möchtest du wirklich den täglichen Counter zurücksetzen?')) {
        return;
    }
    
    try {
        // In einem echten System würdest du hier tägliche Statistiken zurücksetzen
        console.log('Täglicher Counter zurückgesetzt');
        alert('Täglicher Counter wurde zurückgesetzt');
    } catch (error) {
        console.error('Fehler beim Zurücksetzen:', error);
        alert('Fehler beim Zurücksetzen');
    }
}

// Gesamt-Counter zurücksetzen
async function resetTotalCounter() {
    if (!confirm('⚠️ ACHTUNG: Möchtest du wirklich den GESAMTEN Hi-Counter zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
        return;
    }
    
    if (!confirm('Bist du dir absolut sicher? Alle Hi-Daten gehen verloren!')) {
        return;
    }
    
    try {
        const hiCountRef = db.collection('counters').doc('hiCount');
        await hiCountRef.update({
            count: 0,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            resetBy: currentUser.email,
            resetAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Gesamt-Counter zurückgesetzt');
        alert('Gesamt-Counter wurde zurückgesetzt');
    } catch (error) {
        console.error('Fehler beim Zurücksetzen:', error);
        alert('Fehler beim Zurücksetzen des Counters');
    }
}

// Seite geladen
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎛️ Admin Dashboard geladen');
    checkAdminAuth();
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + L für Logout
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        logout();
    }
    
    // Escape für Logout
    if (e.key === 'Escape') {
        logout();
    }
});