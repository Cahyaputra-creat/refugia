// Logika Toggle Accordion FAQ & Form Saran
function toggleFaq(element) {
    if (!element) return;
    const isActive = element.classList.contains('active');
    const allFaqs = document.querySelectorAll('.faq-item, [data-faq]');
    
    allFaqs.forEach(item => {
        item.classList.remove('active');
    });
    
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
        faqContainer.appendChild(item);
    });
}

function syncPublicSettings() {
    if (typeof RefugiaDB === 'undefined') return;
    const settings = RefugiaDB.getSettings();

    const jamEls = document.querySelectorAll('.ft-jam, .jam-info span');
    jamEls.forEach(el => {
        if (settings.jamBuka) el.textContent = settings.jamBuka;
    });
}

// Global Event Delegation for Accordion & Saran Form
document.addEventListener('click', function(e) {
    const faqHeader = e.target.closest('.faq-q, .faq-item');
    if (faqHeader && !e.target.closest('.faq-a')) {
        const item = faqHeader.classList.contains('faq-item') ? faqHeader : faqHeader.closest('.faq-item');
        if (item) toggleFaq(item);
    }
});

document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'saranForm') {
        e.preventDefault();
        const nama = document.getElementById('saranNama') ? document.getElementById('saranNama').value.trim() : '';
        const nohp = document.getElementById('saranNoHP') ? document.getElementById('saranNoHP').value.trim() : '';
        const pesan = document.getElementById('saranPesan') ? document.getElementById('saranPesan').value.trim() : '';

        if (typeof RefugiaDB !== 'undefined') {
            RefugiaDB.addMessage({
                name: nama,
                phone: nohp,
                message: pesan
            });
        }

        e.target.reset();
        const saranNotif = document.getElementById('saranNotif');
        if (saranNotif) {
            saranNotif.style.display = 'block';
            setTimeout(() => {
                saranNotif.style.display = 'none';
            }, 6000);
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    renderPublicFaqs();
    syncPublicSettings();

    const prevReinit = window.reinitPublicPage;
    window.reinitPublicPage = function() {
        if (typeof prevReinit === 'function') prevReinit();
        renderPublicFaqs();
        syncPublicSettings();
    };

    window.addEventListener('storage', window.reinitPublicPage);
    window.addEventListener('refugia_db_updated', window.reinitPublicPage);
});