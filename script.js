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