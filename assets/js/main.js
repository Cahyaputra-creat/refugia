document.addEventListener("DOMContentLoaded", () => {
    
    /* =========================================
       1. SYNC DATA PERSISTENCE GLOBAL (RefugiaDB)
    ========================================= */
    function syncGlobalPublicData() {
        if (typeof RefugiaDB === 'undefined') return;
        const settings = RefugiaDB.getSettings();

        if (settings) {
            const ftJamEls = document.querySelectorAll('.ft-jam, .jam-info span');
            ftJamEls.forEach(el => {
                if (settings.jamBuka) el.textContent = settings.jamBuka;
            });

            const ftPhoneEls = document.querySelectorAll('.ft-phone');
            ftPhoneEls.forEach(el => {
                if (settings.phoneAdmin) el.textContent = settings.phoneAdmin;
            });

            const ftTaglineEls = document.querySelectorAll('.ft-tagline');
            ftTaglineEls.forEach(el => {
                if (settings.tagline) el.textContent = settings.tagline;
            });
        }
    }

    window.reinitPublicPage = function() {
        syncGlobalPublicData();
        renderPublicHero();
        renderPublicVideos();
    };

    window.renderPublicHero = renderPublicHero;

    // Initial Sync & Real-Time DB Event Listeners
    window.reinitPublicPage();
    window.addEventListener('storage', window.reinitPublicPage);
    window.addEventListener('refugia_db_updated', window.reinitPublicPage);

    /* =========================================
       1B. RENDER HERO & VIDEO GALLERY DINAMIS
    ========================================= */
    function renderPublicHero() {
        if (typeof RefugiaDB === 'undefined') return;
        const hero = RefugiaDB.getHeroSettings();
        if (!hero) return;

        const heroBgImg = document.getElementById('heroBgImg');
        const heroBadge = document.getElementById('heroBadge');
        const heroTitle = document.getElementById('heroTitle');
        const heroTagline = document.getElementById('heroTagline');
        const stat1Val = document.getElementById('stat1Val');
        const stat1Label = document.getElementById('stat1Label');
        const stat2Val = document.getElementById('stat2Val');
        const stat2Label = document.getElementById('stat2Label');
        const stat3Val = document.getElementById('stat3Val');
        const stat3Label = document.getElementById('stat3Label');
        const tentangTitle = document.getElementById('tentangTitle');
        const tentangDesc1 = document.getElementById('tentangDesc1');
        const tentangDesc2 = document.getElementById('tentangDesc2');
        const tentangTag1 = document.getElementById('tentangTag1');
        const tentangTag2 = document.getElementById('tentangTag2');
        const tentangTag3 = document.getElementById('tentangTag3');
        const galeriTitle = document.getElementById('galeriTitle');

        if (heroBgImg && hero.heroBgImg) heroBgImg.src = hero.heroBgImg;
        if (heroBadge && hero.heroBadge) heroBadge.textContent = hero.heroBadge;
        if (heroTitle) {
            const title1 = hero.heroTitle1 || 'Kebun Refugia';
            const title2 = hero.heroTitle2 || 'Magetan';
            heroTitle.innerHTML = `${title1} <br><em>${title2}</em>`;
        }
        if (heroTagline && hero.heroTagline) heroTagline.textContent = hero.heroTagline;
        if (stat1Val && hero.stat1Val) stat1Val.textContent = hero.stat1Val;
        if (stat1Label && hero.stat1Label) stat1Label.textContent = hero.stat1Label;
        if (stat2Val && hero.stat2Val) stat2Val.textContent = hero.stat2Val;
        if (stat2Label && hero.stat2Label) stat2Label.textContent = hero.stat2Label;
        if (stat3Val && hero.stat3Val) stat3Val.textContent = hero.stat3Val;
        if (stat3Label && hero.stat3Label) stat3Label.textContent = hero.stat3Label;
        if (tentangTitle && hero.tentangTitle) tentangTitle.textContent = hero.tentangTitle;
        if (tentangDesc1 && hero.tentangDesc1) tentangDesc1.textContent = hero.tentangDesc1;
        if (tentangDesc2 && hero.tentangDesc2) tentangDesc2.textContent = hero.tentangDesc2;
        if (tentangImg && hero.tentangImg) tentangImg.src = hero.tentangImg;
        if (tentangTag1 && hero.tentangTag1) tentangTag1.textContent = hero.tentangTag1;
        if (tentangTag2 && hero.tentangTag2) tentangTag2.textContent = hero.tentangTag2;
        if (tentangTag3 && hero.tentangTag3) tentangTag3.textContent = hero.tentangTag3;
        if (galeriTitle && hero.galeriTitle) galeriTitle.textContent = hero.galeriTitle;
    }

    function renderPublicVideos() {
        const container = document.getElementById('videoGalleryContainer');
        if (!container || typeof RefugiaDB === 'undefined') return;

        const videos = RefugiaDB.getVideos();
        container.innerHTML = '';

        if (!videos || videos.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666; grid-column:span 3;">Belum ada video galeri yang ditambahkan.</p>';
            return;
        }

        videos.forEach(v => {
            const card = document.createElement('div');
            card.className = 'instagram-card video-card';
            card.setAttribute('data-video', v.videoUrl);

            card.innerHTML = `
              <div class="ig-card-thumbnail">
                <img src="${v.thumbUrl}" alt="${v.title}">
                <div class="ig-card-overlay">
                  <div class="ig-play-btn">
                    <span class="ig-play-icon">▶</span>
                  </div>
                </div>
              </div>
              <div class="ig-card-text">${v.title}</div>
            `;

            card.addEventListener('click', function() {
                openModal(v.videoUrl);
            });

            container.appendChild(card);
        });
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
