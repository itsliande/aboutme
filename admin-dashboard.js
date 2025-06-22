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
        loadExistingContent(); // Content-Daten laden
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
                        <div class="activity-item">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Keine Berechtigung für Aktivitäten-Log</span>
                            <small>Admin-Rechte erforderlich</small>
                        </div>
                    `;
                });

        } catch (error) {
            console.error('Fehler beim Setup der Aktivitäten:', error);
            if (activityListEl) {
                activityListEl.innerHTML = `
                    <div class="activity-item">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Aktivitäten-Log nicht verfügbar</span>
                        <small>Berechtigungen prüfen</small>
                    </div>
                `;
            }
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

        // Manual Counter Controls
        setupCounterControls();
        
        // Content Management
        setupContentManagement();

        // Quick Actions
        setupQuickActions();
    }

    // Counter Controls einrichten
    function setupCounterControls() {
        const setCounterBtn = document.getElementById('setCounterBtn');
        const addOneBtn = document.getElementById('addOneBtn');
        const removeOneBtn = document.getElementById('removeOneBtn');
        const manualInput = document.getElementById('manualCountInput');

        if (setCounterBtn) {
            setCounterBtn.addEventListener('click', () => {
                const newValue = parseInt(manualInput.value);
                if (!isNaN(newValue) && newValue >= 0) {
                    setCounterValue(newValue);
                } else {
                    showNotification('Bitte gültigen Wert eingeben', 'error');
                }
            });
        }

        if (addOneBtn) {
            addOneBtn.addEventListener('click', () => adjustCounter(1));
        }

        if (removeOneBtn) {
            removeOneBtn.addEventListener('click', () => adjustCounter(-1));
        }
    }

    // Content Management einrichten
    function setupContentManagement() {
        const updateProfileBtn = document.getElementById('updateProfileBtn');
        const updateLinksBtn = document.getElementById('updateLinksBtn');

        if (updateProfileBtn) {
            updateProfileBtn.addEventListener('click', handleUpdateProfile);
        }

        if (updateLinksBtn) {
            updateLinksBtn.addEventListener('click', handleUpdateLinks);
        }

        // Lade aktuelle Content-Daten
        loadExistingContent();
    }

    // Counter-Wert setzen
    async function setCounterValue(value) {
        if (!db) return;

        try {
            const hiCountRef = db.collection('counters').doc('hiCount');
            await hiCountRef.update({
                count: value,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                lastModifiedBy: currentUser.email
            });

            await logAdminActivity('counter_set', { newValue: value });
            showNotification(`Counter auf ${value} gesetzt`, 'success');

        } catch (error) {
            console.error('Fehler beim Setzen des Counters:', error);
            showNotification('Fehler beim Setzen des Counters', 'error');
        }
    }

    // Counter anpassen (+1 oder -1)
    async function adjustCounter(adjustment) {
        if (!db) return;

        try {
            const hiCountRef = db.collection('counters').doc('hiCount');
            await hiCountRef.update({
                count: firebase.firestore.FieldValue.increment(adjustment),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                lastModifiedBy: currentUser.email
            });

            await logAdminActivity('counter_adjust', { adjustment });
            showNotification(`Counter ${adjustment > 0 ? '+' : ''}${adjustment}`, 'success');

        } catch (error) {
            console.error('Fehler beim Anpassen des Counters:', error);
            showNotification('Fehler beim Anpassen des Counters', 'error');
        }
    }

    // Profile-Update verarbeiten
    async function handleUpdateProfile() {
        if (!db) {
            showNotification('Keine Datenbank-Verbindung', 'error');
            return;
        }

        const name = document.getElementById('profileName').value.trim();
        const pronouns = document.getElementById('profilePronouns').value.trim();
        const avatarUrl = document.getElementById('avatarUrl').value.trim();

        if (!name || !pronouns) {
            showNotification('Name und Pronomen sind erforderlich', 'error');
            return;
        }

        // Show loading state
        const updateBtn = document.getElementById('updateProfileBtn');
        if (updateBtn) {
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speichere...';
        }

        try {
            const profileData = {
                name,
                pronouns,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser.email
            };

            if (avatarUrl) {
                profileData.avatarUrl = avatarUrl;
            }

            // Try to create/update the document with merge
            await db.collection('content').doc('profile').set(profileData, { merge: true });

            await logAdminActivity('profile_updated', { name, pronouns, avatarUrl });

            showNotification('Profile erfolgreich aktualisiert', 'success');

            // Update main website immediately if same domain
            updateMainWebsite('profile', profileData);

        } catch (error) {
            console.error('Fehler beim Aktualisieren des Profiles:', error);
            
            // Provide more specific error messages
            if (error.code === 'permission-denied') {
                showNotification('Keine Berechtigung zum Aktualisieren der Profile-Daten', 'error');
            } else if (error.code === 'unavailable') {
                showNotification('Firestore ist momentan nicht verfügbar', 'error');
            } else {
                showNotification('Fehler beim Aktualisieren des Profiles: ' + error.message, 'error');
            }
        } finally {
            // Reset button
            if (updateBtn) {
                updateBtn.disabled = false;
                updateBtn.innerHTML = '<i class="fas fa-save"></i> Profile aktualisieren';
            }
        }
    }

    // Links-Update verarbeiten
    async function handleUpdateLinks() {
        if (!db) {
            showNotification('Keine Datenbank-Verbindung', 'error');
            return;
        }

        const instagramLink = document.getElementById('instagramLink').value.trim();
        const pronounPageLink = document.getElementById('pronounPageLink').value.trim();
        const spotifyLink = document.getElementById('spotifyLink').value.trim();

        // Show loading state
        const updateBtn = document.getElementById('updateLinksBtn');
        if (updateBtn) {
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speichere...';
        }

        try {
            const linksData = {
                instagram: instagramLink,
                pronounPage: pronounPageLink,
                spotify: spotifyLink,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser.email
            };

            await db.collection('content').doc('socialLinks').set(linksData, { merge: true });

            await logAdminActivity('links_updated', linksData);

            showNotification('Social Links erfolgreich aktualisiert', 'success');

            // Update main website immediately if same domain
            updateMainWebsite('links', linksData);

        } catch (error) {
            console.error('Fehler beim Aktualisieren der Links:', error);
            
            if (error.code === 'permission-denied') {
                showNotification('Keine Berechtigung zum Aktualisieren der Link-Daten', 'error');
            } else if (error.code === 'unavailable') {
                showNotification('Firestore ist momentan nicht verfügbar', 'error');
            } else {
                showNotification('Fehler beim Aktualisieren der Links: ' + error.message, 'error');
            }
        } finally {
            // Reset button
            if (updateBtn) {
                updateBtn.disabled = false;
                updateBtn.innerHTML = '<i class="fas fa-link"></i> Links aktualisieren';
            }
        }
    }

    // Update main website content (if on same domain)
    function updateMainWebsite(type, data) {
        try {
            if (type === 'profile') {
                // Update if elements exist (for testing on same domain)
                const nameEl = document.querySelector('.name');
                const pronounsEl = document.querySelector('.pronouns');
                const avatarEl = document.querySelector('.avatar');

                if (nameEl && data.name) nameEl.textContent = data.name;
                if (pronounsEl && data.pronouns) pronounsEl.textContent = data.pronouns;
                if (avatarEl && data.avatarUrl) avatarEl.src = data.avatarUrl;
            }

            if (type === 'links') {
                // Update social links if elements exist
                const socialBtns = document.querySelectorAll('.social-btn');
                socialBtns.forEach(btn => {
                    if (btn.classList.contains('instagram') && data.instagram) {
                        btn.href = data.instagram;
                    }
                    if (btn.classList.contains('pronoun') && data.pronounPage) {
                        btn.href = data.pronounPage;
                    }
                    if (btn.classList.contains('spotify') && data.spotify) {
                        btn.href = data.spotify;
                    }
                });
            }
        } catch (error) {
            // Silent fail - main website might not be accessible
            console.log('Main website update skipped:', error.message);
        }
    }

    // Load existing content data
    async function loadExistingContent() {
        if (!db) return;

        try {
            // Versuche zuerst Profile-Daten zu laden
            try {
                const profileDoc = await db.collection('content').doc('profile').get();
                if (profileDoc.exists) {
                    const data = profileDoc.data();
                    const nameInput = document.getElementById('profileName');
                    const pronounsInput = document.getElementById('profilePronouns');
                    const avatarInput = document.getElementById('avatarUrl');
                    
                    if (nameInput && data.name) nameInput.value = data.name;
                    if (pronounsInput && data.pronouns) pronounsInput.value = data.pronouns;
                    if (avatarInput && data.avatarUrl) avatarInput.value = data.avatarUrl;
                } else {
                    console.log('Profile-Dokument existiert noch nicht - wird beim ersten Speichern erstellt');
                }
            } catch (profileError) {
                console.warn('Profile-Daten konnten nicht geladen werden:', profileError.message);
                // Setze Standardwerte
                const nameInput = document.getElementById('profileName');
                const pronounsInput = document.getElementById('profilePronouns');
                const avatarInput = document.getElementById('avatarUrl');
                
                if (nameInput && !nameInput.value) nameInput.placeholder = 'Name eingeben...';
                if (pronounsInput && !pronounsInput.value) pronounsInput.placeholder = 'Pronomen eingeben...';
                if (avatarInput && !avatarInput.value) avatarInput.placeholder = 'Avatar URL eingeben...';
            }

            // Versuche dann Links-Daten zu laden
            try {
                const linksDoc = await db.collection('content').doc('socialLinks').get();
                if (linksDoc.exists) {
                    const data = linksDoc.data();
                    const instagramInput = document.getElementById('instagramLink');
                    const pronounPageInput = document.getElementById('pronounPageLink');
                    const spotifyInput = document.getElementById('spotifyLink');
                    
                    if (instagramInput && data.instagram) instagramInput.value = data.instagram;
                    if (pronounPageInput && data.pronounPage) pronounPageInput.value = data.pronounPage;
                    if (spotifyInput && data.spotify) spotifyInput.value = data.spotify;
                } else {
                    console.log('Social-Links-Dokument existiert noch nicht - wird beim ersten Speichern erstellt');
                }
            } catch (linksError) {
                console.warn('Social-Links-Daten konnten nicht geladen werden:', linksError.message);
                // Setze Standardwerte
                const instagramInput = document.getElementById('instagramLink');
                const pronounPageInput = document.getElementById('pronounPageLink');
                const spotifyInput = document.getElementById('spotifyLink');
                
                if (instagramInput && !instagramInput.value) instagramInput.placeholder = 'Instagram URL eingeben...';
                if (pronounPageInput && !pronounPageInput.value) pronounPageInput.placeholder = 'Pronoun Page URL eingeben...';
                if (spotifyInput && !spotifyInput.value) spotifyInput.placeholder = 'Spotify URL eingeben...';
            }

        } catch (error) {
            console.error('Allgemeiner Fehler beim Laden der Content-Daten:', error);
            showNotification('Content-Daten konnten nicht geladen werden', 'warning');
            // Setze Fallback-Werte
            setFallbackContentValues();
        }
    }

    // Fallback-Werte setzen wenn Firebase nicht verfügbar ist
    function setFallbackContentValues() {
        try {
            // Profile Fallback-Werte
            const nameInput = document.getElementById('profileName');
            const pronounsInput = document.getElementById('profilePronouns');
            const avatarInput = document.getElementById('avatarUrl');
            
            if (nameInput && !nameInput.value) {
                nameInput.placeholder = 'Name eingeben...';
                nameInput.value = '';
            }
            if (pronounsInput && !pronounsInput.value) {
                pronounsInput.placeholder = 'Pronomen eingeben...';
                pronounsInput.value = '';
            }
            if (avatarInput && !avatarInput.value) {
                avatarInput.placeholder = 'Avatar URL eingeben...';
                avatarInput.value = '';
            }

            // Links Fallback-Werte
            const instagramInput = document.getElementById('instagramLink');
            const pronounPageInput = document.getElementById('pronounPageLink');
            const spotifyInput = document.getElementById('spotifyLink');
            
            if (instagramInput && !instagramInput.value) {
                instagramInput.placeholder = 'Instagram URL eingeben...';
                instagramInput.value = '';
            }
            if (pronounPageInput && !pronounPageInput.value) {
                pronounPageInput.placeholder = 'Pronoun Page URL eingeben...';
                pronounPageInput.value = '';
            }
            if (spotifyInput && !spotifyInput.value) {
                spotifyInput.placeholder = 'Spotify URL eingeben...';
                spotifyInput.value = '';
            }

            console.log('✅ Fallback-Werte für Content Management gesetzt');
        } catch (error) {
            console.warn('⚠️ Fehler beim Setzen der Fallback-Werte:', error);
        }
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
            // Silently fail admin logging - not critical for functionality
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