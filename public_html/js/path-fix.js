/**
 * Path Fix Script
 * Handles base path detection and asset path fixing for all HTML pages
 * This ensures assets work correctly regardless of the page location
 * MUST BE LOADED FIRST in all HTML pages
 */

// CRITICAL: Handle URL redirect BEFORE anything else (for Python HTTP server compatibility)
// This must run immediately, before DOM is ready
(function handleUrlRedirectImmediate() {
    'use strict';
    
    var htmlElement = document.documentElement || document.getElementsByTagName('html')[0];
    var legacyRedirectEnabled = htmlElement && htmlElement.getAttribute('data-legacy-lang-redirect') === 'true';
    var pathname = window.location.pathname || '/';
    var langMatch = pathname.match(/\/pages\/(tr|en|de)\/(.+)$/);
    
    // In modern mode we only store preferred language information and skip redirects
    if (!legacyRedirectEnabled) {
        if (langMatch) {
            var detectedLang = langMatch[1];
            try {
                localStorage.setItem('preferredLanguage', detectedLang);
            } catch (e) {
                // localStorage might be unavailable; ignore
            }
        }
        return;
    }
    
    // Legacy mode: redirect /en/ or /de/ URLs to /tr/ physical files
    if (langMatch && (langMatch[1] === 'en' || langMatch[1] === 'de')) {
        var targetLang = langMatch[1];
        var pageName = langMatch[2];
        
        // Calculate base path
        var basePath = '/';
        var pagesIndex = pathname.indexOf('/pages/');
        if (pagesIndex > 0) {
            basePath = pathname.substring(0, pagesIndex);
            if (!basePath.endsWith('/')) {
                basePath += '/';
            }
        }
        
        // Build Turkish URL (actual file location)
        var trUrl = (basePath === '/' || basePath === '') 
            ? '/pages/tr/' + pageName 
            : basePath.replace(/\/$/, '') + '/pages/tr/' + pageName;
        
        // Build language URL (desired URL to show)
        var langUrl = (basePath === '/' || basePath === '') 
            ? '/pages/' + targetLang + '/' + pageName 
            : basePath.replace(/\/$/, '') + '/pages/' + targetLang + '/' + pageName;
        
        // Preserve query string if exists
        if (window.location.search) {
            trUrl += window.location.search;
            langUrl += window.location.search;
        }
        
        // Check if current path is already the Turkish path (we've been redirected)
        var currentIsTr = pathname.indexOf('/pages/tr/') !== -1;
        
        // Check if we're already in a redirect loop using a more reliable method
        var redirectKey = 'redirecting_' + targetLang + '_' + pageName.replace(/[^a-zA-Z0-9]/g, '_');
        var redirectTimestamp = null;
        var isRedirecting = false;
        
        try {
            var redirectData = sessionStorage.getItem(redirectKey);
            if (redirectData) {
                redirectTimestamp = parseInt(redirectData, 10);
                // Check if redirect happened in the last 2 seconds (should be immediate)
                isRedirecting = (Date.now() - redirectTimestamp) < 2000;
            }
        } catch (e) {
            // sessionStorage might not be available
        }
        
        if (!currentIsTr && !isRedirecting) {
            // First time accessing /en/ or /de/ URL - redirect to Turkish file
            // Save to localStorage FIRST before redirect (so next page load knows the language)
            try {
                localStorage.setItem('preferredLanguage', targetLang);
                sessionStorage.setItem(redirectKey, Date.now().toString());
                sessionStorage.setItem('targetLang', targetLang);
                sessionStorage.setItem('targetUrl', langUrl);
                sessionStorage.setItem('trUrl', trUrl);
            } catch (e) {
                // sessionStorage might not be available, continue anyway
            }
            
            // CRITICAL: Redirect to actual file location IMMEDIATELY
            // Use window.location.href instead of replace to ensure it works
            window.location.href = trUrl;
            return; // Stop execution
        } else if (currentIsTr) {
            // We're on /pages/tr/ path - check if we need to restore language URL
            try {
                var savedTargetLang = sessionStorage.getItem('targetLang');
                var savedTargetUrl = sessionStorage.getItem('targetUrl');
                
                // Also check if URL already shows the target language (to avoid double restore)
                var urlShowsTargetLang = pathname.indexOf('/pages/' + targetLang + '/') !== -1;
                
                if (savedTargetLang && savedTargetUrl && !urlShowsTargetLang && window.history && window.history.replaceState) {
                    // Wait a tiny bit for page to start loading, then restore URL
                    // Use requestAnimationFrame for better timing
                    if (window.requestAnimationFrame) {
                        window.requestAnimationFrame(function() {
                            window.history.replaceState({lang: savedTargetLang}, '', savedTargetUrl);
                            // Clean up after URL is restored
                            setTimeout(function() {
                                try {
                                    sessionStorage.removeItem(redirectKey);
                                    sessionStorage.removeItem('targetLang');
                                    sessionStorage.removeItem('targetUrl');
                                    sessionStorage.removeItem('trUrl');
                                } catch (e) {
                                    // Ignore
                                }
                            }, 100);
                        });
                    } else {
                        setTimeout(function() {
                            window.history.replaceState({lang: savedTargetLang}, '', savedTargetUrl);
                            // Clean up after URL is restored
                            setTimeout(function() {
                                try {
                                    sessionStorage.removeItem(redirectKey);
                                    sessionStorage.removeItem('targetLang');
                                    sessionStorage.removeItem('targetUrl');
                                    sessionStorage.removeItem('trUrl');
                                } catch (e) {
                                    // Ignore
                                }
                            }, 100);
                        }, 50);
                    }
                } else if (urlShowsTargetLang) {
                    // URL already shows target language, just clean up
                    try {
                        sessionStorage.removeItem(redirectKey);
                        sessionStorage.removeItem('targetLang');
                        sessionStorage.removeItem('targetUrl');
                        sessionStorage.removeItem('trUrl');
                    } catch (e) {
                        // Ignore
                    }
                }
            } catch (e) {
                // sessionStorage might not be available
            }
        }
    } else if (langMatch && langMatch[1] === 'tr') {
        // Handle /pages/tr/ URLs - check localStorage for preferred language
        // If user has selected en/de, update URL to show their preference
        try {
            var preferredLang = localStorage.getItem('preferredLanguage');
            if ((preferredLang === 'en' || preferredLang === 'de') && window.history && window.history.replaceState) {
                // Wait a bit for page to load before updating URL
                setTimeout(function() {
                    var pageName = langMatch[2];
                    var basePath = '/';
                    var pagesIndex = pathname.indexOf('/pages/');
                    if (pagesIndex > 0) {
                        basePath = pathname.substring(0, pagesIndex);
                        if (!basePath.endsWith('/')) {
                            basePath += '/';
                        }
                    }
                    var preferredUrl = (basePath === '/' || basePath === '') 
                        ? '/pages/' + preferredLang + '/' + pageName 
                        : basePath.replace(/\/$/, '') + '/pages/' + preferredLang + '/' + pageName;
                    if (window.location.search) {
                        preferredUrl += window.location.search;
                    }
                    window.history.replaceState({lang: preferredLang}, '', preferredUrl);
                }, 100);
            }
        } catch (e) {
            // Ignore
        }
    }
})();

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
    // Fix CSS Background Images
    // ============================================================================
    function fixCSSBackgroundImages() {
        var basePath = window.__BASE_PATH || '/';
        // Build correct image path based on basePath
        var imagePath;
        if (basePath === '/' || basePath === '') {
            imagePath = '/assets/img/Arkaplan.png';
        } else {
            // Remove trailing slash if present
            var cleanBasePath = basePath.replace(/\/$/, '');
            imagePath = cleanBasePath + '/assets/img/Arkaplan.png';
        }
        
        // Create or update style tag for .page-banner background-image
        var styleId = 'dynamic-banner-bg';
        var existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        var style = document.createElement('style');
        style.id = styleId;
        style.textContent = '.page-banner { background-image: url("' + imagePath + '") !important; z-index: 1 !important; background-size: 100% auto !important; } .page-banner::after { z-index: 0 !important; background: transparent !important; } .product-cta { background-image: url("' + imagePath + '") !important; z-index: 1 !important; background-size: 100% auto !important; } .product-cta::after { z-index: 0 !important; background: transparent !important; } .about-hero-section { background-image: url("' + imagePath + '") !important; background-size: cover !important; background-position: center center !important; background-repeat: no-repeat !important; }';
        document.head.appendChild(style);
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
        addScript('/js/error-handler.js'); // Load first to catch all errors
        addScript('/js/image-optimizer.js'); // Load early to optimize images before they load
        addScript('/js/partials.js');
        addScript('/js/translations.js');
        addScript('/js/main.js');
        addScript('/js/whatsapp-fix.js');
        
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
        // Fix CSS background images first
        fixCSSBackgroundImages();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                fixCSSBackgroundImages();
                initScripts();
                // Fix again after DOM is ready
                setTimeout(fixCSSBackgroundImages, 100);
            });
        } else {
            setTimeout(function() {
                fixCSSBackgroundImages();
                initScripts();
                setTimeout(fixCSSBackgroundImages, 100);
            }, 100);
        }
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.__BASE_PATH) {
                fixCSSBackgroundImages();
                initScripts();
                setTimeout(fixCSSBackgroundImages, 100);
            } else {
                // Wait a bit more for basePath to be set
                setTimeout(function() {
                    if (window.__BASE_PATH) {
                        fixCSSBackgroundImages();
                        initScripts();
                        setTimeout(fixCSSBackgroundImages, 100);
                    }
                }, 200);
            }
        });
    }
    
    // Also fix background images when basePath changes
    var originalBasePath = window.__BASE_PATH;
    var checkBasePath = setInterval(function() {
        if (window.__BASE_PATH && window.__BASE_PATH !== originalBasePath) {
            originalBasePath = window.__BASE_PATH;
            fixCSSBackgroundImages();
        }
    }, 100);
    
    // Stop checking after 5 seconds
    setTimeout(function() {
        clearInterval(checkBasePath);
    }, 5000);
    
    // Fix background images immediately if basePath is already set
    if (window.__BASE_PATH) {
        setTimeout(fixCSSBackgroundImages, 50);
    }
})();

