document.addEventListener('DOMContentLoaded', function() {
    // ===== UTAMA FACILITY SLIDER =====
    const TOTAL = 10;
    let cur = 0;
    const track = document.getElementById('fSlider');
    const dotsWrap = document.getElementById('sDots');

    if(track && dotsWrap) {
      for(let i=0; i<TOTAL; i++){
        const d = document.createElement('div');
        d.className = 'sdot' + (i===0 ? ' on' : '');
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }

    function goTo(n){
      if(!track) return;
      cur = n;
      track.style.transform = `translateX(-${cur*100}%)`;
      document.querySelectorAll('.sdot').forEach((d,i) => d.classList.toggle('on', i===cur));
    }
    
    function sMove(dir){
      let n = cur + dir;
      if(n < 0) n = TOTAL - 1;
      if(n >= TOTAL) n = 0;
      goTo(n);
    }

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.addEventListener('click', () => sMove(-1));
    if (btnNext) btnNext.addEventListener('click', () => sMove(1));

    // ===== POP-UP MODAL & CAROUSEL SLIDER KATALOG (PANAH TOMBOL ❮ ❯ UNTUK LAPTOP & HP) =====
    const defaultData = {
      souvenir: {
        icon:'🛍️', title:'Pusat Oleh-Oleh', sub:'Lapak Souvenir & Kerajinan',
        desc:'Menyediakan berbagai macam souvenir eksklusif, kerajinan tangan lokal, kaos, topi, dan pernak-pernik khas Magetan.',
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
        items: [
          {i:'🍲', t:'Mie Rebus Lawu', p:'Rp 15.000'},
          {i:'☕', t:'Kopi & Wedang', p:'Rp 8.000'},
          {i:'🍗', t:'Ayam Geprek', p:'Rp 20.000'},
          {i:'🍢', t:'Camilan Hangat', p:'Rp 10.000'}
        ],
        images: [
          'assets/img/MenuMakanan_BERGAMBAR.jpeg',
          'assets/img/MenuMakanan_Teks.jpeg',
          'assets/img/MenuMinuman_gambar.jpeg',
          'assets/img/MenuMinuman_teks.jpeg'
        ]
      }
    };

    const overlay = document.getElementById('mOverlay');
    const mIcon = document.getElementById('mIcon');
    const mTitle = document.getElementById('mTitle');
    const mSub = document.getElementById('mSub');
    const mDesc = document.getElementById('mDesc');
    const mItems = document.getElementById('mItems');
    const mediaContainer = document.getElementById('mMediaContainer');

    function openM(id){
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
                items: found.items || (d ? d.items : []),
                images: (found.images && found.images.length > 0) ? found.images : (d ? d.images : [])
            };
        }
      }

      if(!d) return;

      mediaContainer.innerHTML = '';
      mIcon.textContent = d.icon || '🌺';
      mTitle.textContent = d.title;
      mSub.textContent = d.sub;
      mDesc.textContent = d.desc;
      
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

      // CAROUSEL KATALOG GAMBAR DENGAN TOMBOL PANAH ❮ ❯ LAPTOP & TOUCH HP
      if(d.images && d.images.length > 1) {
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
          if (outer) {
            outer.scrollTo({ left: curModalSlide * outer.clientWidth, behavior: 'smooth' });
          }
          if (badge) badge.textContent = `${curModalSlide + 1} / ${totalModalSlides}`;
          dots.forEach((dot, idx) => dot.classList.toggle('active', idx === curModalSlide));
        }

        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prev = (curModalSlide - 1 + totalModalSlides) % totalModalSlides;
            updateSlideUI(prev);
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const next = (curModalSlide + 1) % totalModalSlides;
            updateSlideUI(next);
          });
        }

        dots.forEach(dot => {
          dot.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'), 10);
            updateSlideUI(idx);
          });
        });

        if (outer) {
          outer.addEventListener('scroll', () => {
            const scrollLeft = outer.scrollLeft;
            const width = outer.clientWidth || 1;
            const activeIndex = Math.round(scrollLeft / width);
            if (curModalSlide !== activeIndex) {
              curModalSlide = activeIndex;
              if (badge) badge.textContent = `${curModalSlide + 1} / ${totalModalSlides}`;
              dots.forEach((dot, idx) => dot.classList.toggle('active', idx === curModalSlide));
            }
          });
        }

      } else if(d.images && d.images.length === 1) {
        mediaContainer.innerHTML = `<img src="${d.images[0]}" class="m-single-img" alt="${d.title}" style="width:100%; max-height:420px; object-fit:contain; border-radius:14px; margin-bottom:15px;">`;
      }

      overlay.classList.add('open');
    }
    
    function closeM(){
      overlay.classList.remove('open');
    }

    document.querySelectorAll('.lapak-card').forEach(card => {
        card.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            openM(targetId);
        });
    });

    document.querySelectorAll('.modal-close').forEach(elem => {
        elem.addEventListener('click', function(e) {
            if(e.target === this) {
                closeM();
            }
        });
    });
});