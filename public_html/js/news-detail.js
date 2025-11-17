// News Detail Page Specific JavaScript
(function() {
    'use strict';
    
    // Lightbox functionality for news gallery
    function initLightbox() {
        const galleryItems = document.querySelectorAll('.news-gallery-item');
        if (galleryItems.length === 0) return;
        
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close" aria-label="Kapat">&times;</button>
            <button class="lightbox-prev" aria-label="Önceki">‹</button>
            <button class="lightbox-next" aria-label="Sonraki">›</button>
            <div class="lightbox-content">
                <img class="lightbox-image" src="" alt="">
            </div>
        `;
        document.body.appendChild(lightbox);
        
        const lightboxImage = lightbox.querySelector('.lightbox-image');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        let currentIndex = 0;
        const images = Array.from(galleryItems).map(item => ({
            src: item.querySelector('img').src,
            alt: item.querySelector('img').alt
        }));
        
        function openLightbox(index) {
            currentIndex = index;
            lightboxImage.src = images[index].src;
            lightboxImage.alt = images[index].alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        function showNext() {
            currentIndex = (currentIndex + 1) % images.length;
            openLightbox(currentIndex);
        }
        
        function showPrev() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            openLightbox(currentIndex);
        }
        
        // Open lightbox on gallery item click
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(index));
        });
        
        // Close lightbox
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Navigation
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNext();
        });
        
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrev();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                showNext();
            } else if (e.key === 'ArrowLeft') {
                showPrev();
            }
        });
        
        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    showNext();
                } else {
                    showPrev();
                }
            }
        }
    }
    
    // Initialize animations
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
    
    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initLightbox();
            initAnimations();
        });
    } else {
        initLightbox();
        initAnimations();
    }
    
    // Re-initialize after partials are loaded
    document.addEventListener('partialsLoaded', function() {
        setTimeout(function() {
            initLightbox();
        }, 200);
    });
})();

