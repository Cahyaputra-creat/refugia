document.addEventListener("DOMContentLoaded", () => {
    
    /* =========================================
       1. SYNC DATA PERSISTENCE GLOBAL (RefugiaDB)
    ========================================= */
    function syncGlobalPublicData() {
        if (typeof RefugiaDB === 'undefined') return;
        const settings = RefugiaDB.getSettings();

        if (settings) {
            // Jam Operasional
            const ftJamEls = document.querySelectorAll('.ft-jam, .jam-info span');
            ftJamEls.forEach(el => {
                if (settings.jamBuka) el.textContent = settings.jamBuka;
            });

            // Nomor HP Admin
            const ftPhoneEls = document.querySelectorAll('.ft-phone');
            ftPhoneEls.forEach(el => {
                if (settings.phoneAdmin) el.textContent = settings.phoneAdmin;
            });

            // Tagline Footer
            const ftTaglineEls = document.querySelectorAll('.ft-tagline');
            ftTaglineEls.forEach(el => {
                if (settings.tagline) el.textContent = settings.tagline;
            });
        }
    }

    syncGlobalPublicData();
    window.addEventListener('storage', syncGlobalPublicData);
    window.addEventListener('refugia_db_updated', syncGlobalPublicData);

    /* =========================================
       2. LOGIKA HAMBURGER MENU
    ========================================= */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    /* =========================================
       3. LOGIKA VIDEO MODAL POP-UP
    ========================================= */
    const modal = document.getElementById('videoModal');
    const popupVideo = document.getElementById('popupVideo');
    const closeBtn = document.querySelector('.close-btn');
    const videoCards = document.querySelectorAll('.instagram-card, .video-card');

    function openModal(videoSrc) {
        if (!modal || !popupVideo) return;

        popupVideo.src = videoSrc;
        popupVideo.load();
        
        modal.style.display = 'flex';
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        document.body.style.overflow = 'hidden';

        popupVideo.play().catch(error => {
            console.warn("Autoplay diblokir oleh browser, menunggu interaksi pengguna.", error);
        });
    }

    function closeModal() {
        if (!modal || !popupVideo) return;

        modal.classList.remove('show');
        popupVideo.pause();
        
        document.body.style.overflow = '';

        setTimeout(() => {
            popupVideo.src = "";
            modal.style.display = 'none';
        }, 300);
    }

    videoCards.forEach(card => {
        card.addEventListener('click', function() {
            const videoSrc = this.getAttribute('data-video'); 
            if (videoSrc) {
                openModal(videoSrc);
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeModal();
        }
    });
});
