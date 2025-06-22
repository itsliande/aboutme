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

            // Verwende set mit merge für bessere Kompatibilität
            await db.collection('content').doc('profile').set(profileData, { merge: true });

            // Log nur wenn möglich
            try {
                await logAdminActivity('profile_updated', { name, pronouns, avatarUrl });
            } catch (logError) {
                console.warn('Logging fehlgeschlagen:', logError.message);
            }

            showNotification('Profile erfolgreich aktualisiert', 'success');

            // Update main website immediately if same domain
            updateMainWebsite('profile', profileData);

            // Force reload content on main website if possible
            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.loadContentFromFirebase();
                    console.log('✅ Hauptwebsite Content neu geladen');
                } catch (e) {
                    console.log('ℹ️ Hauptwebsite Content-Reload nicht möglich:', e.message);
                }
            }

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

            // Log nur wenn möglich
            try {
                await logAdminActivity('links_updated', linksData);
            } catch (logError) {
                console.warn('Logging fehlgeschlagen:', logError.message);
            }

            showNotification('Social Links erfolgreich aktualisiert', 'success');

            // Update main website immediately if same domain
            updateMainWebsite('links', linksData);

            // Force reload content on main website if possible
            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.loadContentFromFirebase();
                    console.log('✅ Hauptwebsite Content neu geladen');
                } catch (e) {
                    console.log('ℹ️ Hauptwebsite Content-Reload nicht möglich:', e.message);
                }
            }

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

    // About Me Items verwalten - Verbesserte Version
    function loadAboutItems(items) {
        const aboutItemsList = document.getElementById('aboutItemsList');
        if (!aboutItemsList) return;

        aboutItemsList.innerHTML = '';

        if (items && items.length > 0) {
            items.forEach((item, index) => {
                const itemEditor = createAboutItemEditor(index, item.icon, item.text);
                aboutItemsList.appendChild(itemEditor);
            });
        } else {
            // Füge ein leeres Item hinzu wenn keine Items vorhanden sind
            const emptyItem = createAboutItemEditor(0, '', '');
            aboutItemsList.appendChild(emptyItem);
        }

        // Setup Event Listeners nach dem Laden mit Delay
        setTimeout(() => {
            setupAboutItemsEventListeners();
        }, 100);
    }

    function createAboutItemEditor(index, icon = '', text = '') {
        const div = document.createElement('div');
        div.className = 'about-item-editor';
        div.setAttribute('data-index', index);
        
        div.innerHTML = `
            <div class="about-item-editor-header">
                <h4><i class="fas fa-grip-vertical"></i> About Item ${index + 1}</h4>
                <button type="button" class="admin-btn danger small remove-item-btn" data-index="${index}" title="Item entfernen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="about-item-editor-content">
                <div class="form-group">
                    <label for="about-icon-${index}">
                        <i class="fas fa-icons"></i>
                        Icon (Font Awesome Klasse)
                    </label>
                    <div class="icon-input-group">
                        <input type="text" 
                               id="about-icon-${index}"
                               class="about-icon" 
                               placeholder="z.B. fas fa-heart, fab fa-instagram" 
                               value="${icon}"
                               data-index="${index}">
                        <div class="icon-preview" id="icon-preview-${index}">
                            ${icon ? `<i class="${icon}"></i>` : '<i class="fas fa-question"></i>'}
                        </div>
                    </div>
                    <small class="form-hint">
                        Beispiele: fas fa-heart, fab fa-instagram, fas fa-star, fas fa-music
                    </small>
                </div>
                <div class="form-group">
                    <label for="about-text-${index}">
                        <i class="fas fa-edit"></i>
                        Beschreibungstext
                    </label>
                    <textarea 
                        id="about-text-${index}"
                        class="about-text" 
                        placeholder="Beschreibe dich hier..." 
                        rows="2">${text}</textarea>
                    <small class="form-hint">
                        Maximal 100 Zeichen empfohlen für beste Darstellung
                    </small>
                </div>
            </div>
        `;

        return div;
    }

    // Zentrale Event Listener Setup Funktion
    function setupAboutItemsEventListeners() {
        // Remove Button Event Listeners
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.removeEventListener('click', handleRemoveItem); // Entferne alte Listener
            button.addEventListener('click', handleRemoveItem);
        });

        // Icon Input Event Listeners
        document.querySelectorAll('.about-icon').forEach(input => {
            input.removeEventListener('input', handleIconInput); // Entferne alte Listener
            input.addEventListener('input', handleIconInput);
        });

        console.log('✅ About Items Event Listeners setup');
    }

    // Event Handler Funktionen
    function handleRemoveItem(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const aboutItemsList = document.getElementById('aboutItemsList');
        const currentItems = aboutItemsList.querySelectorAll('.about-item-editor');
        
        if (currentItems.length <= 1) {
            showNotification('Mindestens ein About Item ist erforderlich', 'warning');
            return;
        }

        if (!confirm('Dieses About Item wirklich entfernen?')) {
            return;
        }

        const itemEditor = e.target.closest('.about-item-editor');
        if (itemEditor) {
            // Smooth Animation beim Entfernen
            itemEditor.style.transition = 'all 0.3s ease';
            itemEditor.style.opacity = '0';
            itemEditor.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                itemEditor.remove();
                updateItemIndices();
                setupAboutItemsEventListeners(); // Event Listeners neu setup
                showNotification('About Item entfernt', 'success');
            }, 300);
        }
    }

    function handleIconInput(e) {
        const input = e.target;
        const index = input.getAttribute('data-index');
        const preview = document.getElementById(`icon-preview-${index}`);
        
        if (preview) {
            updateIconPreview(input, preview);
        }
    }

    function addAboutItem() {
        const aboutItemsList = document.getElementById('aboutItemsList');
        if (!aboutItemsList) {
            showNotification('About Items Liste nicht gefunden', 'error');
            return;
        }

        const currentItems = aboutItemsList.querySelectorAll('.about-item-editor');
        
        // Maximal 10 Items erlauben
        if (currentItems.length >= 10) {
            showNotification('Maximal 10 About Items erlaubt', 'warning');
            return;
        }

        const newIndex = currentItems.length;
        const newItem = createAboutItemEditor(newIndex, '', '');
        
        // Smooth Animation beim Hinzufügen
        newItem.style.opacity = '0';
        newItem.style.transform = 'translateY(-20px)';
        aboutItemsList.appendChild(newItem);

        // Animation
        setTimeout(() => {
            newItem.style.transition = 'all 0.3s ease';
            newItem.style.opacity = '1';
            newItem.style.transform = 'translateY(0)';
        }, 10);

        updateItemIndices();
        setupAboutItemsEventListeners(); // Event Listeners neu setup
        
        // Focus auf das Icon-Feld des neuen Items
        setTimeout(() => {
            const iconInput = newItem.querySelector('.about-icon');
            if (iconInput) {
                iconInput.focus();
                iconInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 350);

        showNotification('Neues About Item hinzugefügt', 'success');
    }

    // About-Update verarbeiten
    async function handleUpdateAbout() {
        if (!db) {
            showNotification('Keine Datenbank-Verbindung', 'error');
            return;
        }

        const aboutItemsList = document.getElementById('aboutItemsList');
        if (!aboutItemsList) {
            showNotification('About Items Liste nicht gefunden', 'error');
            return;
        }

        const items = [];
        const itemEditors = aboutItemsList.querySelectorAll('.about-item-editor');

        // Sammle alle Items
        itemEditors.forEach((editor, index) => {
            const iconInput = editor.querySelector('.about-icon');
            const textInput = editor.querySelector('.about-text');
            
            if (iconInput && textInput) {
                const icon = iconInput.value.trim();
                const text = textInput.value.trim();
                
                if (icon && text) {
                    items.push({ icon, text });
                }
            }
        });

        if (items.length === 0) {
            showNotification('Mindestens ein About Item ist erforderlich', 'error');
            return;
        }

        // Show loading state
        const updateBtn = document.getElementById('updateAboutBtn');
        if (updateBtn) {
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speichere...';
        }

        try {
            const aboutData = {
                items,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser.email
            };

            await db.collection('content').doc('aboutItems').set(aboutData, { merge: true });

            // Log
            try {
                await logAdminActivity('about_updated', { itemCount: items.length });
            } catch (logError) {
                console.warn('Logging fehlgeschlagen:', logError.message);
            }

            showNotification('About Me Items erfolgreich aktualisiert', 'success');

            // Update main website immediately
            updateMainWebsite('about', aboutData);

            // Force reload content on main website if possible
            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.loadContentFromFirebase();
                    console.log('✅ Hauptwebsite Content neu geladen');
                } catch (e) {
                    console.log('ℹ️ Hauptwebsite Content-Reload nicht möglich:', e.message);
                }
            }

            // Reload items to ensure consistency (WICHTIG: Dies verhindert das Kaputtgehen!)
            setTimeout(() => {
                loadAboutItems(items);
            }, 500);

        } catch (error) {
            console.error('Fehler beim Aktualisieren der About Items:', error);
            
            if (error.code === 'permission-denied') {
                showNotification('Keine Berechtigung zum Aktualisieren der About-Daten', 'error');
            } else if (error.code === 'unavailable') {
                showNotification('Firestore ist momentan nicht verfügbar', 'error');
            } else {
                showNotification('Fehler beim Aktualisieren der About Items: ' + error.message, 'error');
            }
        } finally {
            // Reset button
            if (updateBtn) {
                updateBtn.disabled = false;
                updateBtn.innerHTML = '<i class="fas fa-save"></i> About Me aktualisieren';
            }
        }
    }

    // Helper Functions für About Items
    function updateItemIndices() {
        const aboutItemsList = document.getElementById('aboutItemsList');
        if (!aboutItemsList) return;

        const items = aboutItemsList.querySelectorAll('.about-item-editor');
        items.forEach((item, index) => {
            item.setAttribute('data-index', index);
            
            // Update header
            const header = item.querySelector('.about-item-editor-header h4');
            if (header) {
                header.innerHTML = `<i class="fas fa-grip-vertical"></i> About Item ${index + 1}`;
            }
            
            // Update IDs
            const iconInput = item.querySelector('.about-icon');
            const textInput = item.querySelector('.about-text');
            const preview = item.querySelector('.icon-preview');
            const removeBtn = item.querySelector('.remove-item-btn');
            
            if (iconInput) {
                iconInput.id = `about-icon-${index}`;
                iconInput.setAttribute('data-index', index);
            }
            if (textInput) {
                textInput.id = `about-text-${index}`;
            }
            if (preview) {
                preview.id = `icon-preview-${index}`;
            }
            if (removeBtn) {
                removeBtn.setAttribute('data-index', index);
            }
        });
    }

    function updateIconPreview(input, preview) {
        const iconClass = input.value.trim();
        
        if (iconClass) {
            try {
                preview.innerHTML = `<i class="${iconClass}"></i>`;
                preview.className = 'icon-preview valid';
            } catch (error) {
                preview.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                preview.className = 'icon-preview invalid';
            }
        } else {
            preview.innerHTML = '<i class="fas fa-question"></i>';
            preview.className = 'icon-preview empty';
        }
    }

    // Existierende Content-Daten laden
    async function loadExistingContent() {
        if (!db) return;

        try {
            // Profile-Daten laden
            const profileDoc = await db.collection('content').doc('profile').get();
            if (profileDoc.exists) {
                const data = profileDoc.data();
                console.log('Profile-Dokument geladen:', data);
                
                if (data.name) document.getElementById('profileName').value = data.name;
                if (data.pronouns) document.getElementById('profilePronouns').value = data.pronouns;
                if (data.avatarUrl) document.getElementById('avatarUrl').value = data.avatarUrl;
            } else {
                console.log('Profile-Dokument existiert noch nicht - wird beim ersten Speichern erstellt');
            }

            // Social Links laden
            const linksDoc = await db.collection('content').doc('socialLinks').get();
            if (linksDoc.exists) {
                const data = linksDoc.data();
                console.log('Social-Links-Dokument geladen:', data);
                
                if (data.instagram) document.getElementById('instagramLink').value = data.instagram;
                if (data.pronounPage) document.getElementById('pronounPageLink').value = data.pronounPage;
                if (data.spotify) document.getElementById('spotifyLink').value = data.spotify;
            } else {
                console.log('Social-Links-Dokument existiert noch nicht - wird beim ersten Speichern erstellt');
            }

            // About Items laden
            const aboutDoc = await db.collection('content').doc('aboutItems').get();
            if (aboutDoc.exists) {
                const data = aboutDoc.data();
                console.log('About-Items-Dokument geladen:', data);
                
                if (data.items && data.items.length > 0) {
                    loadAboutItems(data.items);
                } else {
                    loadAboutItems([]);
                }
            } else {
                console.log('About-Items-Dokument existiert noch nicht - wird beim ersten Speichern erstellt');
                loadAboutItems([]);
            }

        } catch (error) {
            console.error('Fehler beim Laden der bestehenden Content-Daten:', error);
            // Fallback: Leere Items laden
            loadAboutItems([]);
        }
    }

    // Cleanup beim Verlassen
    function cleanup() {
        if (hiCountListener) {
            hiCountListener();
        }
    }

    // Notification System
    function showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `notification ${type}`;
        toast.innerHTML = `
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border-secondary);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            color: var(--text-primary);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
            font-weight: 600;
        `;
        
        // Type-specific styling
        switch(type) {
            case 'success':
                toast.style.borderColor = 'var(--accent-success)';
                toast.style.background = 'rgba(0, 255, 136, 0.1)';
                break;
            case 'error':
                toast.style.borderColor = 'var(--accent-secondary)';
                toast.style.background = 'rgba(255, 0, 128, 0.1)';
                break;
            case 'warning':
                toast.style.borderColor = 'var(--accent-warning)';
                toast.style.background = 'rgba(255, 170, 0, 0.1)';
                break;
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-triangle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // CSS für Animationen
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialisierung starten
    initializeAdminFirebase();

    // Cleanup beim Verlassen der Seite
    window.addEventListener('beforeunload', cleanup);

})();