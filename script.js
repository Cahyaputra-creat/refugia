// ===== SLIDER FASILITAS (Hanya berjalan jika berada di halaman fasilitas.html) =====
const track = document.getElementById('fSlider');
const dotsWrap = document.getElementById('sDots');

if (track && dotsWrap) {
  const TOTAL = 10; // Sesuai jumlah slide data asli di refugia-magetan (3).html
  let cur = 0;

  // Build dots secara dinamis
  for (let i = 0; i < TOTAL; i++) {
    const d = document.createElement('div');
    d.className = 'sdot' + (i === 0 ? ' on' : '');
    d.onclick = () => goTo(i);
    dotsWrap.appendChild(d);
  }

  function goTo(n) {
    cur = n;
    track.style.transform = `translateX(-${cur * 100}%)`;
    document.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('on', i === cur));
  }

  window.sMove = function (dir) {
    let n = cur + dir;
    if (n < 0) n = TOTAL - 1;
    if (n >= TOTAL) n = 0;
    goTo(n);
  };
}

// ===== POPUP MODAL KONTAK (Hanya berjalan di kontak.html) =====
window.openModal = function () {
  const modal = document.getElementById('contactModal');
  if (modal) modal.classList.add('open');
};

window.closeModal = function () {
  const modal = document.getElementById('contactModal');
  if (modal) modal.classList.remove('open');
};

// Tutup modal otomatis saat area latar belakang diklik
window.addEventListener('click', function (e) {
  const modal = document.getElementById('contactModal');
  if (e.target === modal) {
    closeModal();
  }
});

// ===== ACCORDION FAQ (Hanya berjalan di faq.html) =====
window.toggleFaq = function (element) {
  const allItems = document.querySelectorAll('.faq-item');
  allItems.forEach(item => {
    if (item !== element) {
      item.classList.remove('active');
    }
  });
  element.classList.toggle('active');
};