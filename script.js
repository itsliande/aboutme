// Kontakt-Information kopieren
function copyContact() {
    const contactInfo = "deine-email@example.com"; // Ändere dies zu deiner echten E-Mail
    
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

// Say Hi Funktionalität
let hiCount = 0;

function sayHi() {
    hiCount++;
    document.getElementById('hiCount').textContent = hiCount;
    
    // Speichere den Counter im localStorage
    localStorage.setItem('hiCount', hiCount);
    
    // Zeige Animation
    showNotification("Hi zurück! 👋✨");
    
    // Button Animation
    const btn = document.querySelector('.say-hi-btn');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 150);
}

// Lade gespeicherten Hi-Counter
function loadHiCount() {
    const saved = localStorage.getItem('hiCount');
    if (saved) {
        hiCount = parseInt(saved);
        document.getElementById('hiCount').textContent = hiCount;
    }
}

// Modal Funktionen
function showModal(type) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    let content = '';
    
    if (type === 'impressum') {
        content = `
            <h2>Impressum</h2>
            <p>Diese Seite dient nur zu Demonstrationszwecken.</p>
            <p>Kontakt: deine-email@example.com</p>
        `;
    } else if (type === 'privacy') {
        content = `
            <h2>Privacy Policy</h2>
            <p>Diese Seite sammelt keine persönlichen Daten.</p>
            <p>Wir verwenden nur localStorage für den Hi-Counter.</p>
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

// Benachrichtigungen
function showNotification(message) {
    // Erstelle Benachrichtigung
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Slide out after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Page Load Animation
document.addEventListener('DOMContentLoaded', function() {
    loadHiCount();
    
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
});
