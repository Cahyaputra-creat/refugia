document.addEventListener('DOMContentLoaded', function() {
    // Menambahkan event listener ke semua elemen dengan atribut data-faq
    document.querySelectorAll('[data-faq]').forEach(item => {
        item.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            
            // Tutup semua FAQ terlebih dahulu
            document.querySelectorAll('[data-faq]').forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Jika yang di-klik belum aktif, buka
            if (!isActive) {
                this.classList.add('active');
            }
        });
    });
});