/**
 * Image Optimizer for Mobile
 * Automatically optimizes image loading for better mobile performance
 */
(function() {
    'use strict';
    
    // Check if mobile device
    var isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        var rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Function to check if element is above the fold (first 2 viewports)
    function isAboveTheFold(element) {
        var rect = element.getBoundingClientRect();
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top < viewportHeight * 2 && rect.bottom > 0;
    }
    
    // Optimize images
    function optimizeImages() {
        var images = document.querySelectorAll('img:not([data-optimized])');
        
        images.forEach(function(img) {
            // Skip if already has loading attribute set explicitly
            if (img.hasAttribute('loading') && img.getAttribute('loading') !== 'auto') {
                img.setAttribute('data-optimized', 'true');
                return;
            }
            
            // Skip SVG images
            if (img.src && img.src.includes('.svg')) {
                img.setAttribute('data-optimized', 'true');
                return;
            }
            
            // Skip very small images (likely icons)
            if (img.width && img.width < 50 && img.height && img.height < 50) {
                img.setAttribute('data-optimized', 'true');
                return;
            }
            
            // Check if image is above the fold
            var aboveFold = isAboveTheFold(img);
            
            if (aboveFold) {
                // Above the fold images: eager loading
                img.setAttribute('loading', 'eager');
                img.setAttribute('fetchpriority', 'high');
                
                // Preload critical images
                if (img.src && !img.src.startsWith('data:')) {
                    var link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = img.src;
                    link.setAttribute('fetchpriority', 'high');
                    document.head.appendChild(link);
                }
            } else {
                // Below the fold images: lazy loading (but not too lazy on mobile)
                if (isMobile) {
                    // On mobile, use eager for first few images below fold
                    var belowFoldImages = document.querySelectorAll('img[data-below-fold]');
                    if (belowFoldImages.length < 5) {
                        img.setAttribute('loading', 'eager');
                        img.setAttribute('data-below-fold', 'true');
                    } else {
                        img.setAttribute('loading', 'lazy');
                    }
                } else {
                    img.setAttribute('loading', 'lazy');
                }
            }
            
            img.setAttribute('data-optimized', 'true');
        });
    }
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', optimizeImages);
    } else {
        optimizeImages();
    }
    
    // Re-optimize on scroll (for dynamically loaded content)
    var scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            optimizeImages();
        }, 100);
    });
    
    // Optimize images loaded via Intersection Observer (for better performance)
    if ('IntersectionObserver' in window) {
        var imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    if (!img.hasAttribute('data-optimized')) {
                        if (entry.intersectionRatio > 0.1) {
                            img.setAttribute('loading', 'eager');
                            img.setAttribute('fetchpriority', 'high');
                        } else {
                            img.setAttribute('loading', 'lazy');
                        }
                        img.setAttribute('data-optimized', 'true');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        // Observe all images
        document.addEventListener('DOMContentLoaded', function() {
            var allImages = document.querySelectorAll('img:not([data-optimized])');
            allImages.forEach(function(img) {
                imageObserver.observe(img);
            });
        });
    }
})();

