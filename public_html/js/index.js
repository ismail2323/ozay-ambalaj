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
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = prefix + Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = prefix + target + suffix;
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
    
    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Video HTML içinde zaten kaynak tanımlı; sadece sayacı çalıştırıyoruz
            initCounters();
            initStatCounters();
        });
    } else {
        initCounters();
        initStatCounters();
    }
    
    // Re-initialize after partials are loaded
    document.addEventListener('partialsLoaded', function() {
        setTimeout(initCounters, 200);
        setTimeout(initStatCounters, 200);
    });
})();

