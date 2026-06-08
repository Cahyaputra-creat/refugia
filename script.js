// ===== SLIDER FASILITAS =====
const TOTAL = 2; // Ganti sesuai dengan jumlah slide yang ada
let cur = 0;
const track = document.getElementById('fSlider');
const dotsWrap = document.getElementById('sDots');

// Build dots
if (track && dotsWrap) {
  for(let i=0; i<TOTAL; i++) {
    const d = document.createElement('div');
    d.className = 'sdot' + (i===0 ? ' on' : '');
    d.onclick = () => goTo(i);
    dotsWrap.appendChild(d);
  }
}

function goTo(n){
  if (!track) return;
  cur = n;
  track.style.transform = `translateX(-${cur*100}%)`;
  document.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('on', i===cur));
}

function sMove(dir){
  let n = cur + dir;
  if(n < 0) n = TOTAL - 1;
  if(n >= TOTAL) n = 0;
  goTo(n);
}

// ===== MODAL KONTAK =====
function openModal() {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.classList.add('open');
  }
}

function closeModal() {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.classList.remove('open');
  }
}

// Close modal when clicking outside the modal box
window.addEventListener('click', function(e) {
  const modal = document.getElementById('contactModal');
  if (e.target === modal) {
    closeModal();
  }
});

// ===== FAQ ACCORDION =====
function toggleFaq(element) {
  // Tutup FAQ lain jika ingin hanya satu yang terbuka (opsional)
  const allItems = document.querySelectorAll('.faq-item');
  allItems.forEach(item => {
    if (item !== element) {
      item.classList.remove('active');
    }
  });
  
  // Toggle FAQ yang diklik
  element.classList.toggle('active');
}