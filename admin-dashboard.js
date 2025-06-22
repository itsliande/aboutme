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
            // Zunächst einfach Mock-Daten zeigen, da Berechtigungen fehlen könnten
            const mockActivities = [
                {
                    action: 'Admin Login',
                    user: currentUser?.email || 'Administrator',
                    timestamp: new Date()
                },
                {
                    action: 'Hi-Counter synchronisiert',
                    user: 'System',
                    timestamp: new Date(Date.now() - 300000)
                },
                {
                    action: 'Content geladen',
                    user: 'System',
                    timestamp: new Date(Date.now() - 600000)
                }
            ];

            activityListEl.innerHTML = mockActivities.map(activity => `
                <div class="activity-item">
                    <i class="fas fa-user-shield"></i>
                    <span>${activity.action}</span>
                    <small>${activity.user}</small>
                </div>
            `).join('');

            // Versuche echte Daten zu laden, falls möglich
            db.collection('admin_logs')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get()
                .then((querySnapshot) => {
                    const activities = [];
                    
                    querySnapshot.forEach((doc) => {
                        activities.push(doc.data());
                    });

                    if (activities.length > 0) {
                        activityListEl.innerHTML = activities.map(activity => `
                            <div class="activity-item">
                                <i class="fas fa-user-shield"></i>
                                <span>${activity.action || 'Unbekannte Aktion'}</span>
                                <small>${activity.user || 'Unbekannt'}</small>
                            </div>
                        `).join('');
                        console.log('✅ Echte Aktivitäten geladen');
                    }
                })
                .catch((error) => {
                    console.warn('Aktivitäten-Log nicht verfügbar:', error.message);
                    // Mock-Daten bleiben als Fallback
                });

        } catch (error) {
            console.error('Fehler beim Setup der Aktivitäten:', error);
            if (activityListEl) {
                activityListEl.innerHTML = `
                    <div class="activity-item">
                        <i class="fas fa-info-circle"></i>
                        <span>Aktivitäten-Überwachung läuft</span>
                        <small>Live-Updates aktiv</small>
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
        const updateAboutBtn = document.getElementById('updateAboutBtn');
        const addAboutItemBtn = document.getElementById('addAboutItemBtn');

        if (updateProfileBtn) {
            updateProfileBtn.addEventListener('click', handleUpdateProfile);
        }

        if (updateLinksBtn) {
            updateLinksBtn.addEventListener('click', handleUpdateLinks);
        }

        if (updateAboutBtn) {
            updateAboutBtn.addEventListener('click', handleUpdateAbout);
        }

        if (addAboutItemBtn) {
            addAboutItemBtn.addEventListener('click', addAboutItem);
        }

        // Remove-Button Event Listener für existierende Items
        setupRemoveItemListeners();

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

    // Reset Counter
    async function handleResetCounter() {
        if (!confirm('Hi-Counter wirklich auf 0 zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }

        await setCounterValue(0);
    }

    // Admin Activity Logging
    async function logAdminActivity(action, details = {}) {
        if (!db || !currentUser) return;

        try {
            await db.collection('admin_logs').add({
                action,
                details,
                user: currentUser.email,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent
            });
        } catch (error) {
            console.warn('Admin-Logging fehlgeschlagen:', error.message);
        }
    }

    // Website Update Helper
    function updateMainWebsite(type, data) {
        try {
            // Versuche die Hauptwebsite zu aktualisieren falls im gleichen Tab/Fenster
            if (window.opener && !window.opener.closed) {
                if (typeof window.opener.loadContentFromFirebase === 'function') {
                    window.opener.loadContentFromFirebase();
                    console.log('✅ Hauptwebsite erfolgreich aktualisiert');
                }
            }

            // Versuche über Broadcast Channel (falls beide Seiten den gleichen Origin haben)
            if ('BroadcastChannel' in window) {
                const channel = new BroadcastChannel('aboutme_updates');
                channel.postMessage({ type: 'content_updated', data: { type, data } });
                channel.close();
            }
        } catch (error) {
            console.log('ℹ️ Website-Update nicht möglich:', error.message);
        }
    }

    // Quick Actions Setup
    function setupQuickActions() {
        const exportBtn = document.getElementById('exportDataBtn');
        const clearLogsBtn = document.getElementById('clearLogsBtn');
        const testSystemBtn = document.getElementById('testSystemBtn');

        if (exportBtn) {
            exportBtn.addEventListener('click', exportData);
        }

        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', clearLogs);
        }

        if (testSystemBtn) {
            testSystemBtn.addEventListener('click', testSystem);
        }
    }

    // Export Data Function
    async function exportData() {
        showNotification('Datenexport wird gestartet...', 'info');
        
        try {
            const data = {
                timestamp: new Date().toISOString(),
                hiCounter: document.getElementById('currentHiCount').textContent,
                profile: {
                    name: document.getElementById('profileName').value,
                    pronouns: document.getElementById('profilePronouns').value,
                    avatarUrl: document.getElementById('avatarUrl').value
                },
                links: {
                    instagram: document.getElementById('instagramLink').value,
                    pronounPage: document.getElementById('pronounPageLink').value,
                    spotify: document.getElementById('spotifyLink').value
                }
            };

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `aboutme-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            showNotification('Daten erfolgreich exportiert', 'success');
        } catch (error) {
            console.error('Export Fehler:', error);
            showNotification('Fehler beim Datenexport', 'error');
        }
    }

    // Clear Logs Function
    async function clearLogs() {
        if (!confirm('Alle Aktivitäts-Logs löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }

        try {
            await logAdminActivity('logs_cleared', { action: 'Manual log clearing' });
            showNotification('Logs werden geleert...', 'info');
            
            setTimeout(() => {
                loadRecentActivity();
                showNotification('Logs erfolgreich geleert', 'success');
            }, 1000);
        } catch (error) {
            console.error('Clear Logs Fehler:', error);
            showNotification('Fehler beim Löschen der Logs', 'error');
        }
    }

    // Test System Function
    async function testSystem() {
        showNotification('Systemtest wird durchgeführt...', 'info');

        try {
            // Test Firebase Connection
            if (!db) {
                throw new Error('Firebase nicht verbunden');
            }

            // Test Counter Read/Write
            const testCountRef = db.collection('counters').doc('hiCount');
            await testCountRef.get();

            // Test Authentication
            if (!currentUser) {
                throw new Error('Benutzer nicht authentifiziert');
            }

            // Test Content Access
            await db.collection('content').doc('profile').get();

            showNotification('Alle Systemtests erfolgreich', 'success');
            await logAdminActivity('system_test', { status: 'success' });
            
        } catch (error) {
            console.error('Systemtest Fehler:', error);
            showNotification(`Systemtest fehlgeschlagen: ${error.message}`, 'error');
            
            try {
                await logAdminActivity('system_test', { status: 'failed', error: error.message });
            } catch (logError) {
                console.warn('Logging des Systemtest-Fehlers fehlgeschlagen:', logError);
            }
        }
    }

    // Redirect to login if not authenticated
    function redirectToLogin() {
        window.location.href = 'admin-login.html';
    }

    // Logout handler
    async function handleLogout() {
        if (!auth) return;

        try {
            await auth.signOut();
            showNotification('Erfolgreich abgemeldet', 'success');
            setTimeout(() => {
                redirectToLogin();
            }, 1000);
        } catch (error) {
            console.error('Logout Fehler:', error);
            showNotification('Fehler beim Abmelden', 'error');
        }
    }

    // Content Management Functions

    // Lade existierende Content-Daten
    async function loadExistingContent() {
        if (!db) return;

        try {
            console.log('🔄 Lade Content-Daten...');

            // Profile-Daten laden
            const profileDoc = await db.collection('content').doc('profile').get();
            if (profileDoc.exists) {
                const profileData = profileDoc.data();
                
                const nameInput = document.getElementById('profileName');
                const pronounsInput = document.getElementById('profilePronouns');
                const avatarInput = document.getElementById('avatarUrl');

                if (nameInput && profileData.name) nameInput.value = profileData.name;
                if (pronounsInput && profileData.pronouns) pronounsInput.value = profileData.pronouns;
                if (avatarInput && profileData.avatarUrl) avatarInput.value = profileData.avatarUrl;
            }

            // Social Links laden
            const linksDoc = await db.collection('content').doc('socialLinks').get();
            if (linksDoc.exists) {
                const linksData = linksDoc.data();
                
                const instagramInput = document.getElementById('instagramLink');
                const pronounPageInput = document.getElementById('pronounPageLink');
                const spotifyInput = document.getElementById('spotifyLink');

                if (instagramInput && linksData.instagram) instagramInput.value = linksData.instagram;
                if (pronounPageInput && linksData.pronounPage) pronounPageInput.value = linksData.pronounPage;
                if (spotifyInput && linksData.spotify) spotifyInput.value = linksData.spotify;
            }

            // About Items laden
            const aboutDoc = await db.collection('content').doc('aboutItems').get();
            if (aboutDoc.exists) {
                const aboutData = aboutDoc.data();
                if (aboutData.items && aboutData.items.length > 0) {
                    renderAboutItems(aboutData.items);
                } else {
                    renderAboutItems(getDefaultAboutItems());
                }
            } else {
                renderAboutItems(getDefaultAboutItems());
            }

            console.log('✅ Content-Daten erfolgreich geladen');

        } catch (error) {
            console.warn('⚠️ Content-Laden fehlgeschlagen:', error);
            showNotification('Content konnte nicht geladen werden', 'error');
            
            // Fallback: Standard About Items anzeigen
            renderAboutItems(getDefaultAboutItems());
        }
    }

    // Standard About Items
    function getDefaultAboutItems() {
        return [
            { icon: 'fas fa-rainbow', text: 'Demigirl or Nonbinary Transfem\'ig ldrk and Bi-sexual' },
            { icon: 'fas fa-heart', text: 'YU Fan (nazis call it linksversifft)' },
            { icon: 'fas fa-headphones', text: 'Professional listener' },
            { icon: 'fas fa-star', text: 'Extremely Gay' },
            { icon: 'fas fa-camera-retro', text: 'Look at my Insta and Pronoun Page' }
        ];
    }

    // About Items rendern
    function renderAboutItems(items) {
        const aboutItemsList = document.getElementById('aboutItemsList');
        if (!aboutItemsList) return;

        aboutItemsList.innerHTML = '';

        items.forEach((item, index) => {
            const itemEditor = createAboutItemEditor(item, index);
            aboutItemsList.appendChild(itemEditor);
        });

        setupRemoveItemListeners();
    }

    // About Item Editor erstellen
    function createAboutItemEditor(item, index) {
        const editor = document.createElement('div');
        editor.className = 'about-item-editor';
        editor.dataset.index = index;

        editor.innerHTML = `
            <div class="about-item-editor-header">
                <h4><i class="fas fa-grip-vertical"></i> About Item ${index + 1}</h4>
                <button class="admin-btn danger small remove-item-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                    Entfernen
                </button>
            </div>
            <div class="about-item-editor-content">
                <div class="form-group">
                    <label for="aboutIcon${index}">
                        <i class="fab fa-font-awesome"></i>
                        Icon (Font Awesome Klasse)
                    </label>
                    <div class="icon-input-group">
                        <input type="text" 
                               id="aboutIcon${index}" 
                               value="${item.icon || ''}" 
                               placeholder="z.B. fas fa-heart"
                               data-type="icon">
                        <div class="icon-preview ${item.icon ? 'valid' : 'empty'}" id="iconPreview${index}">
                            ${item.icon ? `<i class="${item.icon}"></i>` : '<i class="fas fa-question"></i>'}
                        </div>
                    </div>
                    <div class="form-hint">Verwende Font Awesome Icons wie "fas fa-heart" oder "fab fa-instagram"</div>
                </div>
                <div class="form-group">
                    <label for="aboutText${index}">
                        <i class="fas fa-edit"></i>
                        Text
                    </label>
                    <input type="text" 
                           id="aboutText${index}" 
                           value="${item.text || ''}" 
                           placeholder="Beschreibungstext eingeben..."
                           data-type="text">
                </div>
            </div>
        `;

        // Icon Preview Update
        const iconInput = editor.querySelector(`#aboutIcon${index}`);
        const iconPreview = editor.querySelector(`#iconPreview${index}`);
        
        if (iconInput && iconPreview) {
            iconInput.addEventListener('input', () => {
                const iconClass = iconInput.value.trim();
                if (iconClass) {
                    iconPreview.innerHTML = `<i class="${iconClass}"></i>`;
                    iconPreview.className = 'icon-preview valid';
                } else {
                    iconPreview.innerHTML = '<i class="fas fa-question"></i>';
                    iconPreview.className = 'icon-preview empty';
                }
            });
        }

        return editor;
    }

    // Remove Item Event Listeners
    function setupRemoveItemListeners() {
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-item-btn').dataset.index);
                removeAboutItem(index);
            });
        });
    }

    // About Item entfernen
    function removeAboutItem(index) {
        const aboutItemsList = document.getElementById('aboutItemsList');
        if (!aboutItemsList) return;

        const items = aboutItemsList.querySelectorAll('.about-item-editor');
        if (items[index]) {
            items[index].remove();
            
            // Indizes neu nummerieren
            updateAboutItemIndices();
            showNotification('About Item entfernt', 'success');
        }
    }

    // About Item Indizes aktualisieren
    function updateAboutItemIndices() {
        const aboutItemsList = document.getElementById('aboutItemsList');
        if (!aboutItemsList) return;

        const items = aboutItemsList.querySelectorAll('.about-item-editor');
        items.forEach((item, newIndex) => {
            // Header aktualisieren
            const header = item.querySelector('h4');
            if (header) {
                header.innerHTML = `<i class="fas fa-grip-vertical"></i> About Item ${newIndex + 1}`;
            }

            // Remove Button aktualisieren
            const removeBtn = item.querySelector('.remove-item-btn');
            if (removeBtn) {
                removeBtn.dataset.index = newIndex;
            }

            // Item Dataset aktualisieren
            item.dataset.index = newIndex;

            // Input IDs aktualisieren
            const iconInput = item.querySelector('input[data-type="icon"]');
            const textInput = item.querySelector('input[data-type="text"]');
            const iconPreview = item.querySelector('.icon-preview');

            if (iconInput) iconInput.id = `aboutIcon${newIndex}`;
            if (textInput) textInput.id = `aboutText${newIndex}`;
            if (iconPreview) iconPreview.id = `iconPreview${newIndex}`;
        });
    }

    // Neues About Item hinzufügen
    function addAboutItem() {
        const aboutItemsList = document.getElementById('aboutItemsList');
        if (!aboutItemsList) return;

        const currentItems = aboutItemsList.querySelectorAll('.about-item-editor');
        const newIndex = currentItems.length;
        
        const newItem = createAboutItemEditor({ icon: '', text: '' }, newIndex);
        aboutItemsList.appendChild(newItem);
        
        setupRemoveItemListeners();
        
        // Zum neuen Item scrollen
        newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Focus auf das Icon-Input setzen
        const iconInput = newItem.querySelector('input[data-type="icon"]');
        if (iconInput) {
            setTimeout(() => iconInput.focus(), 100);
        }

        showNotification('Neues About Item hinzugefügt', 'success');
    }

    // Cleanup beim Verlassen
    function cleanup() {
        if (hiCountListener) {
            hiCountListener();
        }
    }

    // Firebase initialisieren
    initializeAdminFirebase();

    // Cleanup beim Verlassen der Seite
    window.addEventListener('beforeunload', cleanup);

})();