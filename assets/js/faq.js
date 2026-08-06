// Logika Accordion FAQ & Form Saran (Clean & 100% Reliable Event Delegation)

function toggleFaq(element) {
    if (!element) return;
    const item = element.classList.contains('faq-item') ? element : element.closest('.faq-item');
    if (!item) return;

    const isActive = item.classList.contains('active');
    
    // Remove active state from all FAQ items
    document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
    });

    // Toggle current item if it wasn't active
    if (!isActive) {
        item.classList.add('active');
    }
}

window.toggleFaq = toggleFaq;

function renderPublicFaqs() {
    const faqContainer = document.querySelector('.faq-container');
    if (!faqContainer || typeof RefugiaDB === 'undefined') return;

    const faqs = RefugiaDB.getFaqs();
    if (!faqs || faqs.length === 0) return;

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
    if (!settings) return;

    const jamEls = document.querySelectorAll('.ft-jam, .jam-info span');
    jamEls.forEach(el => {
        if (settings.jamBuka) el.textContent = settings.jamBuka;
    });
}

// Single, clean Event Delegation for FAQ Accordion
document.addEventListener('click', function(e) {
    const item = e.target.closest('.faq-item');
    if (!item) return;

    // Do not toggle if clicking inside the answer text area
    if (e.target.closest('.faq-a')) return;

    toggleFaq(item);
});

// Form submission handler for Saran & Masukan
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