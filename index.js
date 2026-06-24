document.addEventListener("DOMContentLoaded", () => {
    
    /* =========================================
       1. LOGIKA HAMBURGER MENU
    ========================================= */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        // Toggle menu saat hamburger diklik
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Tutup menu otomatis saat salah satu link navigasi diklik
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    /* =========================================
       2. LOGIKA VIDEO MODAL POP-UP
    ========================================= */
    const modal = document.getElementById('videoModal');
    const popupVideo = document.getElementById('popupVideo');
    const closeBtn = document.querySelector('.close-btn');
    // Mendukung selector .instagram-card (terbaru) maupun .video-card (lama)
    const videoCards = document.querySelectorAll('.instagram-card, .video-card');

    // Fungsi Membuka Modal
    function openModal(videoSrc) {
        if (!modal || !popupVideo) return;

        popupVideo.src = videoSrc;
        popupVideo.load();
        
        // Ubah display ke flex terlebih dahulu
        modal.style.display = 'flex';
        
        // Beri jeda micro-task (10ms) agar browser sempat merender display sebelum animasi opacity berjalan
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Kunci scroll pada body agar latar belakang tidak ikut bergerak
        document.body.style.overflow = 'hidden';

        // Putar video otomatis
        popupVideo.play().catch(error => {
            console.warn("Autoplay diblokir oleh browser, menunggu interaksi pengguna.", error);
        });
    }

    // Fungsi Menutup Modal
    function closeModal() {
        if (!modal || !popupVideo) return;

        // Mulai animasi fade-out dengan menghapus class 'show'
        modal.classList.remove('show');
        popupVideo.pause();
        
        // Kembalikan fungsi scroll pada body
        document.body.style.overflow = '';

        // Tunggu hingga transisi CSS selesai (300ms), lalu sembunyikan elemen & kosongkan src video
        setTimeout(() => {
            popupVideo.src = "";
            modal.style.display = 'none';
        }, 300);
    }

    // Pasang Event Listener klik ke setiap kartu video
    videoCards.forEach(card => {
        card.addEventListener('click', function() {
            const videoSrc = this.getAttribute('data-video'); 
            if (videoSrc) {
                openModal(videoSrc);
            }
        });
    });

    // Event listener untuk tombol close silang (X)
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Event listener untuk menutup dengan klik di area luar video (overlay buram)
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Event listener tambahan untuk menutup modal menggunakan tombol 'Escape' pada keyboard
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeModal();
        }
    });
});