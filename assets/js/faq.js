// Logika Toggle Accordion FAQ
function toggleFaq(element) {
    if (!element) return;
    const isActive = element.classList.contains('active');
    const allFaqs = document.querySelectorAll('.faq-item, [data-faq]');
    
    // Tutup semua FAQ terlebih dahulu
    allFaqs.forEach(item => {
        item.classList.remove('active');
    });
    
    // Jika yang di-klik belum aktif, buka
    if (!isActive) {
        element.classList.add('active');
    }
}

function renderPublicFaqs() {
    const faqContainer = document.querySelector('.faq-container');
    if (!faqContainer || typeof RefugiaDB === 'undefined') return;

    const faqs = RefugiaDB.getFaqs();
    if (faqs.length === 0) return;

    faqContainer.innerHTML = '';
    faqs.forEach(f => {
        const item = document.createElement('div');
        item.className = 'faq-item';
        item.innerHTML = `
            <div class="faq-q">${f.question}</div>
            <div class="faq-a">${f.answer}</div>
        `;
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.faq-a')) {
                toggleFaq(this);
            }
        });
        faqContainer.appendChild(item);
    });
}

function syncPublicSettings() {
    if (typeof RefugiaDB === 'undefined') return;
    const settings = RefugiaDB.getSettings();

    // Update Jam Operasional Teks di Footer & Header jika ada
    const jamEls = document.querySelectorAll('.ft-jam, .jam-info span');
    jamEls.forEach(el => {
        if (settings.jamBuka) el.textContent = settings.jamBuka;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    renderPublicFaqs();
    syncPublicSettings();

    // Listener Real-Time Sync
    window.addEventListener('storage', () => {
        renderPublicFaqs();
        syncPublicSettings();
    });

    window.addEventListener('refugia_db_updated', () => {
        renderPublicFaqs();
        syncPublicSettings();
    });

    // Form Masukan / Saran Ke Database Admin
    const saranForm = document.getElementById('saranForm');
    const saranNotif = document.getElementById('saranNotif');

    if (saranForm) {
        saranForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nama = document.getElementById('saranNama').value.trim();
            const nohp = document.getElementById('saranNoHP').value.trim();
            const pesan = document.getElementById('saranPesan').value.trim();

            if (typeof RefugiaDB !== 'undefined') {
                RefugiaDB.addMessage({
                    name: nama,
                    phone: nohp,
                    message: pesan
                });
            }

            saranForm.reset();
            if (saranNotif) {
                saranNotif.style.display = 'block';
                setTimeout(() => {
                    saranNotif.style.display = 'none';
                }, 6000);
            }
        });
    }
});