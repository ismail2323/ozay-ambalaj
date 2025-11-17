/**
 * Partials Loader
 * Dynamically loads header and footer from partials directory
 */

(function() {
    'use strict';

    var basePath = window.__BASE_PATH || '/';
    
    /**
     * Load a partial HTML file and insert it into the DOM
     * @param {string} partialPath - Path to the partial file
     * @param {string} targetSelector - CSS selector for the target element
     * @param {string} position - 'beforebegin', 'afterbegin', 'beforeend', 'afterend'
     */
    // Track loaded partials to prevent duplicates
    var loadedPartials = {
        footer: false,
        header: false,
        whatsapp: false
    };
    
    // Track loading state to prevent concurrent loads
    var loadingPartials = {
        footer: false,
        header: false,
        whatsapp: false
    };
    
    function loadPartial(partialPath, targetSelector, position) {
        var fullPath = (partialPath.startsWith('/') && basePath !== '/') 
            ? basePath.replace(/\/$/, '') + partialPath 
            : partialPath;
        
        // Check if this partial is already loaded or currently loading
        if (partialPath.includes('footer') || partialPath.includes('Footer')) {
            // First, check for duplicates in DOM and clean them up
            var existingFooters = document.querySelectorAll('.footer, footer');
            if (existingFooters.length > 1) {
                // Remove duplicates, keep only the first one
                for (var i = 1; i < existingFooters.length; i++) {
                    existingFooters[i].remove();
                }
                loadedPartials.footer = true;
                return Promise.resolve(true);
            }
            
            if (loadedPartials.footer || loadingPartials.footer) {
                // Footer already loaded or currently loading, don't load again
                return Promise.resolve(true);
            }
            
            var existingFooter = document.querySelector('.footer') || document.querySelector('footer');
            if (existingFooter) {
                // Footer already exists in DOM, mark as loaded
                loadedPartials.footer = true;
                return Promise.resolve(true);
            }
            
            // Mark as loading
            loadingPartials.footer = true;
        }
        
        if (partialPath.includes('header') || partialPath.includes('Header')) {
            var existingHeaders = document.querySelectorAll('.header, header');
            if (existingHeaders.length > 1) {
                // Remove duplicates, keep only the first one
                for (var i = 1; i < existingHeaders.length; i++) {
                    existingHeaders[i].remove();
                }
                loadedPartials.header = true;
                return Promise.resolve(true);
            }
            
            if (loadedPartials.header || loadingPartials.header) {
                // Header already loaded or currently loading, don't load again
                return Promise.resolve(true);
            }
            
            var existingHeader = document.querySelector('.header') || document.querySelector('header');
            if (existingHeader && existingHeader.querySelector('.nav')) {
                // Header already exists with nav, mark as loaded
                loadedPartials.header = true;
                return Promise.resolve(true);
            }
            
            // Mark as loading
            loadingPartials.header = true;
        }
        
        if (partialPath.includes('whatsapp') || partialPath.includes('WhatsApp')) {
            var existingWhatsAppButtons = document.querySelectorAll('.whatsapp-button, [class*="whatsapp"]');
            if (existingWhatsAppButtons.length > 1) {
                // Remove duplicates, keep only the first one
                for (var i = 1; i < existingWhatsAppButtons.length; i++) {
                    existingWhatsAppButtons[i].remove();
                }
                loadedPartials.whatsapp = true;
                return Promise.resolve(true);
            }
            
            if (loadedPartials.whatsapp || loadingPartials.whatsapp) {
                // WhatsApp button already loaded or currently loading, don't load again
                return Promise.resolve(true);
            }
            
            var existingWhatsApp = document.querySelector('.whatsapp-button') || document.querySelector('[class*="whatsapp"]');
            if (existingWhatsApp) {
                loadedPartials.whatsapp = true;
                return Promise.resolve(true);
            }
            
            // Mark as loading
            loadingPartials.whatsapp = true;
        }
        
        return fetch(fullPath)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load partial: ' + partialPath);
                }
                return response.text();
            })
            .then(function(html) {
                var target = document.querySelector(targetSelector);
                if (target) {
                    // Fix asset paths in HTML before inserting (if basePath is not root)
                    var basePath = window.__BASE_PATH || '/';
                    if (basePath !== '/') {
                        // Create a temporary div to parse HTML
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;
                        
                        // Fix img src attributes
                        var images = tempDiv.querySelectorAll('img[src^="/assets/"]');
                        images.forEach(function(img) {
                            var src = img.getAttribute('src');
                            if (src && src.startsWith('/assets/')) {
                                img.src = basePath.replace(/\/$/, '') + src;
                            }
                        });
                        
                        // Fix source src attributes
                        var sources = tempDiv.querySelectorAll('source[src^="/assets/"]');
                        sources.forEach(function(source) {
                            var src = source.getAttribute('src');
                            if (src && src.startsWith('/assets/')) {
                                source.src = basePath.replace(/\/$/, '') + src;
                            }
                        });
                        
                        // Fix link href attributes
                        var links = tempDiv.querySelectorAll('link[href^="/assets/"]');
                        links.forEach(function(link) {
                            var href = link.getAttribute('href');
                            if (href && href.startsWith('/assets/')) {
                                link.href = basePath.replace(/\/$/, '') + href;
                            }
                        });
                        
                        // Get fixed HTML
                        html = tempDiv.innerHTML;
                    }
                    
                    if (position === 'replace') {
                        target.outerHTML = html;
                    } else {
                        target.insertAdjacentHTML(position, html);
                    }
                    
                    // Mark as loaded and clear loading flag
                    if (partialPath.includes('footer') || partialPath.includes('Footer')) {
                        loadedPartials.footer = true;
                        loadingPartials.footer = false;
                    }
                    if (partialPath.includes('header') || partialPath.includes('Header')) {
                        loadedPartials.header = true;
                        loadingPartials.header = false;
                    }
                    if (partialPath.includes('whatsapp') || partialPath.includes('WhatsApp')) {
                        loadedPartials.whatsapp = true;
                        loadingPartials.whatsapp = false;
                    }
                    
                    // Dispatch custom event to trigger re-initialization of scripts
                    // This is used by path-fix.js, translations.js, and other scripts
                    var event = new CustomEvent('partialsLoaded');
                    document.dispatchEvent(event);
                    
                    // Trigger translations re-apply if translations.js is loaded
                    if (window.Translations && typeof window.reinitTranslations === 'function') {
                        setTimeout(function() {
                            window.reinitTranslations();
                        }, 100);
                    }
                    
                    return true;
                } else {
                    console.warn('Target element not found:', targetSelector);
                    return false;
                }
            })
            .catch(function(error) {
                console.error('Error loading partial:', error);
                // Clear loading flag on error
                if (partialPath.includes('footer') || partialPath.includes('Footer')) {
                    loadingPartials.footer = false;
                }
                if (partialPath.includes('header') || partialPath.includes('Header')) {
                    loadingPartials.header = false;
                }
                if (partialPath.includes('whatsapp') || partialPath.includes('WhatsApp')) {
                    loadingPartials.whatsapp = false;
                }
                return false;
            });
    }

    /**
     * Initialize partials loading
     */
    var partialsInitialized = false;
    var footerLoadAttempted = false; // Global flag to prevent multiple footer load attempts
    
    function initPartials() {
        // Prevent multiple initializations
        if (partialsInitialized) {
            // Even if already initialized, check for duplicates
            cleanupDuplicates();
            return;
        }
        
        // Wait for basePath to be set
        if (!window.__BASE_PATH) {
            setTimeout(initPartials, 50);
            return;
        }
        
        // CRITICAL: First, remove ALL existing footers before loading
        var allFooters = document.querySelectorAll('.footer, footer');
        if (allFooters.length > 0) {
            // Remove all existing footers
            for (var idx = 0; idx < allFooters.length; idx++) {
                try {
                    allFooters[idx].remove();
                } catch (e) {
                    try {
                        allFooters[idx].parentNode.removeChild(allFooters[idx]);
                    } catch (e2) {
                        console.warn('Could not remove existing footer:', e2);
                    }
                }
            }
            // Reset flags
            loadedPartials.footer = false;
            loadingPartials.footer = false;
        }
        
        // Check if header and footer already exist
        var existingHeaders = document.querySelectorAll('.header, header');
        
        // Clean up duplicate headers
        if (existingHeaders.length > 1) {
            // Keep only the first header, remove the rest
            for (var i = 1; i < existingHeaders.length; i++) {
                try {
                    existingHeaders[i].remove();
                } catch (e) {
                    try {
                        existingHeaders[i].parentNode.removeChild(existingHeaders[i]);
                    } catch (e2) {
                        console.warn('Could not remove duplicate header:', e2);
                    }
                }
            }
            loadedPartials.header = true;
        }
        
        partialsInitialized = true;
        basePath = window.__BASE_PATH;
        
        // Load header before body content - only if it doesn't exist
        var body = document.body;
        if (body && !loadedPartials.header && existingHeaders.length === 0) {
            loadPartial('/partials/header.html', 'body', 'afterbegin')
                .then(function() {
                    // After header is loaded, update active nav link based on current page
                    updateActiveNavLink();
                    // Give a bit more time for DOM to settle, then trigger translations reinit
                    setTimeout(function() {
                        if (window.reinitTranslations) {
                            window.reinitTranslations();
                        } else {
                            console.error('reinitTranslations function not available yet');
                        }
                    }, 300);
                    // Clean up duplicates after header is loaded
                    setTimeout(cleanupDuplicates, 100);
                })
                .catch(function(error) {
                    console.error('Error loading header partial:', error);
                });
        } else if (existingHeaders.length > 0) {
            // Header already exists, just update nav
            updateActiveNavLink();
        }
        
        // Load footer - ONLY ONCE - use global flag to prevent multiple attempts
        if (footerLoadAttempted || loadedPartials.footer || loadingPartials.footer) {
            // Footer load already attempted or completed, skip
            return;
        }
        
        footerLoadAttempted = true;
        loadedPartials.footer = false;
        loadingPartials.footer = false;
        
        var main = document.querySelector('main');
        if (main) {
            loadPartial('/partials/footer.html', 'main', 'afterend')
                .then(function() {
                    // Immediately check for duplicate footers after loading
                    setTimeout(function() {
                        cleanupDuplicates();
                        // Load WhatsApp button after footer
                        var existingWhatsApp = document.querySelector('.whatsapp-button') || document.querySelector('[class*="whatsapp"]');
                        if (!existingWhatsApp) {
                            loadPartial('/partials/whatsapp-button.html', 'body', 'beforeend');
                        }
                    }, 50);
                })
                .catch(function(error) {
                    // Reset flag on error so it can retry
                    footerLoadAttempted = false;
                    loadingPartials.footer = false;
                    console.error('Error loading footer:', error);
                });
        } else {
            // Fallback: insert before closing body tag
            loadPartial('/partials/footer.html', 'body', 'beforeend')
                .then(function() {
                    // Immediately check for duplicate footers after loading
                    setTimeout(function() {
                        cleanupDuplicates();
                        // Load WhatsApp button after footer
                        var existingWhatsApp = document.querySelector('.whatsapp-button') || document.querySelector('[class*="whatsapp"]');
                        if (!existingWhatsApp) {
                            loadPartial('/partials/whatsapp-button.html', 'body', 'beforeend');
                        }
                    }, 50);
                })
                .catch(function(error) {
                    // Reset flag on error so it can retry
                    footerLoadAttempted = false;
                    loadingPartials.footer = false;
                    console.error('Error loading footer:', error);
                });
        }
    }

    /**
     * Update active navigation link based on current page
     */
    function updateActiveNavLink() {
        var currentPage = window.location.pathname;
        var pageName = currentPage.split('/').pop() || 'index.html';
        
        // Remove active class from all nav links
        var navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
        navLinks.forEach(function(link) {
            link.classList.remove('active');
        });
        
        // Add active class to current page link
        navLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href && (href === pageName || (pageName === '' && href === 'index.html'))) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Cleanup function to remove duplicate footers/headers
     */
    function cleanupDuplicates() {
        // Remove duplicate footers - be more aggressive
        var footers = document.querySelectorAll('.footer, footer');
        if (footers.length > 1) {
            // Keep only the first footer, remove the rest
            // Use reverse loop to avoid index issues when removing
            for (var i = footers.length - 1; i > 0; i--) {
                var footer = footers[i];
                if (footer && footer.parentNode) {
                    try {
                        footer.remove();
                    } catch (e) {
                        // If remove() fails, try parentNode.removeChild()
                        try {
                            footer.parentNode.removeChild(footer);
                        } catch (e2) {
                            console.warn('Could not remove duplicate footer:', e2);
                        }
                    }
                }
            }
            // Ensure footer is marked as loaded
            loadedPartials.footer = true;
            loadingPartials.footer = false;
        } else if (footers.length === 1) {
            // Single footer exists, mark as loaded
            loadedPartials.footer = true;
            loadingPartials.footer = false;
        }
        
        // Remove duplicate headers
        var headers = document.querySelectorAll('.header, header');
        if (headers.length > 1) {
            // Keep only the first header, remove the rest
            for (var i = 1; i < headers.length; i++) {
                var header = headers[i];
                if (header && header.parentNode) {
                    header.remove();
                }
            }
            // Ensure header is marked as loaded
            loadedPartials.header = true;
        } else if (headers.length === 1) {
            // Single header exists, mark as loaded
            loadedPartials.header = true;
        }
        
        // Remove duplicate WhatsApp buttons
        var whatsappButtons = document.querySelectorAll('.whatsapp-button, [class*="whatsapp"]');
        if (whatsappButtons.length > 1) {
            // Keep only the first button, remove the rest
            for (var i = 1; i < whatsappButtons.length; i++) {
                var button = whatsappButtons[i];
                if (button && button.parentNode) {
                    button.remove();
                }
            }
            // Ensure WhatsApp is marked as loaded
            loadedPartials.whatsapp = true;
        } else if (whatsappButtons.length === 1) {
            // Single WhatsApp button exists, mark as loaded
            loadedPartials.whatsapp = true;
        }
    }

    // Initialize when DOM is ready
    function initializeWithCleanup() {
        // CRITICAL: First, remove ALL existing footers immediately
        var allFooters = document.querySelectorAll('.footer, footer');
        if (allFooters.length > 1) {
            // Remove all except the first one
            for (var i = allFooters.length - 1; i > 0; i--) {
                try {
                    allFooters[i].remove();
                } catch (e) {
                    try {
                        allFooters[i].parentNode.removeChild(allFooters[i]);
                    } catch (e2) {
                        // Ignore errors
                    }
                }
            }
        }
        
        // Cleanup any other duplicates
        cleanupDuplicates();
        
        // Then initialize
        initPartials();
        
        // Continue cleanup at intervals - very aggressive
        setTimeout(cleanupDuplicates, 50);
        setTimeout(cleanupDuplicates, 100);
        setTimeout(cleanupDuplicates, 200);
        setTimeout(cleanupDuplicates, 400);
        setTimeout(cleanupDuplicates, 700);
        setTimeout(cleanupDuplicates, 1200);
        setTimeout(cleanupDuplicates, 2000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWithCleanup);
    } else {
        initializeWithCleanup();
    }
    
    // Also cleanup when partials are loaded
    document.addEventListener('partialsLoaded', function() {
        setTimeout(cleanupDuplicates, 100);
        setTimeout(cleanupDuplicates, 300);
        setTimeout(cleanupDuplicates, 600);
    });
    
    // Cleanup on window load as well
    window.addEventListener('load', function() {
        setTimeout(cleanupDuplicates, 100);
        setTimeout(cleanupDuplicates, 500);
    });
    
    // Use MutationObserver to watch for new footer additions and clean them up
    var observer = new MutationObserver(function(mutations) {
        var shouldCleanup = false;
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && (node.classList.contains('footer') || node.tagName === 'FOOTER')) {
                        shouldCleanup = true;
                    } else if (node.querySelectorAll) {
                        var footers = node.querySelectorAll('.footer, footer');
                        if (footers.length > 1) {
                            shouldCleanup = true;
                        }
                    }
                }
            });
        });
        if (shouldCleanup) {
            // Immediate cleanup when footer is detected
            cleanupDuplicates();
            // Additional cleanups with slight delays
            setTimeout(cleanupDuplicates, 50);
            setTimeout(cleanupDuplicates, 150);
            setTimeout(cleanupDuplicates, 300);
        }
    });
    
    // Start observing
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        });
    }

    // Export functions for external use
    window.loadPartial = loadPartial;
    window.updateActiveNavLink = updateActiveNavLink;
    window.cleanupDuplicates = cleanupDuplicates;
})();

