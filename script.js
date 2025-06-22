// Kontakt-Information kopieren
function copyContact() {
    const contactInfo = "lian@example.com"; // Ändere dies zu deiner echten E-Mail
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(contactInfo).then(() => {
            showNotification("E-Mail kopiert! 📧");
        }).catch(() => {
            fallbackCopyTextToClipboard(contactInfo);
        });
    } else {
        fallbackCopyTextToClipboard(contactInfo);
    }
}

// Fallback für ältere Browser
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification("E-Mail kopiert! 📧");
    } catch (err) {
        showNotification("Kopieren fehlgeschlagen 😞");
    }
    
    document.body.removeChild(textArea);
}

// Say Hi Funktionalität mit Firebase
let hiCount = 0;
let unsubscribeHiCount = null;
let firebaseReady = false;

async function sayHi() {
    // Überprüfe tägliches Limit
    if (!canSayHiToday()) {
        showNotification("Du hast heute schon Hi gesagt! 😊 Komm morgen wieder.", 'default');
        return;
    }

    if (!firebaseReady || !window.firestoreDb) {
        // Fallback auf localStorage wenn Firebase nicht verfügbar
        hiCount++;
        document.getElementById('hiCount').textContent = hiCount;
        localStorage.setItem('hiCount', hiCount);
        
        // Markiere als "Hi gesagt" für heute
        markHiSaidToday();
        
        showNotification("Hi zurück! 👋 (Offline)", 'default');
        
        // Button Animation
        const btn = document.querySelector('.say-hi-btn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
        return;
    }

    try {
        const hiCountRef = window.firestoreDb.collection('counters').doc('hiCount');
        
        // Counter in Firestore erhöhen
        await hiCountRef.update({
            count: firebase.firestore.FieldValue.increment(1),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Markiere als "Hi gesagt" für heute
        markHiSaidToday();
        
        // Zeige Animation
        showNotification("Hi zurück! 👋✨", 'success');
        
        // Button Animation
        const btn = document.querySelector('.say-hi-btn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
        
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Hi-Counters:', error);
        
        // Fallback auf localStorage
        hiCount++;
        document.getElementById('hiCount').textContent = hiCount;
        localStorage.setItem('hiCount', hiCount);
        
        // Markiere als "Hi gesagt" für heute
        markHiSaidToday();
        
        showNotification("Hi zurück! 👋 (Offline)", 'default');
    }
}

// Lade und überwache Hi-Counter von Firebase
async function loadHiCount() {
    if (!firebaseReady || !window.firestoreDb) {
        // Fallback auf localStorage
        loadHiCountFromLocal();
        return;
    }

    try {
        const hiCountRef = window.firestoreDb.collection('counters').doc('hiCount');
        
        // Erstelle Dokument falls es nicht existiert
        const docSnap = await hiCountRef.get();
        if (!docSnap.exists) {
            await hiCountRef.set({ 
                count: 0,
                created: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Echtzeitaktualisierungen überwachen
        unsubscribeHiCount = hiCountRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                hiCount = data.count || 0;
                document.getElementById('hiCount').textContent = hiCount;
                
                // Animiere Counter bei Änderung
                animateCounter();
            }
        }, (error) => {
            console.error('Fehler beim Überwachen des Hi-Counters:', error);
            // Fallback auf localStorage
            loadHiCountFromLocal();
        });
        
    } catch (error) {
        console.error('Fehler beim Laden des Hi-Counters:', error);
        // Fallback auf localStorage
        loadHiCountFromLocal();
    }
}

// Fallback: Lade Hi-Counter aus localStorage
function loadHiCountFromLocal() {
    const saved = localStorage.getItem('hiCount');
    if (saved) {
        hiCount = parseInt(saved);
        document.getElementById('hiCount').textContent = hiCount;
    }
}

// Counter-Animation
function animateCounter() {
    const counterElement = document.getElementById('hiCount');
    counterElement.style.transform = 'scale(1.2)';
    counterElement.style.color = 'var(--accent-primary)';
    
    setTimeout(() => {
        counterElement.style.transform = 'scale(1)';
        counterElement.style.color = '';
    }, 300);
}

// Cleanup beim Verlassen der Seite
function cleanup() {
    if (unsubscribeHiCount) {
        unsubscribeHiCount();
    }
}

// Modal Funktionen
function showModal(type) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    let content = '';
    
    if (type === 'impressum') {
        content = `
            <h2 style="color: var(--accent-primary); margin-bottom: 1.5rem;">Impressum</h2>
            <p style="margin-bottom: 1rem;">Diese persönliche Seite dient zur Selbstpräsentation.</p>
            <p style="margin-bottom: 1rem;"><strong>Verantwortlich:</strong> Lian</p>
            <p style="margin-bottom: 1rem;"><strong>Kontakt:</strong> lian@example.com</p>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Diese Seite ist nicht-kommerziell und dient nur zu Informationszwecken.</p>
        `;
    } else if (type === 'privacy') {
        content = `
            <h2 style="color: var(--accent-primary); margin-bottom: 1.5rem;">Privacy Policy</h2>
            <p style="margin-bottom: 1rem;">Diese Seite respektiert deine Privatsphäre.</p>
            <p style="margin-bottom: 1rem;"><strong>Datensammlung:</strong> Wir sammeln keine persönlichen Daten.</p>
            <p style="margin-bottom: 1rem;"><strong>Cookies:</strong> Wir verwenden nur localStorage für den Hi-Counter.</p>
            <p style="margin-bottom: 1rem;"><strong>Externe Links:</strong> Links zu Social Media Plattformen unterliegen deren Datenschutzbestimmungen.</p>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Bei Fragen kontaktiere mich gerne.</p>
        `;
    }
    
    modalBody.innerHTML = content;
    modal.style.display = 'block';
    
    // Smooth fade in
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Smooth scrolling für Anchor-Links
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Erweiterte Benachrichtigungen mit verschiedenen Typen
function showNotification(message, type = 'default') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    let bgGradient = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
    
    if (type === 'success') {
        bgGradient = 'linear-gradient(135deg, #00b894, #00cec9)';
    } else if (type === 'error') {
        bgGradient = 'linear-gradient(135deg, #e17055, #fd79a8)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgGradient};
        color: white;
        padding: 16px 24px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 600;
        z-index: 1001;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 30px rgba(108, 92, 231, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Slide out after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

// Tägliches Hi-Limit Funktionen
function canSayHiToday() {
    const lastHiDate = localStorage.getItem('lastHiDate');
    const today = new Date().toDateString();
    
    if (!lastHiDate || lastHiDate !== today) {
        return true; // Kann Hi sagen
    }
    
    return false; // Bereits heute Hi gesagt
}

function markHiSaidToday() {
    const today = new Date().toDateString();
    localStorage.setItem('lastHiDate', today);
    updateHiButtonState();
}

function updateHiButtonState() {
    const btn = document.querySelector('.say-hi-btn');
    const canSayHi = canSayHiToday();
    
    if (!canSayHi) {
        btn.disabled = true;
        btn.classList.add('disabled');
        btn.innerHTML = '<i class="fas fa-check"></i> Du hast heute schon Hi gesagt!';
    } else {
        btn.disabled = false;
        btn.classList.remove('disabled');
        btn.innerHTML = '<i class="fas fa-hand-sparkles"></i> Say Hi!';
    }
}

// Countdown bis zum nächsten Hi
function getTimeUntilNextHi() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
}

// Content aus Firebase laden und HTML aktualisieren
async function loadContentFromFirebase() {
    if (!db) {
        console.warn('Firebase nicht verfügbar - verwende statische Inhalte');
        return;
    }

    try {
        // Profile-Daten laden
        const profileDoc = await db.collection('content').doc('profile').get();
        if (profileDoc.exists) {
            const data = profileDoc.data();
            updateProfileOnPage(data);
        }

        // Social Links laden
        const linksDoc = await db.collection('content').doc('socialLinks').get();
        if (linksDoc.exists) {
            const data = linksDoc.data();
            updateSocialLinksOnPage(data);
        }

        // About Items laden
        const aboutDoc = await db.collection('content').doc('aboutItems').get();
        if (aboutDoc.exists) {
            const data = aboutDoc.data();
            if (data.items && Array.isArray(data.items)) {
                updateAboutItemsOnPage(data.items);
            }
        }

        console.log('✅ Content aus Firebase geladen');
    } catch (error) {
        console.warn('⚠️ Fehler beim Laden des Contents aus Firebase:', error.message);
    }
}

// Profile-Daten auf der Seite aktualisieren
function updateProfileOnPage(data) {
    const nameEl = document.querySelector('.name');
    const pronounsEl = document.querySelector('.pronouns');
    const avatarEl = document.querySelector('#avatarImg');

    if (nameEl && data.name) {
        nameEl.textContent = data.name;
    }
    if (pronounsEl && data.pronouns) {
        pronounsEl.textContent = data.pronouns;
    }
    if (avatarEl && data.avatarUrl) {
        avatarEl.src = data.avatarUrl;
        avatarEl.alt = `${data.name || 'User'}'s Avatar`;
    }
}

// Social Links auf der Seite aktualisieren
function updateSocialLinksOnPage(data) {
    const socialBtns = document.querySelectorAll('.social-btn');
    
    socialBtns.forEach(btn => {
        const href = btn.getAttribute('href');
        
        if (href && href.includes('instagram') && data.instagram) {
            btn.href = data.instagram;
        } else if (href && href.includes('pronouns.page') && data.pronounPage) {
            btn.href = data.pronounPage;
        } else if (href && href.includes('spotify') && data.spotify) {
            btn.href = data.spotify;
        }
    });
}

// About Items auf der Seite aktualisieren
function updateAboutItemsOnPage(items) {
    const aboutItemsContainer = document.querySelector('.about-items');
    if (!aboutItemsContainer || !Array.isArray(items)) return;

    aboutItemsContainer.innerHTML = '';

    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'about-item';
        itemEl.innerHTML = `
            <i class="${item.icon}"></i>
            <span>${item.text}</span>
        `;
        aboutItemsContainer.appendChild(itemEl);
    });
}

// Echtzeit-Updates für Content
function setupContentRealtimeUpdates() {
    if (!window.firestoreDb) {
        console.warn('Firestore nicht verfügbar - keine Echtzeit-Updates möglich');
        return;
    }

    console.log('🔄 Richte Echtzeit-Updates für Content ein...');

    try {
        // Profile Updates überwachen
        window.firestoreDb.collection('content').doc('profile').onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                updateProfileDisplay(data);
                console.log('✅ Profile live aktualisiert:', data);
                showNotification('Profile aktualisiert! 🔄', 'success');
            }
        }, (error) => {
            console.error('Fehler bei Profile Echtzeit-Updates:', error);
        });

        // Social Links Updates überwachen  
        window.firestoreDb.collection('content').doc('socialLinks').onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                updateSocialLinks(data);
                console.log('✅ Social Links live aktualisiert:', data);
                showNotification('Social Links aktualisiert! 🔗', 'success');
            }
        }, (error) => {
            console.error('Fehler bei Social Links Echtzeit-Updates:', error);
        });

        console.log('✅ Echtzeit-Updates erfolgreich eingerichtet');

    } catch (error) {
        console.error('❌ Fehler bei Echtzeit-Updates:', error);
    }
}

// Page Load Animation
document.addEventListener('DOMContentLoaded', function() {
    // Firebase Status sofort prüfen
    console.log('DOM geladen - prüfe Firebase Status...');
    if (window.firebaseLoaded && window.firestoreDb) {
        console.log('🔄 Firebase bereits verfügbar - starte Hi-Counter und Content-Loading');
        firebaseReady = true;
        loadHiCount();
        loadContentFromFirebase();
        setupContentRealtimeUpdates();
    } else {
        console.log('⏳ Warte auf Firebase...');
    }
    
    // Button-Status beim Laden überprüfen
    updateHiButtonState();
    
    // Staggered animation for cards
    const cards = document.querySelectorAll('.profile-card, .about-card, .social-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Escape key closes modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Cleanup beim Verlassen der Seite
    window.addEventListener('beforeunload', cleanup);
});

// Firebase Ready Event Listener
window.addEventListener('firebaseReady', function() {
    firebaseReady = true;
    console.log('🎯 Firebase Ready Event empfangen - lade Hi-Counter und Content');
    console.log('Firebase Status:', { 
        ready: firebaseReady, 
        dbAvailable: !!window.firestoreDb,
        appAvailable: !!window.firebaseApp
    });
    
    // Lade alle Firebase-Daten
    loadHiCount();
    loadContentFromFirebase();
    
    // Echtzeitaktualisierungen für Content einrichten
    setupContentRealtimeUpdates();
    
    console.log('🔄 Content-Loading und Echtzeit-Updates initialisiert');
});

// Kontinuierliche Überprüfung für Firebase Status
function checkFirebaseStatus() {
    if (window.firebaseLoaded && window.firestoreDb && !firebaseReady) {
        console.log('🔄 Firebase Status erkannt - initialisiere Hi-Counter und Content');
        firebaseReady = true;
        loadHiCount();
        loadContentFromFirebase();
        setupContentRealtimeUpdates();
        return true;
    }
    return false;
}

// Überprüfung alle 500ms für die ersten 5 Sekunden
let checkCount = 0;
const firebaseChecker = setInterval(() => {
    checkCount++;
    console.log(`🔍 Firebase Check #${checkCount}...`);
    
    if (checkFirebaseStatus() || checkCount >= 10) {
        clearInterval(firebaseChecker);
        if (checkCount >= 10 && !firebaseReady) {
            console.log('⚠️ Firebase Timeout - verwende localStorage Fallback');
            loadHiCountFromLocal();
            console.log('⚠️ Content-Updates nur über Firebase verfügbar');
        }
    }
}, 500);

//# sourceMappingURL=main.js.map


