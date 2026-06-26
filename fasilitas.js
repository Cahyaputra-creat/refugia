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
        
        // Pemasangan Event Listener untuk dots
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

    // Pemasangan Event Listener untuk tombol Prev/Next Slider
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.addEventListener('click', () => sMove(-1));
    if (btnNext) btnNext.addEventListener('click', () => sMove(1));

    // ===== POP-UP MODAL & MEDIA DINAMIS =====
    const mData = {
      souvenir: {
        icon:'🛍️', title:'Pusat Oleh-Oleh', sub:'Lapak Souvenir & Kerajinan',
        desc:'Menyediakan berbagai macam souvenir eksklusif, kerajinan tangan lokal, kaos, topi, dan pernak-pernik khas Magetan.',
        items: [
          {i:'👕', t:'Kaos Refugia', p:'Mulai Rp 50.000'},
          {i:'👜', t:'Tas Rajut', p:'Mulai Rp 35.000'},
          {i:'🍯', t:'Camilan Khas', p:'Mulai Rp 15.000'},
          {i:'🌸', t:'Bibit Bunga', p:'Mulai Rp 10.000'}
        ],
        // [BARU] Tambahkan daftar file foto souvenir kamu di sini
        images: [
          'img/lapak souvenir 1.png', 
          'img/lapak souvenir 2.png', 
          'img/Souvenir3.jpeg'
        ]
      },
      sayur: {
        icon:'🥬', title:'Lapak Sayur Segar', sub:'Hasil Tani Sehat',
        desc:'Beli sayuran segar organik yang dipanen langsung dari kebun Refugia dan petani lokal sekitar Gunung Lawu.',
        items: [
          {i:'🥕', t:'Sayur Segar', p:'Paket Rp 10.000'},
          {i:'🍓', t:'Buah Segar', p:'Sesuai Musim'},
          {i:'🍂', t:'Benih tanaman', p:'Tanyakan stok & Harga terbaru'},
        ],
        // Disimpan dalam array agar formatnya seragam
        images: [
          'img/JenisBunga.jpeg'
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
          'img/MenuMakanan_BERGAMBAR.jpeg',
          'img/MenuMakanan_Teks.jpeg',
          'img/MenuMinuman_gambar.jpeg',
          'img/MenuMinuman_teks.jpeg'
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

    let modalInterval = null;
    let modalCurSlide = 0;

    function openM(id){
      const d = mData[id];
      if(!d) return;

      if(modalInterval) clearInterval(modalInterval);
      mediaContainer.innerHTML = '';

      mIcon.textContent = d.icon;
      mTitle.textContent = d.title;
      mSub.textContent = d.sub;
      mDesc.textContent = d.desc;
      
      mItems.innerHTML = '';
      d.items.forEach(it => {
        mItems.innerHTML += `
          <div class="mitem">
            <div class="mitem-ico">${it.i}</div>
            <h4>${it.t}</h4>
            <p>${it.p}</p>
          </div>
        `;
      });

      // [OTOMATISASI] Jika properti images ada dan isinya lebih dari 1 gambar
      if(d.images && d.images.length > 1) {
        
        // Buat elemen gambar secara dinamis
        const slidesHtml = d.images.map((imgSrc, idx) => `
          <img src="${imgSrc}" class="m-slide-img" alt="${d.title} Slide ${idx + 1}">
        `).join('');

        // Buat dot indikator secara dinamis menyesuaikan jumlah gambar
        const dotsHtml = d.images.map((_, idx) => `
          <span class="m-dot ${idx === 0 ? 'active' : ''}"></span>
        `).join('');

        mediaContainer.innerHTML = `
          <div class="m-slider-outer">
            <div class="m-slider-track" id="mSliderTrack">
              ${slidesHtml}
            </div>
            <div class="m-slider-dots">
              ${dotsHtml}
            </div>
          </div>
        `;

        modalCurSlide = 0;
        const trackM = document.getElementById('mSliderTrack');
        const dotsM = document.querySelectorAll('.m-dot');
        const totalSlides = d.images.length;

        // Jalankan interval otomatis sesuai jumlah data gambar
        modalInterval = setInterval(() => {
          modalCurSlide = (modalCurSlide + 1) % totalSlides;
          if(trackM) {
            trackM.style.transform = `translateX(-${modalCurSlide * 100}%)`;
          }
          dotsM.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === modalCurSlide);
          });
        }, 10000);

      } else if(d.images && d.images.length === 1) {
        // Jika gambarnya cuma ada 1, tampilkan gambar tunggal biasa
        mediaContainer.innerHTML = `<img src="${d.images[0]}" class="m-single-img" alt="${d.title}">`;
      }

      overlay.classList.add('open');
    }
    
    function closeM(){
      if(modalInterval) {
        clearInterval(modalInterval);
        modalInterval = null;
      }
      overlay.classList.remove('open');
    }

    // Pemasangan Event Listener untuk membuka Modal
    document.querySelectorAll('.lapak-card').forEach(card => {
        card.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            openM(targetId);
        });
    });

    // Pemasangan Event Listener untuk menutup Modal
    document.querySelectorAll('.modal-close').forEach(elem => {
        elem.addEventListener('click', function(e) {
            if(e.target === this) {
                closeM();
            }
        });
    });
});