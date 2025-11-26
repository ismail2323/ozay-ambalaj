// Main JavaScript
(function() {
    'use strict';
    
    // Navigation
    let navigationInitialized = false;
    
    // Abort all active fetches from partials.js
    function abortAllPartialFetches() {
        try {
            if (window.abortAllFetches && typeof window.abortAllFetches === 'function') {
                window.abortAllFetches();
            }
        } catch (e) {
            // Silently ignore errors during abort (might be called during page unload)
        }
    }
    
    // Setup navigation link delegation - handles all nav links dynamically
    (function setupNavigationDelegation() {
        if (document.navigationDelegationSetup) {
            return;
        }
        document.navigationDelegationSetup = true;
        
        // Use capture phase to intercept navigation clicks early
        // BUT: Only intercept header/footer navigation links, let all other links work normally
        document.addEventListener('click', function(e) {
            // Check if clicked element or its parent is a navigation link
            let target = e.target;
            let navLink = null;
            
            // IMPORTANT: Only intercept links that are explicitly in navigation menus
            // Let all other links (news detail, product detail, etc.) work normally
            if (target.closest) {
                navLink = target.closest('.nav-links a, .mobile-nav-links a');
            }
            
            // If not found, traverse up manually but ONLY check for navigation menu links
            if (!navLink) {
                while (target && target !== document && target !== document.body) {
                    if (target.tagName === 'A' && target.href) {
                        // Check if this link is inside navigation menus
                        const parentNav = target.closest ? target.closest('.nav-links, .mobile-nav-links') : null;
                        if (parentNav) {
                            navLink = target;
                            break;
                        }
                    }
                    target = target.parentElement;
                }
            }
            
            // If not a navigation menu link, let it work normally
            if (!navLink) {
                return; // Let browser handle it normally
            }
            
            // Check if navLink exists and has an href attribute
            const href = navLink ? navLink.getAttribute('href') : null;
            if (!href) {
                return; // No href, let browser handle it
            }
            
            if (navLink && href) {
                // IMPORTANT: Skip quote buttons - they have their own delegation
                if (navLink.classList && navLink.classList.contains('quote-btn')) {
                    return; // Let quote button delegation handle it
                }
                
                // Also check if it's inside a quote button
                const isInQuoteButton = navLink.closest ? navLink.closest('.quote-btn') : null;
                if (isInQuoteButton) {
                    return; // Let quote button delegation handle it
                }
                
                // Skip external links and anchors
                if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('javascript:')) {
                    return; // Let default behavior handle it
                }
                
                // Skip if already absolute path to pages/
                if (href.startsWith('/pages/')) {
                    return; // Let default behavior handle it
                }
                
                // Build correct URL based on current location
                const currentPath = window.location.pathname;
                const basePath = window.__BASE_PATH || '/';
                
                // CRITICAL: All physical files are in /pages/tr/
                // We always point links to /pages/tr/, path-fix.js handles URL display
                // Extract query string if exists
                const hrefParts = href.split('?');
                const targetPage = hrefParts[0].split('/').pop() || 'index.html';
                const queryString = hrefParts[1] ? '?' + hrefParts[1] : '';
                
                // Always use /pages/tr/ (actual file location)
                let navUrl;
                if (basePath === '/' || basePath === '') {
                    navUrl = '/pages/tr/' + targetPage + queryString;
                } else {
                    const cleanBasePath = basePath.replace(/\/$/, '');
                    navUrl = cleanBasePath + '/pages/tr/' + targetPage + queryString;
                }
                
                // Abort all partial fetches before navigation
                abortAllPartialFetches();
                
                // Prevent default navigation
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                
                // Navigate after a tiny delay to ensure abort completes
                setTimeout(function() {
                    window.location.href = navUrl;
                }, 0);
                
                return false;
            }
        }, true); // Capture phase - runs before other listeners
    })();
    
    function initNavigation() {
        if (navigationInitialized) return;
        
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
        
        if (mobileToggle && mobileMenu) {
            // Toggle button click handler
            mobileToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const isActive = mobileMenu.classList.contains('active');
                mobileMenu.classList.toggle('active');
                this.classList.toggle('active');
                
                // Body scroll lock when menu is open
                if (!isActive) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
            
            // Close menu when clicking on a menu link
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
            
            navigationInitialized = true;
        }
        
        // Set active link based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // Sticky header with hide on scroll down, show on scroll up
    function initStickyHeader() {
        const header = document.querySelector('.header');
        
        if (!header) {
            // Header henüz yüklenmemiş, partials yüklendikten sonra tekrar dene
            document.addEventListener('partialsLoaded', function() {
                initStickyHeader();
            }, { once: true });
            return;
        }
        
        let lastScroll = 0;
        const scrollThreshold = 50; // Minimum scroll distance to trigger hide/show
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            // Scroll edildiğinde header'a arka plan rengi ekle
            if (currentScroll > 20) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
            
            // Aşağı kaydırma - header'ı gizle
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                header.classList.add('header-hidden');
            } 
            // Yukarı kaydırma - header'ı göster
            else if (currentScroll < lastScroll) {
                header.classList.remove('header-hidden');
            }
            
            // Sayfa en üstteyse header'ı göster
            if (currentScroll <= 0) {
                header.classList.remove('header-hidden');
            }

            lastScroll = currentScroll;
        });
    }
    
    // AOS-like Scroll Animations
    function initAnimations() {
        const animatedElements = document.querySelectorAll('[data-aos]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => observer.observe(el));
    }
    
    // Counter animations moved to index.js and about.js
    
    // Back to Top button functionality
    function initBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top-btn');
        
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Smooth scroll to top
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Also scroll main-content if it exists
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }
    
    // Prefill contact form with product parameter from URL
    function initContactFormPrefill() {
        const urlParams = new URLSearchParams(window.location.search);
        const product = urlParams.get('product');
        
        if (product) {
            const subjectSelect = document.getElementById('subject');
            const messageTextarea = document.getElementById('message');
            
            if (subjectSelect) {
                subjectSelect.value = 'teklif';
            }
            
            if (messageTextarea) {
                const existingMessage = messageTextarea.value || '';
                const productMessage = existingMessage ? 
                    existingMessage + '\n\nÜrün: ' + product : 
                    'Merhaba,\n\n' + product + ' ürünü hakkında teklif almak istiyorum.\n\nTeşekkürler.';
                messageTextarea.value = productMessage;
            }
        }
    }
    
    // Contact form handler
    function initContactForm() {
        const contactForm = document.getElementById('contact-form');
        
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton ? submitButton.textContent : '';
            
            // Disable submit button
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Gönderiliyor...';
            }
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Create AJAX request
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/contact.php', true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            
            xhr.onload = function() {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
                
                // Check response status
                if (xhr.status !== 200) {
                    console.error('Server error:', xhr.status, xhr.statusText);
                    console.error('Response:', xhr.responseText);
                    showToast('Sunucu hatası oluştu. Lütfen tekrar deneyin.', 'error');
                    return;
                }
                
                let response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    console.error('JSON parse error:', e);
                    console.error('Response text:', xhr.responseText);
                    showToast('Sunucu hatası oluştu. Lütfen tekrar deneyin.', 'error');
                    return;
                }
                
                // Show toast notification
                showToast(response.message || 'Bir hata oluştu. Lütfen tekrar deneyin.', response.ok ? 'success' : 'error');
                
                // Reset form on success
                if (response.ok) {
                    contactForm.reset();
                }
            };
            
            xhr.onerror = function() {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
                
                console.error('Network error occurred');
                showToast('Bağlantı hatası oluştu. Lütfen tekrar deneyin.', 'error');
            };
            
            xhr.ontimeout = function() {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
                
                console.error('Request timeout');
                showToast('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.', 'error');
            };
            
            // Set timeout (30 seconds)
            xhr.timeout = 30000;
            
            // Send request
            xhr.send(formData);
        });
    }
    
    // Simple toast notification
    function showToast(message, type) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-notification ' + (type || 'info');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#2FA84F' : type === 'error' ? '#dc2626' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            font-size: 0.95rem;
            line-height: 1.5;
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 5 seconds
        setTimeout(function() {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, 5000);
        
        // Add CSS animations if not already added
        if (!document.querySelector('#toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
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
        }
    }
    
    // Fix WhatsApp button - ensure correct number
    function initWhatsAppButton() {
        const whatsappButtons = document.querySelectorAll('.whatsapp-button, #whatsapp-btn');
        const correctWhatsAppUrl = 'https://wa.me/905354681968?text=Merhaba,%20Öz-Ay%20Ambalaj%20hakkında%20bilgi%20almak%20istiyorum';
        
        whatsappButtons.forEach(function(button) {
            // Update href to correct number
            button.setAttribute('href', correctWhatsAppUrl);
            
            // Remove existing onclick handlers
            button.removeAttribute('onclick');
            
            // Add new click handler with correct number
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                window.open(correctWhatsAppUrl, '_blank', 'noopener,noreferrer');
                return false;
            }, true); // Use capture phase - runs before other listeners
        });
    }
    
    // Fix external links to prevent base tag interference
    function initExternalLinks() {
        const externalLinks = document.querySelectorAll('.external-link[data-external-url]');
        externalLinks.forEach(function(link) {
            // Remove any existing listeners by cloning
            if (link.dataset.listenerAdded) {
                return;
            }
            link.dataset.listenerAdded = 'true';
            
            const externalUrl = link.getAttribute('data-external-url');
            if (externalUrl) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    window.open(externalUrl, '_blank', 'noopener,noreferrer');
                    return false;
                }, true); // Use capture phase - runs before other listeners
            }
        });
    }
    
    // Event delegation for external links (works even if loaded dynamically)
    // This MUST run first, before any other click handlers
    (function setupExternalLinkDelegation() {
        if (document.externalLinkDelegationSetup) {
            return;
        }
        document.externalLinkDelegationSetup = true;
        
        // Use capture phase with highest priority - runs FIRST
        document.addEventListener('click', function(e) {
            // Check if clicked element or its parent is an external link
            let target = e.target;
            let link = null;
            
            // First try closest
            if (target.closest) {
                link = target.closest('.external-link');
            }
            
            // If not found, traverse up manually
            if (!link) {
                while (target && target !== document && target !== document.body) {
                    if (target.classList && target.classList.contains('external-link')) {
                        link = target;
                        break;
                    }
                    target = target.parentElement;
                }
            }
            
            if (link) {
                const externalUrl = link.getAttribute('data-external-url');
                if (externalUrl) {
                    // Stop everything and open URL
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    // Use setTimeout to ensure it executes
                    setTimeout(function() {
                        window.open(externalUrl, '_blank', 'noopener,noreferrer');
                    }, 0);
                    return false;
                }
            }
        }, true); // Capture phase - runs BEFORE all other listeners
    })();
    
    // Initialize quote buttons - fix href and add click handler
    function initQuoteButtons() {
        const quoteButtons = document.querySelectorAll('.quote-btn');
        quoteButtons.forEach(function(button) {
            // Skip if already processed
            if (button.dataset.quoteInitialized === 'true') {
                return;
            }
            button.dataset.quoteInitialized = 'true';
            
            // Get current path to determine correct contact.html path
            const currentPath = window.location.pathname;
            const basePath = window.__BASE_PATH || '/';
            
            // Extract language from path if available
            let lang = 'tr'; // default
            const langMatch = currentPath.match(/\/pages\/(tr|en|de)\//);
            if (langMatch) {
                lang = langMatch[1];
            }
            
            // Build contact URL
            const productCategory = button.getAttribute('data-product');
            const contactPath = basePath.replace(/\/$/, '') + '/pages/' + lang + '/contact.html';
            const contactUrl = contactPath + (productCategory ? '?product=' + encodeURIComponent(productCategory) : '');
            
            // Update href to full path
            button.setAttribute('href', contactUrl);
            
            // Add click handler to ensure navigation works - use capture phase
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                window.location.href = contactUrl;
                return false;
            }, true); // Capture phase - runs before other listeners
        });
    }
    
    // Event delegation for quote buttons (works even if loaded dynamically)
    // This MUST run FIRST, before navigation delegation and other click handlers
    (function setupQuoteButtonDelegation() {
        if (document.quoteButtonDelegationSetup) {
            return;
        }
        document.quoteButtonDelegationSetup = true;
        
        // Use capture phase with highest priority - runs FIRST before navigation delegation
        // Priority: quote buttons > navigation links
        document.addEventListener('click', function(e) {
            // Check if clicked element or its parent is a quote button
            let target = e.target;
            let quoteButton = null;
            
            // First try closest
            if (target.closest) {
                quoteButton = target.closest('.quote-btn');
            }
            
            // If not found, traverse up manually
            if (!quoteButton) {
                while (target && target !== document && target !== document.body) {
                    if (target.classList && target.classList.contains('quote-btn')) {
                        quoteButton = target;
                        break;
                    }
                    target = target.parentElement;
                }
            }
            
            if (quoteButton) {
                const currentPath = window.location.pathname;
                const basePath = window.__BASE_PATH || '/';
                
                // Extract language from path if available
                let lang = 'tr'; // default
                const langMatch = currentPath.match(/\/pages\/(tr|en|de)\//);
                if (langMatch) {
                    lang = langMatch[1];
                }
                
                // Build contact URL
                const productCategory = quoteButton.getAttribute('data-product');
                const contactPath = basePath.replace(/\/$/, '') + '/pages/' + lang + '/contact.html';
                const contactUrl = contactPath + (productCategory ? '?product=' + encodeURIComponent(productCategory) : '');
                
                // Abort all partial fetches before navigation
                abortAllPartialFetches();
                
                // Stop everything and navigate
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                
                // Use setTimeout to ensure it executes and abort completes
                setTimeout(function() {
                    window.location.href = contactUrl;
                }, 0);
                return false;
            }
        }, true); // Capture phase - runs BEFORE all other listeners (including navigation)
    })();
    
    // Initialize all functions
    function init() {
        initStickyHeader();
        initBackToTop();
        initContactFormPrefill();
        initContactForm();
        initWhatsAppButton();
        initExternalLinks();
        initQuoteButtons();
    }
    
    // Initialize navigation after partials are loaded
    function initNavigationAfterPartials() {
        initNavigation();
    }
    
    // Initialize animations on DOMContentLoaded
    function initAnimationsOnLoad() {
        initAnimations();
    }
    
    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            initAnimationsOnLoad();
        });
    } else {
        init();
        initAnimationsOnLoad();
    }
    
    // Listen for partials loaded event to initialize navigation
    document.addEventListener('partialsLoaded', function() {
        setTimeout(initNavigationAfterPartials, 100);
        // Re-initialize contact form prefill after partials are loaded
        setTimeout(initContactFormPrefill, 200);
        // Re-initialize back to top button after footer is loaded
        setTimeout(initBackToTop, 150);
        // Re-initialize WhatsApp button after partials are loaded
        setTimeout(initWhatsAppButton, 250);
        // Re-initialize external links after footer is loaded
        setTimeout(initExternalLinks, 300);
        // Re-initialize quote buttons after content is loaded
        setTimeout(initQuoteButtons, 400);
    });
    
    // Fallback: try to initialize navigation after a delay
    setTimeout(function() {
        initNavigationAfterPartials();
        initWhatsAppButton();
    }, 500);
    
    // Continuously check and fix WhatsApp button (in case it loads late)
    setInterval(function() {
        const whatsappButtons = document.querySelectorAll('.whatsapp-button, #whatsapp-btn');
        const correctWhatsAppUrl = 'https://wa.me/905354681968?text=Merhaba,%20Öz-Ay%20Ambalaj%20hakkında%20bilgi%20almak%20istiyorum';
        
        whatsappButtons.forEach(function(button) {
            const currentHref = button.getAttribute('href');
            // Check if href contains wrong number (555 or old format)
            if (currentHref && (currentHref.includes('5551234567') || currentHref.includes('555') || !currentHref.includes('905354681968'))) {
                button.setAttribute('href', correctWhatsAppUrl);
                // Remove all click listeners and re-add
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    window.open(correctWhatsAppUrl, '_blank', 'noopener,noreferrer');
                    return false;
                }, true);
            }
        });
    }, 1000); // Check every second
})();



