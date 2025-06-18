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

async function sayHi() {
    try {
        const hiCountRef = window.firestore.doc(window.db, 'counters', 'hiCount');
        
        // Counter in Firestore erhöhen
        await window.firestore.updateDoc(hiCountRef, {
            count: window.firestore.increment(1)
        });
        
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
        
        showNotification("Hi zurück! 👋 (Offline)", 'default');
    }
}

// Lade und überwache Hi-Counter von Firebase
async function loadHiCount() {
    try {
        const hiCountRef = window.firestore.doc(window.db, 'counters', 'hiCount');
        
        // Erstelle Dokument falls es nicht existiert
        const docSnap = await window.firestore.getDoc(hiCountRef);
        if (!docSnap.exists()) {
            await window.firestore.setDoc(hiCountRef, { count: 0 });
        }
        
        // Echtzeitaktualisierungen überwachen
        unsubscribeHiCount = window.firestore.onSnapshot(hiCountRef, (doc) => {
            if (doc.exists()) {
                hiCount = doc.data().count;
                document.getElementById('hiCount').textContent = hiCount;
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

// Page Load Animation
document.addEventListener('DOMContentLoaded', function() {
    // Warte auf Firebase-Initialisierung
    setTimeout(() => {
        loadHiCount();
    }, 100);
    
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
