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
    
    // Initialize all functions
    function init() {
        initStickyHeader();
        initContactFormPrefill();
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
    });
    
    // Fallback: try to initialize navigation after a delay
    setTimeout(function() {
        initNavigationAfterPartials();
    }, 500);
})();

