// Index Page Specific JavaScript
(function() {
    'use strict';
    
    // ======================================================================
    // Top Video Playlist (Google Drive videos)
    // ======================================================================
    function initTopVideoPlaylist() {
        const videoElement = document.querySelector('.top-video');
        if (!videoElement) {
            return;
        }

        /**
         * ÖNEMLİ NOT:
         * Google Drive linkleri (https://drive.google.com/file/d/ID/view) doğrudan <video> etiketi ile
         * güvenilir şekilde oynatılamaz, çoğu zaman giriş (Sign in) ister ve CORS / content-type
         * sorunları yüzünden tarayıcı videoyu yükleyemez. Bu yüzden ana sayfa boş görünür.
         *
         * ÇÖZÜM:
         * 1) Her bir videoyu Google Drive'dan indirip
         * 2) `public_html/assets/video/` klasörüne aşağıdaki isimlerle kaydedin:
         *    video1.mp4, video2.mp4, ..., video21.mp4
         * 3) Aşağıdaki `videoUrls` dizisi bu yerel dosyaları sırayla oynatacaktır.
         */

        const videoUrls = [
            // Şu anda projede var olan tek video dosyası
            '/assets/video/video.mp4'
            // Daha sonra isterseniz buraya video2.mp4, video3.mp4 ... şeklinde
            // ek videolar koyabiliriz.
        ];

        let currentIndex = 0;

        function playVideo(index) {
            const url = videoUrls[index];
            if (!url) return;

            // Set src directly on video element
            videoElement.src = url;

            // Load and play
            try {
                videoElement.load();
            } catch (e) {
                // ignore
            }

            const playPromise = videoElement.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function() {
                    // Autoplay might be blocked; we ignore the error
                });
            }
        }

        // When a video ends, move to the next one
        videoElement.addEventListener('ended', function() {
            currentIndex = (currentIndex + 1) % videoUrls.length;
            playVideo(currentIndex);
        });

        // Start with the first video
        playVideo(currentIndex);
    }
    
    // Counter animation for percentages (used in sustainability section)
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current) + '%';
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + '%';
            }
        };
        
        updateCounter();
    }
    
    // Counter animation for stat numbers (used in stats section)
    function animateStatCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const prefix = element.getAttribute('data-prefix') || '';
        const suffix = element.getAttribute('data-suffix') || '';
        const duration = 2000; // 2 seconds
        const steps = 60; // 60 steps for smooth animation
        const increment = target / steps;
        let current = 0;
        let step = 0;
        
        const updateCounter = () => {
            current += increment;
            step++;
            if (step < steps) {
                element.textContent = prefix + Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = prefix + target + suffix;
            }
        };
        
        updateCounter();
    }
    
    // Counter animation for numbers section
    function animateNumberCounter(element) {
        // Skip if already counted
        if (element.classList.contains('counted') && element.hasAttribute('data-animated')) {
            return;
        }
        
        // Prevent translation system from interfering with this element
        element.setAttribute('data-animated', 'true');
        
        const target = parseFloat(element.getAttribute('data-target'));
        const prefix = element.getAttribute('data-prefix') || '';
        const suffix = element.getAttribute('data-suffix') || '';
        const duration = 2500; // 2.5 seconds
        const startTime = Date.now();
        
        // Helper function to format the value correctly
        const formatValue = (value, prefix, suffix) => {
            let numValue = parseFloat(value);
            
            if (isNaN(numValue)) {
                numValue = 0;
            }
            
            if (suffix === '+') {
                return prefix + Math.floor(numValue) + suffix;
            } else if (prefix === '% ') {
                return prefix + Math.floor(numValue) + suffix;
            } else if (suffix === 'kg') {
                return prefix + Math.round(numValue) + suffix;
            } else if (suffix && suffix.includes('renk')) {
                return prefix + Math.round(numValue) + suffix;
            } else {
                // For year (2015) or other numbers without suffix
                return prefix + Math.floor(numValue) + suffix;
            }
        };
        
        // Calculate final value ONCE
        const finalValue = formatValue(target, prefix, suffix);
        
        // Store final value to prevent override
        element.setAttribute('data-final-value', finalValue);
        
        let animationFrameId = null;
        let isComplete = false;
        
        const updateCounter = () => {
            if (isComplete) {
                return;
            }
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (progress < 1) {
                // Easing function for smooth animation (ease-out cubic)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = target * easeOut;
                
                // Display current value during animation
                element.textContent = formatValue(current, prefix, suffix);
                animationFrameId = requestAnimationFrame(updateCounter);
            } else {
                // Animation complete - ALWAYS set exact target value
                isComplete = true;
                element.textContent = finalValue;
                
                // Force set again after a small delay to ensure it sticks
                setTimeout(() => {
                    element.textContent = finalValue;
                }, 50);
                
                // Also set after 100ms and 200ms to prevent any override
                setTimeout(() => {
                    element.textContent = finalValue;
                }, 100);
                
                setTimeout(() => {
                    element.textContent = finalValue;
                }, 200);
            }
        };
        
        updateCounter();
    }
    
    // Initialize counter animations when visible
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    animateCounter(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    // Initialize stat counter animations when visible
    function initStatCounters() {
        const statCounters = document.querySelectorAll('.stat-counter');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    animateStatCounter(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        statCounters.forEach(counter => observer.observe(counter));
    }
    
    // Initialize number counter animations for numbers section
    function initNumberCounters() {
        const numberCounters = document.querySelectorAll('.number-counter');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    animateNumberCounter(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        numberCounters.forEach(counter => observer.observe(counter));
    }
    
    // ======================================================================
    // News Carousel - Auto-rotating news items (Single instance)
    // ======================================================================
    let newsCarouselInitialized = false;
    let newsCarouselInterval = null;
    
    function initNewsCarousel() {
        // Prevent multiple initializations
        if (newsCarouselInitialized) {
            return;
        }
        
        const carousel = document.getElementById('news-carousel');
        if (!carousel) {
            return;
        }
        
        const newsItems = carousel.querySelectorAll('.news-item');
        const dotsContainer = document.querySelector('.news-dots');
        
        if (newsItems.length === 0 || !dotsContainer) {
            return;
        }
        
        // Stop any existing interval
        if (newsCarouselInterval) {
            clearInterval(newsCarouselInterval);
            newsCarouselInterval = null;
        }
        
        // Clear all existing dots and remove all active classes
        dotsContainer.innerHTML = '';
        newsItems.forEach(item => item.classList.remove('active'));
        
        // Remove old event listeners by cloning carousel
        const newCarousel = carousel.cloneNode(true);
        carousel.parentNode.replaceChild(newCarousel, carousel);
        const freshCarousel = document.getElementById('news-carousel');
        const freshNewsItems = freshCarousel.querySelectorAll('.news-item');
        
        let currentIndex = 0;
        const AUTO_ROTATE_DELAY = 5000; // 5 seconds
        
        // Create dots - only as many as news items exist
        freshNewsItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'news-dot';
            if (index === 0) {
                dot.classList.add('active');
            }
            dot.setAttribute('aria-label', `Haber ${index + 1}`);
            dot.addEventListener('click', function() {
                goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });
        
        // Set initial state - only first item active
        if (freshNewsItems[0]) {
            freshNewsItems[0].classList.add('active');
        }
        
        // Get fresh dots after creating them
        const dots = dotsContainer.querySelectorAll('.news-dot');
        
        function showSlide(index) {
            // Remove active from ALL items and dots first
            freshNewsItems.forEach(item => {
                item.classList.remove('active');
            });
            dots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            // Add active only to current index
            if (freshNewsItems[index] && dots[index]) {
                freshNewsItems[index].classList.add('active');
                dots[index].classList.add('active');
            }
            
            currentIndex = index;
        }
        
        function nextSlide() {
            const nextIndex = (currentIndex + 1) % freshNewsItems.length;
            showSlide(nextIndex);
        }
        
        function goToSlide(index) {
            if (index >= 0 && index < freshNewsItems.length) {
                showSlide(index);
                resetAutoRotate();
            }
        }
        
        function startAutoRotate() {
            newsCarouselInterval = setInterval(nextSlide, AUTO_ROTATE_DELAY);
        }
        
        function stopAutoRotate() {
            if (newsCarouselInterval) {
                clearInterval(newsCarouselInterval);
                newsCarouselInterval = null;
            }
        }
        
        function resetAutoRotate() {
            stopAutoRotate();
            startAutoRotate();
        }
        
        // Pause on hover
        freshCarousel.addEventListener('mouseenter', stopAutoRotate);
        freshCarousel.addEventListener('mouseleave', startAutoRotate);
        
        // Mark as initialized
        newsCarouselInitialized = true;
        
        // Start auto-rotate
        startAutoRotate();
    }
    
    // ======================================================================
    // Contact Form Handler
    // ======================================================================
    function initContactForm() {
        const form = document.getElementById('home-contact-form');
        if (!form) {
            return;
        }
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Gönderiliyor...';
            
            // Simple captcha validation
            const captchaInput = document.getElementById('home-captcha');
            if (captchaInput && parseInt(captchaInput.value) !== 7) {
                alert('Lütfen işlem sonucunu doğru girin (4 + 3 = 7)');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
            
            const formData = new FormData(form);
            
            try {
                const response = await fetch('/contact.php', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                // Check if response is OK
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                
                // Get response text first to check if it's valid JSON
                const responseText = await response.text();
                console.log('Response text:', responseText);
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.error('Response was:', responseText);
                    throw new Error('Geçersiz yanıt alındı. Sunucu hatası olabilir.');
                }
                
                if (result.ok) {
                    alert('Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.');
                    form.reset();
                } else {
                    alert(result.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Bir hata oluştu: ' + (error.message || 'Lütfen tekrar deneyin.'));
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Video HTML içinde zaten kaynak tanımlı; sadece sayacı çalıştırıyoruz
            initCounters();
            initStatCounters();
            initNumberCounters();
            initNewsCarousel();
            initContactForm();
        });
    } else {
        initCounters();
        initStatCounters();
        initNumberCounters();
        initNewsCarousel();
        initContactForm();
    }
    
    // Re-initialize after partials are loaded
    document.addEventListener('partialsLoaded', function() {
        setTimeout(initCounters, 200);
        setTimeout(initStatCounters, 200);
        setTimeout(initNumberCounters, 200);
        setTimeout(initNewsCarousel, 200);
        setTimeout(initContactForm, 200);
    });
})();

