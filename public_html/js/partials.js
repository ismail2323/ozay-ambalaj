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
    function loadPartial(partialPath, targetSelector, position) {
        var fullPath = (partialPath.startsWith('/') && basePath !== '/') 
            ? basePath.replace(/\/$/, '') + partialPath 
            : partialPath;
        
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
                return false;
            });
    }

    /**
     * Initialize partials loading
     */
    function initPartials() {
        // Wait for basePath to be set
        if (!window.__BASE_PATH) {
            setTimeout(initPartials, 50);
            return;
        }
        
        basePath = window.__BASE_PATH;
        
        // Load header before body content
        var body = document.body;
        if (body) {
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
                })
                .catch(function(error) {
                    console.error('Error loading header partial:', error);
                });
        }
        
        // Load footer before closing body tag
        var main = document.querySelector('main');
        if (main) {
            loadPartial('/partials/footer.html', 'main', 'afterend')
                .then(function() {
                    // Load WhatsApp button after footer
                    loadPartial('/partials/whatsapp-button.html', 'body', 'beforeend');
                });
        } else {
            // Fallback: insert before closing body tag
            loadPartial('/partials/footer.html', 'body', 'beforeend')
                .then(function() {
                    // Load WhatsApp button after footer
                    loadPartial('/partials/whatsapp-button.html', 'body', 'beforeend');
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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPartials, 100);
        });
    } else {
        setTimeout(initPartials, 100);
    }

    // Export functions for external use
    window.loadPartial = loadPartial;
    window.updateActiveNavLink = updateActiveNavLink;
})();

