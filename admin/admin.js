/* =========================================
   PANEL ADMIN KEBUN REFUGIA MAGETAN - JAVASCRIPT
========================================= */

let salesChartInstance = null;

function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-12px)';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {

    /* 1. SESSION & AUTHENTICATION CHECK */
    const path = window.location.pathname.toLowerCase();
    const isLoginPage = path.includes('login');
    const isLoggedIn = localStorage.getItem('refugia_admin_logged') === 'true';

    if (!isLoggedIn && !isLoginPage) {
        window.location.href = '/admin/login.html';
        return;
    }

    if (isLoggedIn && isLoginPage) {
        window.location.href = '/admin/index.html';
        return;
    }

    /* 2. LOGIN FORM SUBMISSION (DYNAMIC SECURITY CHECK) */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();

            const savedUser = localStorage.getItem('refugia_admin_user') || 'admin';
            const savedPass = localStorage.getItem('refugia_admin_pass') || 'admin123';

            if (user === savedUser && pass === savedPass) {
                localStorage.setItem('refugia_admin_logged', 'true');
                window.location.href = '/admin/index.html';
            } else {
                alert('Username atau password yang Anda masukkan salah!\n\nSilakan periksa kembali kredensial admin Anda.');
            }
        });
    }

    /* 3. LOGOUT */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin keluar dari Panel Admin?')) {
                localStorage.removeItem('refugia_admin_logged');
                window.location.href = '/admin/login.html';
            }
        });
    }

    /* 4. SIDEBAR NAVIGATION & TAB SWITCHING */
    const navItems = document.querySelectorAll('.sidebar-menu a[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    const topbarTitle = document.getElementById('topbarTitle');

    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetTab = this.getAttribute('data-tab');

                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');

                tabContents.forEach(content => {
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });

                if (topbarTitle) {
                    topbarTitle.textContent = this.textContent.trim();
                }

                const sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('active');

                // Instant lazy render for active tab
                if (targetTab === 'tab-dashboard') renderDashboardAnalytics();
                else if (targetTab === 'tab-beranda') { loadHeroSettings(); renderVideosTable(); }
                else if (targetTab === 'tab-transaksi') renderSalesTable();
                else if (targetTab === 'tab-tiket') renderTicketTable();
                else if (targetTab === 'tab-fasilitas') renderFacilitiesTable();
                else if (targetTab === 'tab-faq') renderFaqsTable();
                else if (targetTab === 'tab-pesan') renderMessagesTable();
            });
        });
    }

    /* 5. TOGGLE SIDEBAR MOBILE */
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    /* 6. SETTINGS & SECURITY FORM SUBMIT */
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        loadSettings();
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const jamBuka = document.getElementById('jamBukaInput').value;
            const phoneAdmin = document.getElementById('phoneAdminInput').value;
            const tagline = document.getElementById('taglineInput').value;

            RefugiaDB.saveSettings({ jamBuka, phoneAdmin, tagline });
            alert('✓ Pengaturan Jam Operasional & Informasi Publik Berhasil Disimpan!\n\nSeluruh halaman publik telah ter-update otomatis.');
        });
    }

    const adminSecurityForm = document.getElementById('adminSecurityForm');
    if (adminSecurityForm) {
        const savedUser = localStorage.getItem('refugia_admin_user') || 'admin';
        if (document.getElementById('adminUsernameInput')) {
            document.getElementById('adminUsernameInput').value = savedUser;
        }

        adminSecurityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUser = document.getElementById('adminUsernameInput').value.trim();
            const newPass = document.getElementById('adminPasswordInput').value.trim();

            if (!newUser || !newPass) {
                alert('Username dan Password tidak boleh kosong!');
                return;
            }

            localStorage.setItem('refugia_admin_user', newUser);
            localStorage.setItem('refugia_admin_pass', newPass);
            alert('🔒 Kredensial Keamanan Admin Berhasil Diperbarui!\n\nGunakan username dan password baru ini untuk login berikutnya.');
            document.getElementById('adminPasswordInput').value = '';
        });
    }

    /* 7. SALE FORM SUBMIT (CATAT TRANSAKSI TIKET LOKET MANUAL) */
    const saleForm = document.getElementById('saleForm');
    if (saleForm) {
        if (document.getElementById('saleDate')) {
            document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
        }

        saleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.getElementById('saleDate').value;
            const ticketSelect = document.getElementById('saleTicketSelect');
            const ticketType = ticketSelect.options[ticketSelect.selectedIndex].text.split(' - ')[0];
            const price = parseInt(ticketSelect.value, 10);
            const qty = document.getElementById('saleQty').value;
            const notes = document.getElementById('saleNotes').value;

            RefugiaDB.addSale({ date, ticketType, price, qty, notes });
            refreshAllAdminViews();
            closeSaleModal();
            alert('✓ Transaksi Penjualan Tiket Berhasil Dicatat!\n\nDashboard Utama telah ter-update otomatis.');
        });
    }

    /* 8. TICKET FORM SUBMIT */
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('ticketId').value;
            const type = document.getElementById('ticketType').value;
            const price = document.getElementById('ticketPrice').value;
            const desc = document.getElementById('ticketDesc').value;
            const status = document.getElementById('ticketStatus').value;

            RefugiaDB.saveTicket({ id, type, price, desc, status });
            renderTicketTable();
            closeTicketModal();
            alert('✓ Data Tarif Tiket Berhasil Disimpan & Tersinkronkan ke Website Publik!');
        });
    }

    /* 9. FAQ FORM SUBMIT */
    const faqForm = document.getElementById('faqForm');
    if (faqForm) {
        faqForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('faqId').value;
            const question = document.getElementById('faqQuestion').value;
            const answer = document.getElementById('faqAnswer').value;

            RefugiaDB.saveFaq({ id, question, answer });
            renderFaqsTable();
            closeFaqModal();
            alert('✓ Pertanyaan FAQ Berhasil Disimpan & Tersinkronkan ke Website Publik!');
        });
    }

    /* 10. FACILITY FORM SUBMIT */
    const facilityForm = document.getElementById('facilityForm');
    if (facilityForm) {
        facilityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('facId').value;
            const name = document.getElementById('facName').value;
            const category = document.getElementById('facCategory').value;
            const desc = document.getElementById('facDesc').value;
            const rawImages = document.getElementById('facImages') ? document.getElementById('facImages').value : '';
            const images = rawImages ? rawImages.split(',').map(s => s.trim()).filter(Boolean) : [];

            RefugiaDB.saveFacility({ id, name, category, desc, images });
            renderFacilitiesTable();
            closeFacilityModal();
            alert('✓ Data Fasilitas & Katalog Berhasil Disimpan & Tersinkronkan ke Website Publik!');
        });
    }

    /* 11. QRIS SETTINGS FORM SUBMIT */
    const qrisForm = document.getElementById('qrisSettingsForm');
    if (qrisForm) {
        const settings = (typeof RefugiaDB !== 'undefined') ? RefugiaDB.getSettings() : {};
        if (document.getElementById('qrisAccountInput')) document.getElementById('qrisAccountInput').value = settings.qrisAccount || 'TAMAN REFUGIA MAGETAN';
        if (document.getElementById('qrisUrlInput')) document.getElementById('qrisUrlInput').value = settings.qrisUrl || 'assets/img/Qrish Kebun Refugia Magetan.png';

        qrisForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const qrisAccount = document.getElementById('qrisAccountInput').value;
            const qrisUrl = document.getElementById('qrisUrlInput').value;
            
            const current = RefugiaDB.getSettings();
            RefugiaDB.saveSettings({ ...current, qrisAccount, qrisUrl });
            showToast('✓ Pengaturan QRIS & Barcode E-Pembayaran Berhasil Disimpan!');
        });
    }

    /* 12. PENGATURAN BERANDA (MODEL FARA COLLECTION ADMIN) */
    const berandaForm = document.getElementById('berandaForm') || document.getElementById('heroMediaForm');
    if (berandaForm) {
        loadHeroSettings();
        berandaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const heroBgImg = document.getElementById('heroBgImgInput') ? document.getElementById('heroBgImgInput').value : '';
            const heroBadge = document.getElementById('heroBadgeInput') ? document.getElementById('heroBadgeInput').value : '';
            const heroTitle1 = document.getElementById('heroTitle1Input') ? document.getElementById('heroTitle1Input').value : '';
            const heroTitle2 = document.getElementById('heroTitle2Input') ? document.getElementById('heroTitle2Input').value : '';
            const heroTagline = document.getElementById('heroTaglineInput') ? document.getElementById('heroTaglineInput').value : '';
            
            const stat1Val = document.getElementById('stat1ValInput') ? document.getElementById('stat1ValInput').value : '';
            const stat1Label = document.getElementById('stat1LabelInput') ? document.getElementById('stat1LabelInput').value : '';
            const stat2Val = document.getElementById('stat2ValInput') ? document.getElementById('stat2ValInput').value : '';
            const stat2Label = document.getElementById('stat2LabelInput') ? document.getElementById('stat2LabelInput').value : '';
            const stat3Val = document.getElementById('stat3ValInput') ? document.getElementById('stat3ValInput').value : '';
            const stat3Label = document.getElementById('stat3LabelInput') ? document.getElementById('stat3LabelInput').value : '';

            const tentangTitle = document.getElementById('tentangTitleInput') ? document.getElementById('tentangTitleInput').value : '';
            const tentangDesc1 = document.getElementById('tentangDesc1Input') ? document.getElementById('tentangDesc1Input').value : '';
            const tentangDesc2 = document.getElementById('tentangDesc2Input') ? document.getElementById('tentangDesc2Input').value : '';
            const tentangImg = document.getElementById('tentangImgInput') ? document.getElementById('tentangImgInput').value : '';
            const tentangTag1 = document.getElementById('tentangTag1Input') ? document.getElementById('tentangTag1Input').value : '';
            const tentangTag2 = document.getElementById('tentangTag2Input') ? document.getElementById('tentangTag2Input').value : '';
            const tentangTag3 = document.getElementById('tentangTag3Input') ? document.getElementById('tentangTag3Input').value : '';
            const galeriTitle = document.getElementById('galeriTitleInput') ? document.getElementById('galeriTitleInput').value : '';

            RefugiaDB.saveHeroSettings({
                heroBgImg, heroBadge, heroTitle1, heroTitle2, heroTagline,
                stat1Val, stat1Label, stat2Val, stat2Label, stat3Val, stat3Label,
                tentangTitle, tentangDesc1, tentangDesc2, tentangImg,
                tentangTag1, tentangTag2, tentangTag3, galeriTitle
            });
            showToast('✓ Pengaturan Beranda (Hero, Statistik, Pesona Alam, & Galeri) Berhasil Disimpan!');
        });
    }

    setupFilePickers();

    const videoForm = document.getElementById('videoForm');
    if (videoForm) {
        videoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('vidId').value;
            const title = document.getElementById('vidTitle').value ? document.getElementById('vidTitle').value.trim() : 'Video Galeri Refugia';
            let videoUrl = document.getElementById('vidUrl').value ? document.getElementById('vidUrl').value.trim() : '';
            let thumbUrl = document.getElementById('vidThumb').value ? document.getElementById('vidThumb').value.trim() : '';

            if (!videoUrl) videoUrl = 'assets/img/video refugia 2.mp4';
            if (!thumbUrl) thumbUrl = 'assets/img/Tentang kami.jpeg';

            RefugiaDB.saveVideo({ id, title, videoUrl, thumbUrl });
            renderVideosTable();
            closeVideoModal();
            showToast('✓ Data Video Galeri Berhasil Disimpan & Tersinkronkan!');
        });
    }

    /* 13. INITIALIZE ALL TABLES & ANALYTICS */
    refreshAllAdminViews();

    // Auto Refresh Live & Global Cloud Sync
    window.addEventListener('storage', refreshAllAdminViews);
    window.addEventListener('refugia_db_updated', refreshAllAdminViews);
    window.addEventListener('resize', renderDashboardAnalytics);

    // Auto Poll Global Cloud Analytics setiap 5 detik (hanya merender jika tab aktif)
    setInterval(async () => {
        if (typeof RefugiaTracker !== 'undefined' && RefugiaTracker.syncGlobalCloudData) {
            await RefugiaTracker.syncGlobalCloudData();
            const dashTab = document.getElementById('tab-dashboard');
            if (dashTab && dashTab.classList.contains('active')) {
                renderDashboardAnalytics();
            }
        }
        const pesanTab = document.getElementById('tab-pesan');
        if (pesanTab && pesanTab.classList.contains('active')) {
            renderMessagesTable();
        }
    }, 5000);
});

function refreshAllAdminViews() {
    try {
        const activeTab = document.querySelector('.tab-content.active');
        const activeId = activeTab ? activeTab.id : 'tab-dashboard';
        if (activeId === 'tab-dashboard') renderDashboardAnalytics();
        else if (activeId === 'tab-beranda') { loadHeroSettings(); renderVideosTable(); }
        else if (activeId === 'tab-transaksi') renderSalesTable();
        else if (activeId === 'tab-tiket') renderTicketTable();
        else if (activeId === 'tab-fasilitas') renderFacilitiesTable();
        else if (activeId === 'tab-faq') renderFaqsTable();
        else if (activeId === 'tab-pesan') renderMessagesTable();
    } catch(e) {
        console.warn('Error refreshing views:', e);
    }
}

// DASHBOARD ANALYTICS & CHART FUNCTION
function renderDashboardAnalytics() {
    if (typeof RefugiaDB === 'undefined') return;

    try {
        const sales = RefugiaDB.getSales();
        const tickets = RefugiaDB.getTickets();

        // Total Pengunjung & Pendapatan Tiket
        const totalPengunjung = sales.reduce((sum, s) => sum + (s.qty || 0), 0);
        const totalPendapatan = sales.reduce((sum, s) => sum + (s.total || 0), 0);

        const statPengunjung = document.getElementById('statTotalPengunjung');
        const statPendapatan = document.getElementById('statTotalPendapatan');

        if (statPengunjung) statPengunjung.textContent = totalPengunjung.toLocaleString('id-ID');
        if (statPendapatan) statPendapatan.textContent = 'Rp ' + totalPendapatan.toLocaleString('id-ID');

        // Render Category Breakdown Summary Grid
        const categoryGrid = document.getElementById('categorySummaryGrid');
        if (categoryGrid) {
            categoryGrid.innerHTML = '';

            const categoryMap = {};
            sales.forEach(s => {
                if (!categoryMap[s.ticketType]) {
                    categoryMap[s.ticketType] = { qty: 0, total: 0 };
                }
                categoryMap[s.ticketType].qty += (s.qty || 0);
                categoryMap[s.ticketType].total += (s.total || 0);
            });

            tickets.forEach(t => {
                if (!categoryMap[t.type]) {
                    categoryMap[t.type] = { qty: 0, total: 0 };
                }
            });

            Object.keys(categoryMap).forEach(type => {
                const data = categoryMap[type];
                const card = document.createElement('div');
                card.style.cssText = 'background:var(--bg-main, #F4F7F3); padding:16px; border-radius:14px; border:1px solid var(--border-light, #E1E9E0); text-align:left;';
                card.innerHTML = `
                    <div style="font-size:11.5px; font-weight:700; color:var(--text-muted, #5E7367); text-transform:uppercase;">${type}</div>
                    <div style="font-size:22px; font-weight:800; color:var(--primary-green, #0D261C); margin:4px 0;">${data.qty.toLocaleString('id-ID')} <span style="font-size:12px; font-weight:600; color:#5E7367;">Terjual</span></div>
                    <div style="font-size:12px; font-weight:700; color:#2F855A;">Rp ${data.total.toLocaleString('id-ID')}</div>
                `;
                categoryGrid.appendChild(card);
            });
        }

        // Render Website Visitor Analytics (Trafik Kunjungan Web Global)
        if (typeof RefugiaTracker !== 'undefined') {
            const webAnalytics = RefugiaTracker.getAnalytics();
            const statWebViews = document.getElementById('statWebViews');
            if (statWebViews) {
                statWebViews.textContent = (webAnalytics.totalViews || 0).toLocaleString('id-ID');
            }

            const pageTrafficGrid = document.getElementById('pageTrafficGrid');
            if (pageTrafficGrid && webAnalytics.pages) {
                pageTrafficGrid.innerHTML = '';
                const maxViews = Math.max(...Object.values(webAnalytics.pages), 1);

                Object.keys(webAnalytics.pages).forEach(page => {
                    const views = webAnalytics.pages[page] || 0;
                    const pct = Math.round((views / maxViews) * 100);
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex; flex-direction:column; gap:4px; margin-bottom:8px;';
                    row.innerHTML = `
                        <div style="display:flex; justify-content:space-between; font-size:12.5px; font-weight:700;">
                            <span>${page}</span>
                            <span style="color:var(--primary-green, #0D261C);">${views.toLocaleString('id-ID')} kunjungan</span>
                        </div>
                        <div style="width:100%; height:8px; background:#E1E9E0; border-radius:4px; overflow:hidden;">
                            <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #184432, #246B4F); border-radius:4px; transition:width 0.5s ease;"></div>
                        </div>
                    `;
                    pageTrafficGrid.appendChild(row);
                });
            }
        }

        // RENDER 100% RELIABLE VISUAL BAR CHART
        renderSalesChart(sales);

    } catch(err) {
        console.warn('Analytics render error:', err);
    }
}

// 100% SYNCHRONIZED VISUAL BAR CHART RENDERER
function renderSalesChart(sales) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 250;
    
    canvas.width = width;
    canvas.height = height;

    if (salesChartInstance) {
        try { salesChartInstance.destroy(); } catch(e){}
        salesChartInstance = null;
    }

    ctx.clearRect(0, 0, width, height);

    if (!sales || sales.length === 0) {
        ctx.fillStyle = '#5E7367';
        ctx.font = '600 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada transaksi penjualan tiket. Klik tab "Transaksi Loket" untuk mencatat.', width / 2, height / 2);
        return;
    }

    const dateMap = {};
    sales.forEach(s => {
        const d = s.date || 'Hari Ini';
        dateMap[d] = (dateMap[d] || 0) + (s.total || 0);
    });

    const labels = Object.keys(dateMap).sort();
    const values = labels.map(d => dateMap[d]);

    if (typeof Chart !== 'undefined') {
        try {
            salesChartInstance = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Total Pendapatan Tiket (Rp)',
                        data: values,
                        backgroundColor: 'rgba(24, 68, 50, 0.85)',
                        borderColor: '#0D261C',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) { return 'Rp ' + value.toLocaleString('id-ID'); }
                            }
                        }
                    }
                }
            });
            return;
        } catch(e) {
            console.warn('Chart.js init fallback to canvas:', e);
        }
    }

    // High-Resolution Native Canvas Bar Chart Fallback
    const padding = 45;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;
    const maxVal = Math.max(...values, 10000) * 1.15;

    ctx.strokeStyle = '#E1E9E0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + chartH - (chartH * (i / 4));
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        ctx.fillStyle = '#5E7367';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Rp ' + Math.round(maxVal * (i / 4)).toLocaleString('id-ID'), padding - 6, y + 3);
    }

    const barWidth = Math.min(54, (chartW / values.length) * 0.5);
    const gap = chartW / values.length;

    values.forEach((val, i) => {
        const barH = (val / maxVal) * chartH;
        const x = padding + (i * gap) + (gap - barWidth) / 2;
        const y = padding + chartH - barH;

        const grad = ctx.createLinearGradient(0, y, 0, padding + chartH);
        grad.addColorStop(0, '#246B4F');
        grad.addColorStop(1, '#0D261C');

        ctx.fillStyle = grad;
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barH, [6, 6, 0, 0]);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, barWidth, barH);
        }

        ctx.fillStyle = '#0D261C';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Rp ' + val.toLocaleString('id-ID'), x + barWidth / 2, y - 6);

        ctx.fillStyle = '#5E7367';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillText(labels[i], x + barWidth / 2, padding + chartH + 16);
    });
}

// SALES / TRANSACTIONS FUNCTIONS
function renderSalesTable() {
    const salesTbody = document.getElementById('salesTbody');
    if (!salesTbody) return;

    const sales = (typeof RefugiaDB !== 'undefined') ? RefugiaDB.getSales() : [];
    salesTbody.innerHTML = '';

    if (sales.length === 0) {
        salesTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted); padding:30px;">Belum ada pencatatan transaksi tiket. Klik "+ Catat Transaksi Tiket" untuk menambahkan.</td></tr>`;
        return;
    }

    sales.forEach((s) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${s.id}</strong></td>
            <td>${s.date}</td>
            <td><span class="badge badge-success">${s.ticketType}</span></td>
            <td>Rp ${s.price.toLocaleString('id-ID')}</td>
            <td><strong>${s.qty}</strong></td>
            <td><strong style="color:var(--primary-green);">Rp ${s.total.toLocaleString('id-ID')}</strong></td>
            <td>${s.notes}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-delete" title="Hapus Transaksi" onclick="deleteSale('${s.id}')">🗑️</button>
                </div>
            </td>
        `;
        salesTbody.appendChild(tr);
    });
}

function openSaleModal() {
    const modal = document.getElementById('saleModal');
    const select = document.getElementById('saleTicketSelect');
    if (!modal || !select) return;

    const tickets = RefugiaDB.getTickets();
    select.innerHTML = '';
    tickets.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.price;
        opt.textContent = `${t.type} - Rp ${t.price.toLocaleString('id-ID')}`;
        select.appendChild(opt);
    });

    modal.style.display = 'flex';
}

function closeSaleModal() {
    const modal = document.getElementById('saleModal');
    if (modal) modal.style.display = 'none';
    if (document.getElementById('saleForm')) document.getElementById('saleForm').reset();
}

function deleteSale(id) {
    if (confirm('Hapus transaksi penjualan tiket ini dari catatan?')) {
        RefugiaDB.deleteSale(id);
        refreshAllAdminViews();
    }
}

// SETTINGS FUNCTION
function loadSettings() {
    if (typeof RefugiaDB === 'undefined') return;
    const settings = RefugiaDB.getSettings();
    if (document.getElementById('jamBukaInput')) document.getElementById('jamBukaInput').value = settings.jamBuka || '';
    if (document.getElementById('phoneAdminInput')) document.getElementById('phoneAdminInput').value = settings.phoneAdmin || '';
    if (document.getElementById('taglineInput')) document.getElementById('taglineInput').value = settings.tagline || '';
}

// TICKETS FUNCTIONS
function renderTicketTable() {
    const ticketTbody = document.getElementById('ticketTbody');
    if (!ticketTbody) return;

    const tickets = (typeof RefugiaDB !== 'undefined') ? RefugiaDB.getTickets() : [];
    ticketTbody.innerHTML = '';

    tickets.forEach((t) => {
        const tr = document.createElement('tr');
        const badgeClass = t.status === 'Promo' ? 'badge-warning' : (t.status === 'Nonaktif' ? 'badge-danger' : 'badge-success');
        tr.innerHTML = `
            <td><strong>${t.type}</strong></td>
            <td>Rp ${t.price.toLocaleString('id-ID')}</td>
            <td>${t.desc}</td>
            <td><span class="badge ${badgeClass}">${t.status || 'Aktif'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="openTicketModal('${t.id}')" title="Edit Tarif">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteTicket('${t.id}')" title="Hapus Tarif">🗑️</button>
                </div>
            </td>
        `;
        ticketTbody.appendChild(tr);
    });
}

function openTicketModal(id) {
    const modal = document.getElementById('ticketModal');
    const title = document.getElementById('ticketModalTitle');
    if (!modal) return;

    if (id) {
        const tickets = RefugiaDB.getTickets();
        const t = tickets.find(x => String(x.id) === String(id));
        if (t) {
            title.textContent = 'Edit Tarif Tiket / Parkir';
            document.getElementById('ticketId').value = t.id;
            document.getElementById('ticketType').value = t.type;
            document.getElementById('ticketPrice').value = t.price;
            document.getElementById('ticketDesc').value = t.desc;
            document.getElementById('ticketStatus').value = t.status || 'Aktif';
        }
    } else {
        title.textContent = 'Tambah Tarif / Tiket Baru';
        document.getElementById('ticketForm').reset();
        document.getElementById('ticketId').value = '';
    }

    modal.style.display = 'flex';
}

function closeTicketModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) modal.style.display = 'none';
    if (document.getElementById('ticketForm')) document.getElementById('ticketForm').reset();
}

function deleteTicket(id) {
    if (confirm('Apakah Anda yakin ingin menghapus jenis tarif tiket ini?')) {
        RefugiaDB.deleteTicket(id);
        renderTicketTable();
    }
}

// MESSAGES FUNCTIONS
function renderMessagesTable() {
    const messageTbody = document.getElementById('messageTbody');
    const msgBadge = document.getElementById('msgCountStat');
    if (!messageTbody) return;

    const messages = (typeof RefugiaDB !== 'undefined') ? RefugiaDB.getMessages() : [];
    messageTbody.innerHTML = '';

    if (msgBadge) {
        msgBadge.textContent = messages.length;
    }

    if (messages.length === 0) {
        messageTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding:30px;">Belum ada pesan / masukan baru dari pengunjung.</td></tr>`;
        return;
    }

    messages.forEach((m) => {
        const tr = document.createElement('tr');
        const phoneClean = m.phone ? m.phone.replace(/[^0-9]/g, '') : '';
        const waUrl = phoneClean ? `https://api.whatsapp.com/send?phone=${phoneClean}&text=Halo%20${encodeURIComponent(m.name)},%20terima%20kasih%20telah%20menghubungi%20Admin%20Kebun%20Refugia%20Magetan.` : '#';

        tr.innerHTML = `
            <td><span style="font-size:12px; color:var(--text-muted);">${m.date}</span></td>
            <td><strong>${m.name}</strong></td>
            <td>${m.phone || '-'}</td>
            <td>${m.message}</td>
            <td>
                <div class="action-btns">
                    ${phoneClean ? `<button class="btn-icon btn-edit" title="Balas via WhatsApp" onclick="window.open('${waUrl}', '_blank')">💬</button>` : ''}
                    <button class="btn-icon btn-delete" title="Hapus Pesan" onclick="deleteMessage('${m.id}')">🗑️</button>
                </div>
            </td>
        `;
        messageTbody.appendChild(tr);
    });
}

function deleteMessage(id) {
    if (confirm('Apakah Anda yakin ingin menghapus pesan pesan ini dari database?')) {
        RefugiaDB.deleteMessage(id);
        renderMessagesTable();
    }
}

// FAQS FUNCTIONS
function renderFaqsTable() {
    const faqTbody = document.getElementById('faqTbody');
    if (!faqTbody) return;

    const faqs = (typeof RefugiaDB !== 'undefined') ? RefugiaDB.getFaqs() : [];
    faqTbody.innerHTML = '';

    if (faqs.length === 0) {
        faqTbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--text-muted); padding:30px;">Belum ada pertanyaan FAQ.</td></tr>`;
        return;
    }

    faqs.forEach((f) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${f.question}</strong></td>
            <td style="max-width:350px;">${f.answer}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" title="Edit FAQ" onclick="openFaqModal('${f.id}')">✏️</button>
                    <button class="btn-icon btn-delete" title="Hapus FAQ" onclick="deleteFaq('${f.id}')">🗑️</button>
                </div>
            </td>
        `;
        faqTbody.appendChild(tr);
    });
}

function openFaqModal(id) {
    const modal = document.getElementById('faqModal');
    const title = document.getElementById('faqModalTitle');
    if (!modal) return;

    if (id) {
        const faqs = RefugiaDB.getFaqs();
        const f = faqs.find(x => String(x.id) === String(id));
        if (f) {
            title.textContent = 'Edit FAQ';
            document.getElementById('faqId').value = f.id;
            document.getElementById('faqQuestion').value = f.question;
            document.getElementById('faqAnswer').value = f.answer;
        }
    } else {
        title.textContent = 'Tambah FAQ Baru';
        document.getElementById('faqForm').reset();
        document.getElementById('faqId').value = '';
    }

    modal.style.display = 'flex';
}

function closeFaqModal() {
    const modal = document.getElementById('faqModal');
    if (modal) modal.style.display = 'none';
    if (document.getElementById('faqForm')) document.getElementById('faqForm').reset();
}

function deleteFaq(id) {
    if (confirm('Hapus pertanyaan FAQ ini dari database & website publik?')) {
        RefugiaDB.deleteFaq(id);
        renderFaqsTable();
    }
}

// FACILITIES FUNCTIONS
function renderFacilitiesTable() {
    const facilityTbody = document.getElementById('facilityTbody');
    const facStat = document.getElementById('facCountStat');
    if (!facilityTbody) return;

    const facilities = (typeof RefugiaDB !== 'undefined') ? RefugiaDB.getFacilities() : [];
    facilityTbody.innerHTML = '';

    if (facStat) {
        facStat.textContent = facilities.length;
    }

    if (facilities.length === 0) {
        facilityTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding:30px;">Belum ada data fasilitas.</td></tr>`;
        return;
    }

    facilities.forEach((fac) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${fac.name}</strong></td>
            <td><span class="badge badge-warning">${fac.category}</span></td>
            <td>${fac.desc}</td>
            <td><span class="badge badge-success">${fac.status || 'Aktif'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" title="Edit Fasilitas" onclick="openFacilityModal('${fac.id}')">✏️</button>
                    <button class="btn-icon btn-delete" title="Hapus Fasilitas" onclick="deleteFacility('${fac.id}')">🗑️</button>
                </div>
            </td>
        `;
        facilityTbody.appendChild(tr);
    });
}

function openFacilityModal(id) {
    const modal = document.getElementById('facilityModal');
    const title = document.getElementById('facilityModalTitle');
    if (!modal) return;

    if (id) {
        const facilities = RefugiaDB.getFacilities();
        const fac = facilities.find(x => String(x.id) === String(id));
        if (fac) {
            title.textContent = 'Edit Fasilitas & Katalog';
            document.getElementById('facId').value = fac.id;
            document.getElementById('facName').value = fac.name;
            document.getElementById('facCategory').value = fac.category;
            document.getElementById('facDesc').value = fac.desc;
            if (document.getElementById('facImages')) {
                document.getElementById('facImages').value = fac.images ? fac.images.join(', ') : '';
            }
        }
    } else {
        title.textContent = 'Tambah Fasilitas / Lapak Baru';
        document.getElementById('facilityForm').reset();
        document.getElementById('facId').value = '';
    }

    modal.style.display = 'flex';
}

function closeFacilityModal() {
    const modal = document.getElementById('facilityModal');
    if (modal) modal.style.display = 'none';
    if (document.getElementById('facilityForm')) document.getElementById('facilityForm').reset();
}

function deleteFacility(id) {
    if (confirm('Hapus fasilitas ini?')) {
        RefugiaDB.deleteFacility(id);
        renderFacilitiesTable();
    }
}

// MEDIA & VIDEO GALLERY FUNCTIONS
function setupFilePickers() {
    document.querySelectorAll('.file-picker').forEach(picker => {
        picker.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const targetInputId = this.getAttribute('data-target-input');
            const targetPreviewId = this.getAttribute('data-target-preview');

            // Prevent localStorage quota crash on large files (> 2MB or video files)
            if (file.type.startsWith('video/') || file.size > 2 * 1024 * 1024) {
                const objectUrl = URL.createObjectURL(file);
                const filePath = 'assets/img/' + file.name;

                if (targetInputId) {
                    const input = document.getElementById(targetInputId);
                    if (input) input.value = filePath;
                }
                if (targetPreviewId) {
                    const el = document.getElementById(targetPreviewId);
                    if (el) {
                        el.src = objectUrl;
                        el.style.display = 'block';
                        const parentCard = el.closest('.media-preview-card');
                        if (parentCard) parentCard.style.display = 'flex';
                    }
                }
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                const dataUrl = evt.target.result;
                if (targetInputId) {
                    const input = document.getElementById(targetInputId);
                    if (input) input.value = dataUrl;
                }
                if (targetPreviewId) {
                    const el = document.getElementById(targetPreviewId);
                    if (el) {
                        el.src = dataUrl;
                        el.style.display = 'block';
                        const parentCard = el.closest('.media-preview-card');
                        if (parentCard) parentCard.style.display = 'flex';
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    });
}

function loadHeroSettings() {
    if (typeof RefugiaDB === 'undefined') return;
    const hero = RefugiaDB.getHeroSettings();
    if (!hero) return;

    if (document.getElementById('heroBgImgInput')) {
        document.getElementById('heroBgImgInput').value = hero.heroBgImg || '';
        const prev = document.getElementById('previewHeroBg');
        const card = document.getElementById('cardHeroBg');
        if (prev && hero.heroBgImg) {
            prev.src = hero.heroBgImg;
            prev.style.display = 'block';
            if (card) card.style.display = 'flex';
        }
    }
    if (document.getElementById('heroBadgeInput')) document.getElementById('heroBadgeInput').value = hero.heroBadge || 'Selamat Datang di';
    if (document.getElementById('heroTitle1Input')) document.getElementById('heroTitle1Input').value = hero.heroTitle1 || 'Kebun Refugia';
    if (document.getElementById('heroTitle2Input')) document.getElementById('heroTitle2Input').value = hero.heroTitle2 || 'Magetan';
    if (document.getElementById('heroTaglineInput')) document.getElementById('heroTaglineInput').value = hero.heroTagline || '';

    if (document.getElementById('stat1ValInput')) document.getElementById('stat1ValInput').value = hero.stat1Val || '200+';
    if (document.getElementById('stat1LabelInput')) document.getElementById('stat1LabelInput').value = hero.stat1Label || 'Koleksi Bunga';
    if (document.getElementById('stat2ValInput')) document.getElementById('stat2ValInput').value = hero.stat2Val || '3.5Ha';
    if (document.getElementById('stat2LabelInput')) document.getElementById('stat2LabelInput').value = hero.stat2Label || 'Area Lahan';
    if (document.getElementById('stat3ValInput')) document.getElementById('stat3ValInput').value = hero.stat3Val || '12M';
    if (document.getElementById('stat3LabelInput')) document.getElementById('stat3LabelInput').value = hero.stat3Label || 'Menara Pandang';

    if (document.getElementById('tentangTitleInput')) document.getElementById('tentangTitleInput').value = hero.tentangTitle || '';
    if (document.getElementById('tentangDesc1Input')) document.getElementById('tentangDesc1Input').value = hero.tentangDesc1 || '';
    if (document.getElementById('tentangDesc2Input')) document.getElementById('tentangDesc2Input').value = hero.tentangDesc2 || '';
    if (document.getElementById('tentangTag1Input')) document.getElementById('tentangTag1Input').value = hero.tentangTag1 || 'Wisata Alam';
    if (document.getElementById('tentangTag2Input')) document.getElementById('tentangTag2Input').value = hero.tentangTag2 || 'Edukasi Botani';
    if (document.getElementById('tentangTag3Input')) document.getElementById('tentangTag3Input').value = hero.tentangTag3 || 'Ramah Keluarga';
    if (document.getElementById('tentangImgInput')) {
        document.getElementById('tentangImgInput').value = hero.tentangImg || '';
        const prev = document.getElementById('previewTentangImg');
        const card = document.getElementById('cardTentangImg');
        if (prev && hero.tentangImg) {
            prev.src = hero.tentangImg;
            prev.style.display = 'block';
            if (card) card.style.display = 'flex';
        }
    }
    if (document.getElementById('galeriTitleInput')) document.getElementById('galeriTitleInput').value = hero.galeriTitle || 'Keseruan di Kebun Refugia Magetan';
    renderVideosTable();
}

function renderVideosTable() {
    const videoTbody = document.getElementById('videoTbody');
    if (!videoTbody) return;

    const videos = (typeof RefugiaDB !== 'undefined') ? RefugiaDB.getVideos() : [];
    videoTbody.innerHTML = '';

    if (videos.length === 0) {
        videoTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding:30px;">Belum ada video galeri yang ditambahkan.</td></tr>`;
        return;
    }

    videos.forEach((v) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${v.thumbUrl}" alt="${v.title}" style="width:70px; height:45px; object-fit:cover; border-radius:6px; border:1px solid #ccc;">
            </td>
            <td><strong>${v.title}</strong></td>
            <td><code style="font-size:12px; background:#eef4ec; padding:4px 8px; border-radius:4px; max-width:250px; overflow:hidden; text-overflow:ellipsis; display:inline-block;">${v.videoUrl}</code></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" title="Edit Video" onclick="openVideoModal('${v.id}')">✏️</button>
                    <button class="btn-icon btn-delete" title="Hapus Video" onclick="deleteVideo('${v.id}')">🗑️</button>
                </div>
            </td>
        `;
        videoTbody.appendChild(tr);
    });
}

function openVideoModal(id) {
    const modal = document.getElementById('videoModalAdmin');
    const title = document.getElementById('videoModalTitle');
    if (!modal) return;

    const cardVidUrl = document.getElementById('cardVidUrl');
    const prevVidUrl = document.getElementById('previewVidUrl');
    const cardVidThumb = document.getElementById('cardVidThumb');
    const prevVidThumb = document.getElementById('previewVidThumb');

    if (id) {
        const videos = RefugiaDB.getVideos();
        const v = videos.find(x => String(x.id) === String(id));
        if (v) {
            title.textContent = 'Edit Video Galeri';
            document.getElementById('vidId').value = v.id;
            document.getElementById('vidTitle').value = v.title;
            document.getElementById('vidUrl').value = v.videoUrl;
            document.getElementById('vidThumb').value = v.thumbUrl;

            if (prevVidUrl && v.videoUrl) {
                prevVidUrl.src = v.videoUrl;
                if (cardVidUrl) cardVidUrl.style.display = 'flex';
            }
            if (prevVidThumb && v.thumbUrl) {
                prevVidThumb.src = v.thumbUrl;
                if (cardVidThumb) cardVidThumb.style.display = 'flex';
            }
        }
    } else {
        title.textContent = 'Tambah Video Galeri Baru';
        document.getElementById('videoForm').reset();
        document.getElementById('vidId').value = '';
        if (cardVidUrl) cardVidUrl.style.display = 'none';
        if (cardVidThumb) cardVidThumb.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModalAdmin');
    if (modal) modal.style.display = 'none';
    if (document.getElementById('videoForm')) document.getElementById('videoForm').reset();
}

function deleteVideo(id) {
    if (confirm('Apakah Anda yakin ingin menghapus video galeri ini?')) {
        RefugiaDB.deleteVideo(id);
        renderVideosTable();
        alert('✓ Video Galeri Berhasil Dihapus!');
    }
}

/* =========================================
   DRAGGABLE MODAL SUPPORT (Admin Panel)
   Makes all .login-card modals draggable via title/header drag
========================================= */
(function initDraggableModals() {
    function makeDraggable(modalEl) {
        const card = modalEl.querySelector('.login-card, .modal-card, [class$="-card"]');
        if (!card) return;

        // Make the card itself draggable via header (h2 or first child)
        const header = card.querySelector('h2, h3, .modal-header');
        const handle = header || card;
        handle.style.cursor = 'move';
        handle.style.userSelect = 'none';

        // Reset position when modal opens
        card.style.position = 'relative';

        let isDragging = false;
        let startX, startY, startLeft, startTop;

        handle.addEventListener('mousedown', function(e) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = card.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            card.style.position = 'fixed';
            card.style.left = startLeft + 'px';
            card.style.top = startTop + 'px';
            card.style.margin = '0';
            card.style.zIndex = '10001';
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            card.style.left = (startLeft + dx) + 'px';
            card.style.top = (startTop + dy) + 'px';
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });

        // Touch support for mobile
        handle.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            isDragging = true;
            startX = touch.clientX;
            startY = touch.clientY;
            const rect = card.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            card.style.position = 'fixed';
            card.style.left = startLeft + 'px';
            card.style.top = startTop + 'px';
            card.style.margin = '0';
        }, { passive: true });

        document.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            const touch = e.touches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            card.style.left = (startLeft + dx) + 'px';
            card.style.top = (startTop + dy) + 'px';
        }, { passive: true });

        document.addEventListener('touchend', function() {
            isDragging = false;
        });
    }

    // Initialize draggable for all known modals when DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        // Observe new modals becoming visible
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && (node.classList.contains('login-page') || node.querySelector('.login-card'))) {
                        makeDraggable(node);
                    }
                });
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.style.display !== 'none' && target.querySelector && target.querySelector('.login-card')) {
                        makeDraggable(target);
                    }
                }
            });
        });

        // Watch for modal display changes
        document.querySelectorAll('[id$="Modal"], [id$="modal"], .login-page').forEach(function(modal) {
            makeDraggable(modal);
            observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
        });
    });
})();

/* =========================================
   UNIVERSAL PASSWORD SHOW/HIDE TOGGLE
========================================= */
document.addEventListener('click', function(e) {
    const toggleBtn = e.target.closest('.btn-toggle-password');
    if (!toggleBtn) return;

    const wrapper = toggleBtn.closest('.password-toggle-wrapper, .form-group');
    if (!wrapper) return;

    const input = wrapper.querySelector('input');
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '🙈';
        toggleBtn.title = 'Sembunyikan Password';
    } else {
        input.type = 'password';
        toggleBtn.textContent = '👁️';
        toggleBtn.title = 'Lihat Password';
    }
});
