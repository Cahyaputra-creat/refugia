document.addEventListener('DOMContentLoaded', function() {
    const mData = {
      tanaman: {
        icon: '🌸', title: 'Bursa Tanaman Hias', sub: 'Tersedia berbagai bibit bunga',
        desc: 'Silakan hubungi petani secara langsung melalui WhatsApp untuk menanyakan stok atau melakukan pemesanan di luar jadwal kunjungan.',
        phone: '6285931486608',
        waText: 'Halo Petani Refugia, saya ingin bertanya tentang ketersediaan bibit tanaman hias.',
        items: [
          {i: '🟢', t: 'Senin - Jumat', p: '08.00 - 16.00 WIB'},
          {i: '🟡', t: 'Akhir Pekan', p: '09.00 - 15.00 WIB'}
        ]
      },
      oleh: {
        icon: '🛍️', title: 'Pusat Oleh-Oleh', sub: 'Cenderamata & Makanan Khas',
        desc: 'Hubungi pengelola toko oleh-oleh untuk menanyakan ketersediaan produk khas Magetan dan souvenir eksklusif Kebun Refugia.',
        phone: '6285931486608',
        waText: 'Halo Toko Refugia, saya ingin bertanya tentang oleh-oleh khas Magetan.',
        items: [
          {i: '🟢', t: 'Senin - Jumat', p: '08.00 - 16.00 WIB'},
          {i: '🟡', t: 'Akhir Pekan', p: '09.00 - 15.00 WIB'}
        ]
      },
      admin: {
        icon: '👨‍💼', title: 'Layanan Admin Refugia', sub: 'Pusat Informasi & Tiket',
        desc: 'Untuk pemesanan tiket rombongan, penyewaan lokasi event/wedding, dan informasi lainnya, silakan hubungi admin resmi kami.',
        phone: '6285931486608',
        waText: 'Halo Admin Refugia, saya ingin mendapatkan informasi lebih lanjut mengenai fasilitas.',
        items: [
          {i: '🟢', t: 'Setiap Hari', p: '08.30 - 16.30 WIB'},
          {i: '⚡', t: 'Respon Cepat', p: 'Di Jam Kerja'}
        ]
      }
    };

    const overlay = document.getElementById('contactModal');
    const mIcon = document.getElementById('mIcon');
    const mTitle = document.getElementById('mTitle');
    const mSub = document.getElementById('mSub');
    const mDesc = document.getElementById('mDesc');
    const mItems = document.getElementById('mItems');
    const waLink = document.getElementById('waLink');

    function openModal(id) {
      const data = mData[id];
      if(!data) return;
      
      mIcon.textContent = data.icon;
      mTitle.textContent = data.title;
      mSub.textContent = data.sub;
      mDesc.textContent = data.desc;
      
      mItems.innerHTML = '';
      data.items.forEach(it => {
        mItems.innerHTML += `
          <div class="mitem">
            <div class="mitem-ico">${it.i}</div>
            <h4>${it.t}</h4>
            <p>${it.p}</p>
          </div>
        `;
      });

      waLink.href = `https://api.whatsapp.com/send?phone=${data.phone}&text=${encodeURIComponent(data.waText)}`;
      
      overlay.classList.add('open');
    }
    
    function closeModal() {
      overlay.classList.remove('open');
    }

    // Pemasangan Event Listener untuk membuka Modal
    document.querySelectorAll('.lapak-card').forEach(card => {
        card.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            openModal(targetId);
        });
    });

    // Pemasangan Event Listener untuk menutup Modal
    document.querySelectorAll('.modal-close').forEach(elem => {
        elem.addEventListener('click', function(e) {
            // Hanya menutup jika yang diklik benar-benar elemen dengan class .modal-close 
            // (misal: background gelap atau tombol close, bukan isi dalam pop-up)
            if(e.target === this) {
                closeModal();
            }
        });
    });
});