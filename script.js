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

// Benachrichtigung anzeigen
function showNotification(message) {
    // Erstelle Benachrichtigung
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // CSS Animation hinzufügen
    if (!document.querySelector('#notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Nach 3 Sekunden entfernen
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Smooth Scroll-Effekt für Links
document.addEventListener('DOMContentLoaded', function() {
    // Lade Animation für die Karte
    const profileCard = document.querySelector('.profile-card');
    profileCard.style.opacity = '0';
    profileCard.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        profileCard.style.transition = 'all 0.6s ease';
        profileCard.style.opacity = '1';
        profileCard.style.transform = 'translateY(0)';
    }, 100);
});
