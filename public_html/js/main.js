// Main JavaScript
(function() {
    'use strict';
    
    // Navigation
    let navigationInitialized = false;
    
    function initNavigation() {
        if (navigationInitialized) return;
        
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const navLinks = document.querySelectorAll('.nav-links a');
        
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
            if (linkPage === currentPage) {
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
                
                let response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    response = { ok: false, message: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' };
                }
                
                // Show toast notification
                showToast(response.message, response.ok ? 'success' : 'error');
                
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
                
                showToast('Bağlantı hatası oluştu. Lütfen tekrar deneyin.', 'error');
            };
            
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
    // This MUST run first, before any other click handlers
    (function setupQuoteButtonDelegation() {
        if (document.quoteButtonDelegationSetup) {
            return;
        }
        document.quoteButtonDelegationSetup = true;
        
        // Use capture phase with highest priority - runs FIRST
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
                
                // Stop everything and navigate
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                // Use setTimeout to ensure it executes
                setTimeout(function() {
                    window.location.href = contactUrl;
                }, 0);
                return false;
            }
        }, true); // Capture phase - runs BEFORE all other listeners
    })();
    
    // Initialize all functions
    function init() {
        initStickyHeader();
        initContactFormPrefill();
        initContactForm();
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
        // Re-initialize external links after footer is loaded
        setTimeout(initExternalLinks, 300);
        // Re-initialize quote buttons after content is loaded
        setTimeout(initQuoteButtons, 400);
    });
    
    // Fallback: try to initialize navigation after a delay
    setTimeout(function() {
        initNavigationAfterPartials();
    }, 500);
})();

