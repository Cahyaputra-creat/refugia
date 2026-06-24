document.addEventListener("DOMContentLoaded", () => {
    
    // ===== LOGIKA HAMBURGER MENU =====
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // ===== LOGIKA MODAL VIDEO POP-UP =====
    const modal = document.getElementById('videoModal');
    const popupVideo = document.getElementById('popupVideo');
    const closeBtn = document.querySelector('.close-btn');
    const videoCards = document.querySelectorAll('.video-card');

    // Menampilkan Modal dan Memutar Video
    videoCards.forEach(card => {
        card.addEventListener('click', function() {
            const videoSrc = this.getAttribute('data-video'); 
            
            if (popupVideo && modal) {
                popupVideo.src = videoSrc; 
                popupVideo.load(); 
                modal.classList.add('show'); 
                
                popupVideo.play().catch(error => {
                    console.log("Autoplay dicegah, pengguna perlu berinteraksi.", error);
                });
            }
        });
    });

    // Fungsi Menutup Modal
    function closeModal() {
        if (modal) {
            modal.classList.remove('show'); 
            popupVideo.pause(); 
            
            setTimeout(() => {
                popupVideo.src = ""; 
            }, 300);
        }
    }

    // Event listener untuk tombol close
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Menutup dengan klik di area buram (luar video)
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});