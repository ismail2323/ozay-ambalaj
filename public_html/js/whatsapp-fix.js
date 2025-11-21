// WhatsApp Button Fix - Force correct number
(function() {
    'use strict';
    
    const CORRECT_WHATSAPP_NUMBER = '905354681968';
    const CORRECT_WHATSAPP_URL = 'https://wa.me/' + CORRECT_WHATSAPP_NUMBER + '?text=Merhaba,%20Öz-Ay%20Ambalaj%20hakkında%20bilgi%20almak%20istiyorum';
    
    // Function to fix WhatsApp button
    function fixWhatsAppButton() {
        const whatsappButtons = document.querySelectorAll('.whatsapp-button, #whatsapp-btn, a[href*="wa.me"], a[href*="whatsapp"]');
        
        whatsappButtons.forEach(function(button) {
            const currentHref = button.getAttribute('href');
            
            // Check if button has wrong number
            if (currentHref && (currentHref.includes('555') || currentHref.includes('1234567') || !currentHref.includes(CORRECT_WHATSAPP_NUMBER))) {
                // Force update href
                button.setAttribute('href', CORRECT_WHATSAPP_URL);
                button.href = CORRECT_WHATSAPP_URL; // Also update property
                
                // Remove all existing click handlers by cloning
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Add new click handler
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    window.open(CORRECT_WHATSAPP_URL, '_blank', 'noopener,noreferrer');
                    return false;
                }, true);
                
                // Force update onclick attribute
                newButton.setAttribute('onclick', 'window.open(\'' + CORRECT_WHATSAPP_URL + '\', \'_blank\', \'noopener,noreferrer\'); return false;');
                
                console.log('WhatsApp button fixed:', CORRECT_WHATSAPP_NUMBER);
            }
        });
    }
    
    // Fix immediately
    fixWhatsAppButton();
    
    // Fix on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixWhatsAppButton);
    }
    
    // Fix after partials are loaded
    document.addEventListener('partialsLoaded', function() {
        setTimeout(fixWhatsAppButton, 100);
    });
    
    // Use MutationObserver to watch for new WhatsApp buttons
    const observer = new MutationObserver(function(mutations) {
        let shouldFix = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && (node.classList.contains('whatsapp-button') || node.id === 'whatsapp-btn')) {
                            shouldFix = true;
                        }
                        if (node.querySelectorAll) {
                            const buttons = node.querySelectorAll('.whatsapp-button, #whatsapp-btn, a[href*="wa.me"]');
                            if (buttons.length > 0) {
                                shouldFix = true;
                            }
                        }
                    }
                });
            }
        });
        if (shouldFix) {
            setTimeout(fixWhatsAppButton, 50);
        }
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Fix every 500ms for first 10 seconds
    let fixCount = 0;
    const fixInterval = setInterval(function() {
        fixWhatsAppButton();
        fixCount++;
        if (fixCount >= 20) { // 10 seconds (20 * 500ms)
            clearInterval(fixInterval);
        }
    }, 500);
    
    // Also fix on page visibility change (in case page was cached)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(fixWhatsAppButton, 100);
        }
    });
    
    // Fix on focus (when user comes back to tab)
    window.addEventListener('focus', function() {
        setTimeout(fixWhatsAppButton, 100);
    });
})();


