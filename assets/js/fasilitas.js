/* =========================================
   REFUGIA FASILITAS & KATALOG MODULE
   ========================================= */

const RefugiaFasilitas = (() => {
    const TOTAL = 10;
    let cur = 0;

    const defaultData = {
      souvenir: {
        icon:'🛍️', title:'Pusat Oleh-Oleh', sub:'Lapak Souvenir & Kerajinan',
        desc:'Menyediakan berbagai macam souvenir eksklusif, kerajinan tangan lokal, kaos, topi, dan pernak-pernik khas Magetan.',
        waText: 'Halo Admin Refugia, saya ingin menanyakan tentang produk Lapak Souvenir & Kerajinan.',
        items: [
          {i:'👕', t:'Kaos Refugia', p:'Mulai Rp 50.000'},
          {i:'👜', t:'Tas Rajut', p:'Mulai Rp 35.000'},
          {i:'🍯', t:'Camilan Khas', p:'Mulai Rp 15.000'},
          {i:'🌸', t:'Bibit Bunga', p:'Mulai Rp 10.000'}
        ],
        images: [
          'assets/img/lapak souvenir 1.png', 
          'assets/img/lapak souvenir 2.png', 
          'assets/img/Souvenir.jpeg'
        ]
      },
      sayur: {
        icon:'🥬', title:'Lapak Sayur & Bunga', sub:'Hasil Tani Sehat',
        desc:'Beli sayuran segar organik yang dipanen langsung dari kebun Refugia dan bibit bunga tanaman hias.',
        waText: 'Halo Admin Refugia, saya ingin menanyakan tentang ketersediaan sayur dan bunga di Lapak Sayur & Bunga.',
        items: [
          {i:'🥕', t:'Sayur Segar', p:'Paket Rp 10.000'},
          {i:'🍓', t:'Buah Segar', p:'Sesuai Musim'},
          {i:'🍂', t:'Benih Tanaman', p:'Tanyakan Stok'}
        ],
        images: [
          'assets/img/JenisBunga.jpeg'
        ]
      },
      makan: {
        icon:'🍜', title:'Pujasera & Kuliner', sub:'Area Makan Nyaman',
        desc:'Nikmati berbagai hidangan lezat dan minuman hangat setelah lelah berkeliling taman bunga yang asri.',
        waText: 'Halo Admin Refugia, saya ingin menanyakan tentang menu dan ketersediaan di Lapak Makanan & Pujasera.',
        items: [
          {i:'🍲', t:'Mie Rebus Lawu', p:'Rp 10.000'},
          {i:'☕', t:'Kopi & Wedang', p:'Rp 5.000'},
          {i:'🍗', t:'Ayam Geprek', p:'Rp 13.000'}
        ],
        images: [
          'assets/img/MenuMakanan_BERGAMBAR.jpeg',
          'assets/img/MenuMakanan_Teks.jpeg',
          'assets/img/MenuMinuman_gambar.jpeg',
          'assets/img/MenuMinuman_teks.jpeg'
        ]
      }
    };

    function initSlider() {
        const track = document.getElementById('fSlider');
        const dotsWrap = document.getElementById('sDots');
        if (!track || !dotsWrap) return;

        dotsWrap.innerHTML = '';
        for (let i = 0; i < TOTAL; i++) {
            const d = document.createElement('div');
            d.className = 'sdot' + (i === 0 ? ' on' : '');
            d.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(d);
        }

        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        if (btnPrev) btnPrev.onclick = () => sMove(-1);
        if (btnNext) btnNext.onclick = () => sMove(1);
    }

    function goTo(n) {
        const track = document.getElementById('fSlider');
        if (!track) return;
        cur = n;
        track.style.transform = `translateX(-${cur * 100}%)`;
        document.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('on', i === cur));
    }

    function sMove(dir) {
        let n = cur + dir;
        if (n < 0) n = TOTAL - 1;
        if (n >= TOTAL) n = 0;
        goTo(n);
    }

    function openM(id) {
        const overlay = document.getElementById('mOverlay');
        const mIcon = document.getElementById('mIcon');
        const mTitle = document.getElementById('mTitle');
        const mSub = document.getElementById('mSub');
        const mDesc = document.getElementById('mDesc');
        const mItems = document.getElementById('mItems');
        const mediaContainer = document.getElementById('mMediaContainer');
        const waBtn = document.getElementById('mWaBtn') || (overlay ? overlay.querySelector('.btn-wa') : null);

        if (!overlay) return;

        let d = defaultData[id];
        if (typeof RefugiaDB !== 'undefined') {
            const dbFacs = RefugiaDB.getFacilities();
            const found = dbFacs.find(f => f.id === id || f.name.toLowerCase().includes(id.toLowerCase()));
            if (found) {
                d = {
                    icon: found.category.includes('Belanja') ? '🛍️' : (found.category.includes('Kuliner') ? '🍜' : '🌺'),
                    title: found.name,
                    sub: found.category,
                    desc: found.desc,
                    waText: d ? d.waText : `Halo Admin Refugia, saya ingin bertanya tentang ${found.name}.`,
                    items: found.items || (d ? d.items : []),
                    images: (found.images && found.images.length > 0) ? found.images : (d ? d.images : [])
                };
            }
        }

        if (!d) return;

        mediaContainer.innerHTML = '';
        if (mIcon) mIcon.textContent = d.icon || '🌺';
        if (mTitle) mTitle.textContent = d.title;
        if (mSub) mSub.textContent = d.sub;
        if (mDesc) mDesc.textContent = d.desc;

        if (mItems) {
            mItems.innerHTML = '';
            if (d.items && d.items.length > 0) {
                d.items.forEach(it => {
                    mItems.innerHTML += `
                        <div class="mitem">
                            <div class="mitem-ico">${it.i || '✨'}</div>
                            <h4>${it.t}</h4>
                            <p>${it.p || ''}</p>
                        </div>
                    `;
                });
            }
        }

        // Configure WhatsApp link for "Hubungi Admin Penjualan"
        if (waBtn) {
            let phone = '6285931486608';
            if (typeof RefugiaDB !== 'undefined') {
                const settings = RefugiaDB.getSettings();
                if (settings && settings.phoneAdmin) {
                    let cleaned = settings.phoneAdmin.replace(/[^0-9]/g, '');
                    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
                    if (cleaned) phone = cleaned;
                }
            }
            const text = d.waText || `Halo Admin Refugia, saya ingin bertanya tentang ${d.title}.`;
            const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;

            if (waBtn.tagName === 'A') {
                waBtn.href = waUrl;
                waBtn.target = '_blank';
            }
            waBtn.onclick = function(e) {
                if (waBtn.tagName !== 'A') e.preventDefault();
                window.open(waUrl, '_blank');
            };
        }

        if (d.images && d.images.length > 1) {
            let curModalSlide = 0;
            const totalModalSlides = d.images.length;

            const slidesHtml = d.images.map((imgSrc, idx) => `
                <div class="m-slide-item" style="flex:0 0 100%; width:100%; scroll-snap-align:center; position:relative;">
                    <img src="${imgSrc}" class="m-slide-img" alt="${d.title} Gambar ${idx + 1}" style="width:100%; max-height:420px; object-fit:contain; border-radius:12px; user-select:none; -webkit-user-drag:none;">
                </div>
            `).join('');

            const dotsHtml = d.images.map((_, idx) => `
                <span class="m-dot ${idx === 0 ? 'active' : ''}" data-idx="${idx}"></span>
            `).join('');

            mediaContainer.innerHTML = `
                <div class="m-slider-wrapper" style="position:relative; width:100%; border-radius:16px; overflow:hidden; background:#f5f8f3; border:1px solid #e1e9e0; margin-bottom:15px;">
                    <button class="m-arrow m-arrow-prev" id="mPrevBtn" title="Gambar Sebelumnya" aria-label="Gambar Sebelumnya">❮</button>
                    <button class="m-arrow m-arrow-next" id="mNextBtn" title="Gambar Selanjutnya" aria-label="Gambar Selanjutnya">❯</button>
                    <div class="m-slide-badge" id="mSlideBadge">1 / ${totalModalSlides}</div>
                    
                    <div class="m-slider-outer" id="mOuterScroll" style="width:100%; overflow-x:auto; scroll-snap-type:x mandatory; scrollbar-width:none; -ms-overflow-style:none; display:flex; scroll-behavior:smooth;">
                        ${slidesHtml}
                    </div>
                    
                    <div class="m-slider-dots" style="display:flex; justify-content:center; gap:8px; padding:10px 0; background:#ffffff; border-top:1px solid #edf2ed;">
                        ${dotsHtml}
                    </div>
                </div>
            `;

            const outer = document.getElementById('mOuterScroll');
            const prevBtn = document.getElementById('mPrevBtn');
            const nextBtn = document.getElementById('mNextBtn');
            const badge = document.getElementById('mSlideBadge');
            const dots = mediaContainer.querySelectorAll('.m-dot');

            function updateSlideUI(index) {
                curModalSlide = index;
                if (outer) outer.scrollTo({ left: curModalSlide * outer.clientWidth, behavior: 'smooth' });
                if (badge) badge.textContent = `${curModalSlide + 1} / ${totalModalSlides}`;
                dots.forEach((dot, idx) => dot.classList.toggle('active', idx === curModalSlide));
            }

            if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); updateSlideUI((curModalSlide - 1 + totalModalSlides) % totalModalSlides); };
            if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); updateSlideUI((curModalSlide + 1) % totalModalSlides); };

            dots.forEach(dot => {
                dot.onclick = function() {
                    const idx = parseInt(this.getAttribute('data-idx'), 10);
                    updateSlideUI(idx);
                };
            });
        } else if (d.images && d.images.length === 1) {
            mediaContainer.innerHTML = `<img src="${d.images[0]}" class="m-single-img" alt="${d.title}" style="width:100%; max-height:420px; object-fit:contain; border-radius:14px; margin-bottom:15px;">`;
        }

        overlay.classList.add('open');
    }

    function closeM() {
        const overlay = document.getElementById('mOverlay');
        if (overlay) overlay.classList.remove('open');
    }

    // Document-level event delegation for dynamically loaded DOM
    document.addEventListener('click', function(e) {
        const waBtn = e.target.closest('.btn-wa, #mWaBtn');
        if (waBtn && document.getElementById('mOverlay') && document.getElementById('mOverlay').classList.contains('open')) {
            const mTitle = document.getElementById('mTitle');
            const titleText = mTitle ? mTitle.textContent : 'Lapak';
            
            let phone = '6285931486608';
            if (typeof RefugiaDB !== 'undefined') {
                const settings = RefugiaDB.getSettings();
                if (settings && settings.phoneAdmin) {
                    let cleaned = settings.phoneAdmin.replace(/[^0-9]/g, '');
                    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
                    if (cleaned) phone = cleaned;
                }
            }
            
            const text = `Halo Admin Refugia, saya ingin menanyakan tentang ${titleText}.`;
            const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            return;
        }

        const card = e.target.closest('.lapak-card');
        if (card) {
            const targetId = card.getAttribute('data-target');
            if (targetId) openM(targetId);
            return;
        }

        const closeBtn = e.target.closest('.modal-close, #mOverlay');
        if (closeBtn && (e.target === closeBtn || closeBtn.classList.contains('mclose') || closeBtn.classList.contains('btn-back'))) {
            closeM();
        }
    });

    return {
        initSlider,
        openM,
        closeM
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    RefugiaFasilitas.initSlider();
    const prevReinit = window.reinitPublicPage;
    window.reinitPublicPage = function() {
        if (typeof prevReinit === 'function') prevReinit();
        RefugiaFasilitas.initSlider();
    };
});