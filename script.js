// ===== SLIDER FASILITAS =====
// Ensure the script only runs if the elements exist on the current page
const track = document.getElementById('fSlider');
const dotsWrap = document.getElementById('sDots');

if (track && dotsWrap) {
  // Update TOTAL based on how many slides you actually have in fasilitas.html
  const TOTAL = 10; 
  let cur = 0;

  // Build dots
  for(let i = 0; i < TOTAL; i++) {
    const d = document.createElement('div');
    d.className = 'sdot' + (i === 0 ? ' on' : '');
    d.onclick = () => goTo(i);
    dotsWrap.appendChild(d);
  }

  function goTo(n){
    cur = n;
    track.style.transform = `translateX(-${cur * 100}%)`;
    document.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('on', i === cur));
  }

  // Attach to window so onclick attributes in HTML can find it
  window.sMove = function(dir) {
    let n = cur + dir;
    if (n < 0) n = TOTAL - 1;
    if (n >= TOTAL) n = 0;
    goTo(n);
  };
}

// ===== MODAL KONTAK =====
// Attach to window so onclick attributes in HTML can find it
window.openModal = function() {
  const modal = document.getElementById('contactModal');
  if(modal) {
    modal.classList.add('open');
  }
}

window.closeModal = function() {
  const modal = document.getElementById('contactModal');
  if(modal) {
    modal.classList.remove('open');
  }
}

// Close modal when clicking outside the box
window.addEventListener('click', function(e) {
  const modal = document.getElementById('contactModal');
  if (e.target === modal) {
    window.closeModal();
  }
});

// ===== FAQ ACCORDION =====
// Attach to window so onclick attributes in HTML can find it
window.toggleFaq = function(element) {
  const allItems = document.querySelectorAll('.faq-item');
  
  // Close others
  allItems.forEach(item => {
    if (item !== element) {
      item.classList.remove('active');
    }
  });
  
  // Toggle the clicked one
  element.classList.toggle('active');
}

// ===== KODE JAVASCRIPT SLIDER FASILITAS =====
const TOTAL_SLIDES = 10;
let curSlide = 0;
const track = document.getElementById('fSlider');
const dotsWrap = document.getElementById('sDots');

if (track && dotsWrap) {
  // Buat titik navigasi (dots)
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    const d = document.createElement('div');
    d.className = 's-dot' + (i === 0 ? ' on' : '');
    d.onclick = () => goToSlide(i);
    dotsWrap.appendChild(d);
  }
}

function goToSlide(n) {
  curSlide = n;
  track.style.transform = `translateX(-${curSlide * 100}%)`;
  document.querySelectorAll('.s-dot').forEach((d, i) => d.classList.toggle('on', i === curSlide));
}

function sMove(dir) {
  let n = curSlide + dir;
  if (n < 0) n = TOTAL_SLIDES - 1;
  if (n >= TOTAL_SLIDES) n = 0;
  goToSlide(n);
}

// Pengecekan untuk FAQ
const faqItems = document.querySelectorAll('.faq-item');
if (faqItems.length > 0) {
    // Masukkan logika klik FAQ di dalam sini
}

// Pengecekan untuk Detail Lapak
const tombolDetail = document.querySelector('.btn-detail-lapak');
if (tombolDetail) {
    // Masukkan logika klik detail lapak di sini
}

// Opsi A: Mengubah pengecekan URL (Hapus ekstensi .html)
if (window.location.pathname.includes('fasilitas')) {
    // Tempatkan logika pop-up detail lapak & toko Anda di sini
}

if (window.location.pathname.includes('kontak')) {
    // Tempatkan logika detail petani & kontak Anda di sini
}

// Opsi B (Paling Direkomendasikan): Cek keberadaan elemen di DOM tanpa peduli URL
const FAQContainer = document.querySelector('.faq-item'); // sesuaikan dengan class FAQ Anda
if (FAQContainer) {
    // Logika gulir FAQ ditaruh di sini, otomatis jalan di halaman faq tanpa cek URL
}