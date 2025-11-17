/**
 * Path Fix Script
 * Handles base path detection and asset path fixing for all HTML pages
 * This ensures assets work correctly regardless of the page location
 * MUST BE LOADED FIRST in all HTML pages
 */

(function() {
    'use strict';

    // ============================================================================
    // Base Path Calculation
    // ============================================================================
    var pathname = window.location.pathname || '/';
    var basePath = '/';
    
    // Handle /pages/{lang}/ format (maps to /pages/)
    var pagesMatch = pathname.match(/\/pages\/(tr|en|de)\//);
    if (pagesMatch) {
        // Extract base path before /pages/
        var pagesIndex = pathname.indexOf('/pages/');
        basePath = pathname.substring(0, pagesIndex);
    } else {
        // Fallback: handle /{lang}/ format
        var pagesIndex = pathname.indexOf('/pages/');
        if (pagesIndex !== -1) {
            basePath = pathname.substring(0, pagesIndex);
        } else if (pathname.lastIndexOf('/') > 0) {
            basePath = pathname.substring(0, pathname.lastIndexOf('/'));
        }
    }

    if (!basePath) {
        basePath = '/';
    }

    if (basePath !== '/' && basePath.charAt(0) !== '/') {
        basePath = '/' + basePath;
    }

    if (!basePath.endsWith('/')) {
        basePath += '/';
    }

    window.__BASE_PATH = basePath;

    // Set base tag for relative URLs
    if (!document.querySelector('base')) {
        var base = document.createElement('base');
        base.href = basePath;
        document.head.appendChild(base);
    }

    // Add manifest.json link dynamically with correct basePath
    // Remove existing manifest link if any (to avoid 404 errors)
    var existingManifestLink = document.querySelector('link[rel="manifest"]');
    if (existingManifestLink) {
        existingManifestLink.remove();
    }
    
    // Create new manifest link with correct basePath
    var manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = basePath.replace(/\/$/, '') + '/manifest.json';
    document.head.appendChild(manifestLink);

    // ============================================================================
    // Asset Path Fixing Function
    // ============================================================================
    function fixAssetPaths() {
        var basePath = window.__BASE_PATH || '/';
        
        // Fix absolute asset paths (like /assets/img/logo.png) - only if not root
        if (basePath !== '/') {
            var images = document.querySelectorAll('img[src^="/assets/"]');
            images.forEach(function(img) {
                var src = img.getAttribute('src');
                if (src && src.startsWith('/assets/')) {
                    img.src = basePath.replace(/\/$/, '') + src;
                }
            });
            
            var sources = document.querySelectorAll('source[src^="/assets/"]');
            sources.forEach(function(source) {
                var src = source.getAttribute('src');
                if (src && src.startsWith('/assets/')) {
                    source.src = basePath.replace(/\/$/, '') + src;
                }
            });
            
            var links = document.querySelectorAll('link[href^="/assets/"]');
            links.forEach(function(link) {
                var href = link.getAttribute('href');
                if (href && href.startsWith('/assets/')) {
                    link.href = basePath.replace(/\/$/, '') + href;
                }
            });
        }
        
        // Fix all img src attributes with relative asset paths
        var relativeImages = document.querySelectorAll('img[src^="assets/"], img[src^="./assets/"]');
        relativeImages.forEach(function(img) {
            var src = img.getAttribute('src');
            if (src && (src.startsWith('assets/') || src.startsWith('./assets/'))) {
                var cleanPath = src.replace(/^\.\//, '');
                img.src = basePath.replace(/\/$/, '') + '/' + cleanPath;
            }
        });
        
        // Fix all source src attributes (for video/audio)
        var relativeSources = document.querySelectorAll('source[src^="assets/"], source[src^="./assets/"]');
        relativeSources.forEach(function(source) {
            var src = source.getAttribute('src');
            if (src && (src.startsWith('assets/') || src.startsWith('./assets/'))) {
                var cleanPath = src.replace(/^\.\//, '');
                source.src = basePath.replace(/\/$/, '') + '/' + cleanPath;
            }
        });
        
        // Fix all link href attributes with relative asset paths
        var relativeLinks = document.querySelectorAll('link[href^="assets/"], link[href^="./assets/"]');
        relativeLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href && (href.startsWith('assets/') || href.startsWith('./assets/'))) {
                var cleanPath = href.replace(/^\.\//, '');
                link.href = basePath.replace(/\/$/, '') + '/' + cleanPath;
            }
        });
    }

    // ============================================================================
    // Run Asset Path Fixing
    // ============================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixAssetPaths);
    } else {
        // DOM already loaded, run immediately
        setTimeout(fixAssetPaths, 0);
    }

    // Also run on dynamic content (for AJAX-loaded content)
    var observer = new MutationObserver(function(mutations) {
        var shouldFix = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                shouldFix = true;
            }
        });
        if (shouldFix) {
            fixAssetPaths();
        }
    });

    // Observe body for new content
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // Also fix paths when partials are loaded (immediately, no delay)
    document.addEventListener('partialsLoaded', function() {
        // Fix paths immediately when partials are loaded
        fixAssetPaths();
        // Also fix again after a short delay to catch any dynamically added images
        setTimeout(fixAssetPaths, 50);
    });

    // ============================================================================
    // Dynamic Stylesheet Loading
    // ============================================================================
    function initStylesheets() {
        var basePath = window.__BASE_PATH || '/';
        function addStylesheet(href) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = (href.startsWith('/') && basePath !== '/') ? basePath.replace(/\/$/, '') + href : href;
            document.head.appendChild(link);
        }
        addStylesheet('/css/main.css');
        
        // Load page-specific CSS
        var pathname = window.location.pathname || '';
        var pageName = pathname.split('/').pop() || 'index.html';
        if (pageName === 'index.html') {
            addStylesheet('/css/index.css');
        } else if (pageName === 'about.html') {
            addStylesheet('/css/about.css');
        } else if (pageName === 'contact.html') {
            addStylesheet('/css/contact.css');
        } else if (pageName === 'references.html') {
            addStylesheet('/css/references.css');
        } else if (pageName === 'products.html') {
            addStylesheet('/css/products.css');
        } else if (pageName.startsWith('product-') && pageName.endsWith('.html')) {
            addStylesheet('/css/product-detail.css');
        } else if (pageName === 'quality.html') {
            addStylesheet('/css/quality.css');
        } else if (pageName === 'news.html') {
            addStylesheet('/css/news.css');
        } else if (pageName === 'news-detail.html') {
            addStylesheet('/css/news-detail.css');
        }
    }

    // Load stylesheets when basePath is ready
    if (window.__BASE_PATH) {
        initStylesheets();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.__BASE_PATH) {
                initStylesheets();
            } else {
                // Wait a bit more for basePath to be set
                setTimeout(function() {
                    if (window.__BASE_PATH) {
                        initStylesheets();
                    }
                }, 100);
            }
        });
    }

    // ============================================================================
    // Dynamic Script Loading
    // ============================================================================
    function initScripts() {
        var basePath = window.__BASE_PATH || '/';
        function addScript(src) {
            // Check if script already exists to prevent duplicate loading
            var existingScript = document.querySelector('script[src="' + src + '"], script[src="' + basePath.replace(/\/$/, '') + src + '"]');
            if (existingScript) {
                return; // Script already loaded, skip
            }
            var script = document.createElement('script');
            script.src = (src.startsWith('/') && basePath !== '/') ? basePath.replace(/\/$/, '') + src : src;
            script.defer = true;
            document.body.appendChild(script);
        }
        addScript('/js/partials.js');
        addScript('/js/translations.js');
        addScript('/js/main.js');
        
        // Load page-specific JS
        var pathname = window.location.pathname || '';
        var pageName = pathname.split('/').pop() || 'index.html';
        if (pageName === 'index.html') {
            addScript('/js/index.js');
        } else if (pageName === 'about.html') {
            addScript('/js/about.js');
        } else if (pageName === 'products.html') {
            addScript('/js/products.js');
        } else if (pageName.startsWith('product-') && pageName.endsWith('.html')) {
            addScript('/js/product-detail.js');
        } else if (pageName === 'quality.html') {
            addScript('/js/quality.js');
        } else if (pageName === 'news.html') {
            addScript('/js/news.js');
        } else if (pageName === 'news-detail.html') {
            addScript('/js/news-detail.js');
        }
    }

    // Load scripts when basePath is ready
    if (window.__BASE_PATH) {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initScripts);
        } else {
            setTimeout(initScripts, 100);
        }
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.__BASE_PATH) {
                initScripts();
            } else {
                // Wait a bit more for basePath to be set
                setTimeout(function() {
                    if (window.__BASE_PATH) {
                        initScripts();
                    }
                }, 200);
            }
        });
    }
})();

