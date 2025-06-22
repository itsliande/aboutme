// Haupt-Website JavaScript mit Firebase Integration
(function() {
    // Firebase Config
    const firebaseConfig = {
        apiKey: "AIzaSyAj1VyMdSTz76GXrVN-QS_rFd2oUdz-D4Y",
        authDomain: "aboutme-49bfb.firebaseapp.com",
        projectId: "aboutme-49bfb",
        storageBucket: "aboutme-49bfb.firebasestorage.app",
        messagingSenderId: "135756692299",
        appId: "1:135756692299:web:1999c654468d4300f706ce"
    };

    let db = null;
    let hiCountListener = null;

    // Firebase initialisieren
    function initializeFirebase() {
        if (typeof firebase === 'undefined') {
            console.log('⏳ Firebase SDK noch nicht geladen, warte...');
            setTimeout(initializeFirebase, 100);
            return;
        }

        try {
            console.log('🔥 Initialisiere Firebase...');
            
            // Firebase App initialisieren
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();

            console.log('✅ Firebase erfolgreich initialisiert');
            
            // Content und Counter laden
            loadContentFromFirebase();
            setupHiCounter();

        } catch (error) {
            console.error('❌ Firebase Initialisierung fehlgeschlagen:', error);
            console.log('📱 Verwende Fallback-Inhalte');
        }
    }

    // Content aus Firebase laden
    async function loadContentFromFirebase() {
        if (!db) {
            console.log('📱 Kein Firebase - verwende Standard-Inhalte');
            return;
        }

        try {
            // Profile-Daten laden
            const profileDoc = await db.collection('content').doc('profile').get();
            if (profileDoc.exists) {
                const profileData = profileDoc.data();
                updateProfileContent(profileData);
            }

            // Social Links laden
            const linksDoc = await db.collection('content').doc('socialLinks').get();
            if (linksDoc.exists) {
                const linksData = linksDoc.data();
                updateSocialLinks(linksData);
            }

            // About Items laden
            const aboutDoc = await db.collection('content').doc('aboutItems').get();
            if (aboutDoc.exists) {
                const aboutData = aboutDoc.data();
                if (aboutData.items && aboutData.items.length > 0) {
                    updateAboutItems(aboutData.items);
                }
            }

        } catch (error) {
            console.warn('⚠️ Content konnte nicht geladen werden:', error);
        }
    }

    // Profile Content aktualisieren
    function updateProfileContent(data) {
        try {
            const nameEl = document.querySelector('.name');
            const pronounsEl = document.querySelector('.pronouns');
            const avatarEl = document.getElementById('avatarImg');

            if (nameEl && data.name) {
                nameEl.textContent = data.name;
            }

            if (pronounsEl && data.pronouns) {
                pronounsEl.textContent = data.pronouns;
            }

            if (avatarEl && data.avatarUrl) {
                avatarEl.src = data.avatarUrl;
                avatarEl.alt = `${data.name || 'Lian'}'s Avatar`;
            }

            console.log('✅ Profile-Content aktualisiert');
        } catch (error) {
            console.warn('⚠️ Profile-Update fehlgeschlagen:', error);
        }
    }

    // Social Links aktualisieren
    function updateSocialLinks(data) {
        try {
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

            console.log('✅ Social-Links aktualisiert');
        } catch (error) {
            console.warn('⚠️ Social-Links-Update fehlgeschlagen:', error);
        }
    }

    // About Items aktualisieren
    function updateAboutItems(items) {
        try {
            const aboutContainer = document.getElementById('aboutItemsContainer');
            if (!aboutContainer || !items || items.length === 0) return;

            // Container leeren
            aboutContainer.innerHTML = '';

            // Neue Items hinzufügen
            items.forEach(item => {
                const aboutItem = document.createElement('div');
                aboutItem.className = 'about-item';
                aboutItem.innerHTML = `
                    <i class="${item.icon}"></i>
                    <span>${item.text}</span>
                `;
                aboutContainer.appendChild(aboutItem);
            });

            console.log('✅ About-Items aktualisiert:', items.length + ' Items');
        } catch (error) {
            console.warn('⚠️ About-Items-Update fehlgeschlagen:', error);
        }
    }

    // Hi-Counter Setup
    function setupHiCounter() {
        if (!db) {
            console.log('📱 Kein Firebase - Hi-Counter deaktiviert');
            return;
        }

        try {
            const hiCountRef = db.collection('counters').doc('hiCount');
            
            // Echtzeit-Listener für Hi-Counter
            hiCountListener = hiCountRef.onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    const count = data.count || 0;
                    updateHiCountDisplay(count);
                } else {
                    console.log('Hi-Counter Dokument existiert nicht');
                    updateHiCountDisplay(0);
                }
            }, (error) => {
                console.error('Fehler beim Hi-Counter Listener:', error);
                updateHiCountDisplay(0);
            });

        } catch (error) {
            console.error('Fehler beim Hi-Counter Setup:', error);
        }
    }

    // Hi-Counter Anzeige aktualisieren
    function updateHiCountDisplay(count) {
        const hiCountEl = document.getElementById('hiCount');
        if (hiCountEl) {
            hiCountEl.textContent = count;
            
            // Animation für Änderungen
            hiCountEl.style.transform = 'scale(1.1)';
            setTimeout(() => {
                hiCountEl.style.transform = 'scale(1)';
            }, 300);
        }
    }

    // Say Hi Funktion
    window.sayHi = async function() {
        if (!db) {
            alert('Hi-Counter ist momentan nicht verfügbar 😢');
            return;
        }

        const sayHiBtn = document.querySelector('.say-hi-btn');
        if (!sayHiBtn) return;

        // Button deaktivieren
        sayHiBtn.disabled = true;
        sayHiBtn.classList.add('disabled');
        sayHiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saying Hi...';

        try {
            const hiCountRef = db.collection('counters').doc('hiCount');
            
            // Atomic increment
            await hiCountRef.update({
                count: firebase.firestore.FieldValue.increment(1),
                lastIncrement: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Success feedback
            sayHiBtn.innerHTML = '<i class="fas fa-heart"></i> Thanks!';
            sayHiBtn.style.background = 'var(--accent-success)';
            
            // Reset nach 2 Sekunden
            setTimeout(() => {
                sayHiBtn.innerHTML = '<i class="fas fa-hand-sparkles"></i> Say Hi!';
                sayHiBtn.style.background = '';
                sayHiBtn.disabled = false;
                sayHiBtn.classList.remove('disabled');
            }, 2000);

        } catch (error) {
            console.error('Fehler beim Say Hi:', error);
            
            // Error feedback
            sayHiBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
            sayHiBtn.style.background = 'var(--accent-secondary)';
            
            // Reset nach 2 Sekunden
            setTimeout(() => {
                sayHiBtn.innerHTML = '<i class="fas fa-hand-sparkles"></i> Say Hi!';
                sayHiBtn.style.background = '';
                sayHiBtn.disabled = false;
                sayHiBtn.classList.remove('disabled');
            }, 2000);
        }
    };

    // Modal Funktionen
    window.showModal = function(type) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalBody) return;

        let content = '';
        
        switch(type) {
            case 'impressum':
                content = `
                    <h2>Impressum</h2>
                    <p>Diese Website ist ein persönliches Projekt von Lian.</p>
                    <p>Für Fragen oder Anregungen nutze bitte die verfügbaren Social Media Links.</p>
                `;
                break;
            case 'privacy':
                content = `
                    <h2>Privacy Policy</h2>
                    <p>Diese Website verwendet Firebase für den Hi-Counter und Content-Management.</p>
                    <p>Es werden keine persönlichen Daten gespeichert oder getrackt.</p>
                    <p>Der Hi-Counter speichert nur anonyme Klicks.</p>
                `;
                break;
            default:
                content = '<h2>Keine Inhalte verfügbar</h2>';
        }
        
        modalBody.innerHTML = content;
        modal.style.display = 'block';
    };

    window.closeModal = function() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };

    window.copyContact = function() {
        // Beispiel: E-Mail in Zwischenablage kopieren
        const email = 'lian@example.com'; // Ersetze mit echter E-Mail
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(() => {
                alert('Kontakt in Zwischenablage kopiert!');
            }).catch(() => {
                alert('Kopieren fehlgeschlagen');
            });
        } else {
            // Fallback für ältere Browser
            const textArea = document.createElement('textarea');
            textArea.value = email;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert('Kontakt in Zwischenablage kopiert!');
            } catch (err) {
                alert('Kopieren fehlgeschlagen');
            }
            document.body.removeChild(textArea);
        }
    };

    // Cleanup beim Verlassen
    function cleanup() {
        if (hiCountListener) {
            hiCountListener();
        }
    }

    // Global verfügbar machen für Admin Dashboard
    window.loadContentFromFirebase = loadContentFromFirebase;

    // Initialisierung starten
    initializeFirebase();

    // Cleanup beim Verlassen der Seite
    window.addEventListener('beforeunload', cleanup);

})();


