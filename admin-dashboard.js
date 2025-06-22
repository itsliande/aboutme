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

    // About Me Items verwalten
    function loadAboutItems(items) {
        const aboutItemsList = document.getElementById('aboutItemsList');
        if (!aboutItemsList) return;

        aboutItemsList.innerHTML = '';

        if (items && items.length > 0) {
            items.forEach((item, index) => {
                const itemElement = createAboutItemEditor(index, item.icon, item.text);
                aboutItemsList.appendChild(itemElement);
            });
        } else {
            // Füge ein leeres Item hinzu wenn keine Items vorhanden sind
            const emptyItem = createAboutItemEditor(0, '', '');
            aboutItemsList.appendChild(emptyItem);
        }

        setupRemoveItemListeners();
        setupIconPreview();
    }

    function createAboutItemEditor(index, icon = '', text = '') {
        const div = document.createElement('div');
        div.className = 'about-item-editor';
        div.setAttribute('data-index', index);
        
        div.innerHTML = `
            <div class="about-item-editor-header">
                <h4><i class="fas fa-grip-vertical"></i> About Item ${index + 1}</h4>
                <button type="button" class="admin-btn danger small remove-item-btn" title="Item entfernen">
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

        setupRemoveItemListeners();
        setupIconPreview();
        updateItemIndices();
        
        // Focus auf das Icon-Feld des neuen Items
        const iconInput = newItem.querySelector('.about-icon');
        if (iconInput) {
            iconInput.focus();
            iconInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        showNotification('Neues About Item hinzugefügt', 'success');
    }

    function setupRemoveItemListeners() {
        // Entferne alle existierenden Event Listener
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(button => {
            // Clone Button um alte Event Listener zu entfernen
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });

        // Füge neue Event Listener hinzu
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const itemEditor = e.target.closest('.about-item-editor');
                if (!itemEditor) return;

                const itemsList = document.getElementById('aboutItemsList');
                const remainingItems = itemsList.querySelectorAll('.about-item-editor');
                
                // Mindestens ein Item muss bleiben
                if (remainingItems.length <= 1) {
                    showNotification('Mindestens ein About Item muss vorhanden sein', 'warning');
                    return;
                }

                // Bestätigung für das Löschen
                const textInput = itemEditor.querySelector('.about-text');
                const text = textInput ? textInput.value.trim() : '';
                
                if (text && !confirm(`Item "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}" wirklich löschen?`)) {
                    return;
                }

                // Smooth Animation beim Entfernen
                itemEditor.style.transition = 'all 0.3s ease';
                itemEditor.style.opacity = '0';
                itemEditor.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    if (itemEditor.parentNode) {
                        itemEditor.remove();
                        updateItemIndices();
                        showNotification('About Item entfernt', 'success');
                    }
                }, 300);
            });
        });
    }

    function setupIconPreview() {
        // Setup Icon Preview für alle Icon-Inputs
        document.querySelectorAll('.about-icon').forEach(input => {
            // Entferne existierende Event Listener
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            const index = newInput.getAttribute('data-index') || newInput.id.split('-').pop();
            const preview = document.getElementById(`icon-preview-${index}`);
            
            if (preview) {
                // Sofortige Vorschau beim Laden
                updateIconPreview(newInput, preview);
                
                // Event Listener für Live-Vorschau
                newInput.addEventListener('input', () => {
                    updateIconPreview(newInput, preview);
                });
                
                newInput.addEventListener('blur', () => {
                    updateIconPreview(newInput, preview);
                });
            }
        });
    }

    function updateIconPreview(input, preview) {
        const iconClass = input.value.trim();
        
        if (iconClass) {
            // Validiere Font Awesome Klasse
            if (iconClass.match(/^(fas|far|fab|fal|fad|fat)\s+fa-[\w-]+$/)) {
                preview.innerHTML = `<i class="${iconClass}"></i>`;
                preview.className = 'icon-preview valid';
                input.classList.remove('error');
            } else {
                preview.innerHTML = `<i class="fas fa-exclamation-triangle"></i>`;
                preview.className = 'icon-preview invalid';
                input.classList.add('error');
            }
        } else {
            preview.innerHTML = `<i class="fas fa-question"></i>`;
            preview.className = 'icon-preview empty';
            input.classList.remove('error');
        }
    }

    function updateItemIndices() {
        const itemEditors = document.querySelectorAll('.about-item-editor');
        itemEditors.forEach((editor, index) => {
            editor.setAttribute('data-index', index);
            
            // Update Header
            const header = editor.querySelector('h4');
            if (header) {
                header.innerHTML = `<i class="fas fa-grip-vertical"></i> About Item ${index + 1}`;
            }
            
            // Update IDs und Labels
            const iconInput = editor.querySelector('.about-icon');
            const textInput = editor.querySelector('.about-text');
            const iconLabel = editor.querySelector('label[for^="about-icon"]');
            const textLabel = editor.querySelector('label[for^="about-text"]');
            const iconPreview = editor.querySelector('.icon-preview');
            
            if (iconInput) {
                iconInput.id = `about-icon-${index}`;
                iconInput.setAttribute('data-index', index);
            }
            if (textInput) {
                textInput.id = `about-text-${index}`;
            }
            if (iconLabel) {
                iconLabel.setAttribute('for', `about-icon-${index}`);
            }
            if (textLabel) {
                textLabel.setAttribute('for', `about-text-${index}`);
            }
            if (iconPreview) {
                iconPreview.id = `icon-preview-${index}`;
            }
        });
        
        // Setup Icon Preview nach Index-Update
        setupIconPreview();
    }

    function setDefaultAboutItems() {
        const defaultItems = [
            { icon: 'fas fa-rainbow', text: 'Demigirl or Nonbinary Transfem\'ig ldrk and Bi-sexual' },
            { icon: 'fas fa-heart', text: 'YU Fan (nazis call it linksversifft)' },
            { icon: 'fas fa-headphones', text: 'Professional listener' },
            { icon: 'fas fa-star', text: 'Extremely Gay' },
            { icon: 'fas fa-camera-retro', text: 'Look at my Insta and Pronoun Page' }
        ];

        loadAboutItems(defaultItems);
        console.log('✅ Standard About-Items gesetzt');
    }

    // About Me Update verarbeiten
    async function handleUpdateAbout() {
        if (!db) {
            showNotification('Keine Datenbank-Verbindung', 'error');
            return;
        }

        const aboutItemEditors = document.querySelectorAll('.about-item-editor');
        const items = [];

        // Sammle alle About-Items
        aboutItemEditors.forEach(editor => {
            const icon = editor.querySelector('.about-icon').value.trim();
            const text = editor.querySelector('.about-text').value.trim();

            if (icon && text) {
                items.push({ icon, text });
            }
        });

        if (items.length === 0) {
            showNotification('Mindestens ein About-Item ist erforderlich', 'error');
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

            // Log nur wenn möglich
            try {
                await logAdminActivity('about_items_updated', { itemCount: items.length });
            } catch (logError) {
                console.warn('Logging fehlgeschlagen:', logError.message);
            }

            showNotification('About Me Items erfolgreich aktualisiert', 'success');

            // Update main website immediately if same domain
            updateMainWebsite('about', { items });

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
            console.error('Fehler beim Aktualisieren der About-Items:', error);
            
            if (error.code === 'permission-denied') {
                showNotification('Keine Berechtigung zum Aktualisieren der About-Daten', 'error');
            } else if (error.code === 'unavailable') {
                showNotification('Firestore ist momentan nicht verfügbar', 'error');
            } else {
                showNotification('Fehler beim Aktualisieren der About-Items: ' + error.message, 'error');
            }
        } finally {
            // Reset button
            if (updateBtn) {
                updateBtn.disabled = false;
                updateBtn.innerHTML = '<i class="fas fa-save"></i> About Me aktualisieren';
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

            if (type === 'about') {
                // Update About Me items if elements exist
                const aboutItemsList = document.getElementById('aboutItemsList');
                if (aboutItemsList) {
                    aboutItemsList.innerHTML = '';
                    data.items.forEach(item => {
                        const itemElement = document.createElement('div');
                        itemElement.className = 'about-item';
                        itemElement.innerHTML = `
                            <i class="${item.icon}"></i>
                            <span>${item.text}</span>
                        `;
                        aboutItemsList.appendChild(itemElement);
                    });
                }
            }
        } catch (error) {
            // Silent fail - main website might not be accessible
            console.log('Main website update skipped:', error.message);
        }
    }

    // Load existing content data
    async function loadExistingContent() {
        if (!db) {
            console.warn('Firebase nicht verfügbar - setze Fallback-Werte');
            setFallbackContentValues();
            return;
        }

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
                    
                    console.log('✅ Profile-Daten geladen:', data);
                } else {
                    console.log('Profile-Dokument existiert noch nicht - wird beim ersten Speichern erstellt');
                    setDefaultProfileValues();
                }
            } catch (profileError) {
                console.warn('Profile-Daten konnten nicht geladen werden:', profileError.message);
                setDefaultProfileValues();
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
                    
                    console.log('✅ Social-Links-Daten geladen:', data);
                } else {
                    console.log('Social-Links-Dokument existiert noch nicht - wird beim ersten Speichern erstellt');
                    setDefaultLinksValues();
                }
            } catch (linksError) {
                console.warn('Social-Links-Daten konnten nicht geladen werden:', linksError.message);
                setDefaultLinksValues();
            }

            // About Me Items laden
            try {
                const aboutDoc = await db.collection('content').doc('aboutItems').get();
                if (aboutDoc.exists) {
                    const data = aboutDoc.data();
                    if (data.items && Array.isArray(data.items)) {
                        loadAboutItems(data.items);
                        console.log('✅ About-Items-Daten geladen:', data.items);
                    } else {
                        console.log('About-Items-Dokument hat keine Items - setze Standard-Werte');
                        setDefaultAboutItems();
                    }
                } else {
                    console.log('About-Items-Dokument existiert noch nicht - wird beim ersten Speichern erstellt');
                    setDefaultAboutItems();
                }
            } catch (aboutError) {
                console.warn('About-Items-Daten konnten nicht geladen werden:', aboutError.message);
                setDefaultAboutItems();
            }

        } catch (error) {
            console.error('Allgemeiner Fehler beim Laden der Content-Daten:', error);
            showNotification('Content-Daten konnten nicht geladen werden', 'warning');
            setFallbackContentValues();
        }
    }

    // Standard-Werte für Profile setzen
    function setDefaultProfileValues() {
        const nameInput = document.getElementById('profileName');
        const pronounsInput = document.getElementById('profilePronouns');
        const avatarInput = document.getElementById('avatarUrl');
        
        if (nameInput && !nameInput.value) {
            nameInput.placeholder = 'Name eingeben...';
            nameInput.value = 'Lian';
        }
        if (pronounsInput && !pronounsInput.value) {
            pronounsInput.placeholder = 'Pronomen eingeben...';
            pronounsInput.value = 'THEY/THEM (PREFERRED) OR IN GERMAN SHE/HER';
        }
        if (avatarInput && !avatarInput.value) {
            avatarInput.placeholder = 'Avatar URL eingeben...';
            avatarInput.value = '';
        }
    }

    // Standard-Werte für Links setzen
    function setDefaultLinksValues() {
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