/* =========================================
   REFUGIA KONTAK & LAPAK PETANI MODULE
   - Dynamically synced with RefugiaDB Settings for ALL lapak modals
   ========================================= */

const RefugiaKontak = (() => {
    const mData = {
      tanaman: {
        icon: '🌸', title: 'Bursa Tanaman Hias', sub: 'Tersedia berbagai bibit bunga',
        desc: 'Silakan hubungi petani secara langsung melalui WhatsApp untuk menanyakan stok atau melakukan pemesanan di luar jadwal kunjungan.',
        phone: '6285931486608',
        waText: 'Halo Petani Refugia, saya ingin bertanya tentang ketersediaan bibit tanaman hias.',
        items: [
          {i: '🟢', t: 'Setiap Hari', p: '08.00 - 17.00 WIB'},
          {i: '⚡', t: 'Respon Cepat', p: 'Di Jam Kerja'}
        ]
      },
      oleh: {
        icon: '🛍️', title: 'Pusat Oleh-Oleh', sub: 'Cenderamata & Makanan Khas',
        desc: 'Hubungi pengelola toko oleh-oleh untuk menanyakan ketersediaan produk khas Magetan dan souvenir eksklusif Kebun Refugia.',
        phone: '6285931486608',
        waText: 'Halo Toko Refugia, saya ingin bertanya tentang oleh-oleh khas Magetan.',
        items: [
          {i: '🟢', t: 'Setiap Hari', p: '08.00 - 17.00 WIB'},
          {i: '⚡', t: 'Respon Cepat', p: 'Di Jam Kerja'}
        ]
      },
      admin: {
        icon: '👨‍💼', title: 'Layanan Admin Refugia', sub: 'Pusat Informasi & Tiket',
        desc: 'Untuk pemesanan tiket rombongan, penyewaan lokasi event/wedding, dan informasi lainnya, silakan hubungi admin resmi kami.',
        phone: '6285931486608',
        waText: 'Halo Admin Refugia, saya ingin mendapatkan informasi lebih lanjut mengenai fasilitas.',
        items: [
          {i: '🟢', t: 'Setiap Hari', p: '08.00 - 17.00 WIB'},
          {i: '⚡', t: 'Respon Cepat', p: 'Di Jam Kerja'}
        ]
      }
    };

    function openModal(id) {
        const overlay = document.getElementById('contactModal');
        const mIcon = document.getElementById('mIcon');
        const mTitle = document.getElementById('mTitle');
        const mSub = document.getElementById('mSub');
        const mDesc = document.getElementById('mDesc');
        const mItems = document.getElementById('mItems');
        const waLink = document.getElementById('waLink');

        if (!overlay) return;

        const data = mData[id];
        if (!data) return;

        // Dynamically sync Admin phone & operating hours from RefugiaDB settings for ALL lapak modals
        let targetPhone = data.phone;
        let itemsList = data.items.map(item => ({ ...item }));

        if (typeof RefugiaDB !== 'undefined') {
            const settings = RefugiaDB.getSettings();
            if (settings) {
                if (settings.phoneAdmin) {
                    let cleanedPhone = settings.phoneAdmin.replace(/[^0-9]/g, '');
                    if (cleanedPhone.startsWith('0')) {
                        cleanedPhone = '62' + cleanedPhone.substring(1);
                    }
                    if (cleanedPhone) targetPhone = cleanedPhone;
                }

                if (settings.jamBuka) {
                    let jamText = settings.jamBuka;
                    if (jamText.includes(':')) {
                        jamText = jamText.split(':')[1].trim();
                    }
                    if (itemsList.length > 0) {
                        itemsList[0].p = jamText;
                    }
                }
            }
        }
        
        if (mIcon) mIcon.textContent = data.icon;
        if (mTitle) mTitle.textContent = data.title;
        if (mSub) mSub.textContent = data.sub;
        if (mDesc) mDesc.textContent = data.desc;
        
        if (mItems) {
            mItems.innerHTML = '';
            itemsList.forEach(it => {
                mItems.innerHTML += `
                    <div class="mitem">
                        <div class="mitem-ico">${it.i}</div>
                        <h4>${it.t}</h4>
                        <p>${it.p}</p>
                    </div>
                `;
            });
        }

        if (waLink) {
            waLink.href = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(data.waText)}`;
        }
        
        overlay.classList.add('open');
    }
    
    function closeModal() {
        const overlay = document.getElementById('contactModal');
        if (overlay) overlay.classList.remove('open');
    }

    // Event Delegation
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.lapak-card');
        if (card) {
            const targetId = card.getAttribute('data-target');
            if (targetId) openModal(targetId);
            return;
        }

        const closeBtn = e.target.closest('.modal-close, #contactModal');
        if (closeBtn && (e.target === closeBtn || closeBtn.classList.contains('mclose') || closeBtn.classList.contains('btn-back'))) {
            closeModal();
        }
    });

    return {
        openModal,
        closeModal
    };
})();