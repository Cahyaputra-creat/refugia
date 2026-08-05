/* =========================================
   REFUGIA DATABASE PERSISTENCE MODULE (RefugiaDB v3)
========================================= */

const RefugiaDB = (() => {

    const STORAGE_KEYS = {
        TICKETS: 'refugia_tickets_db_v2',
        MESSAGES: 'refugia_messages_db_v2',
        FAQS: 'refugia_faqs_db_v2',
        FACILITIES: 'refugia_facilities_db_v2',
        SETTINGS: 'refugia_settings_db_v2',
        SALES: 'refugia_sales_db_v2',
        VIDEOS: 'refugia_videos_db_v2',
        HERO: 'refugia_hero_db_v2'
    };

    // Default Seed Data
    const DEFAULT_VIDEOS = [
        {
            id: 'vid-1',
            title: 'Tonton Keseruan di Instagram',
            videoUrl: 'assets/img/video refugia 2.mp4',
            thumbUrl: 'assets/img/Tentang kami.jpeg'
        },
        {
            id: 'vid-2',
            title: 'Lihat Liputan Kebun Refugia',
            videoUrl: 'assets/img/video refugia 3.mp4',
            thumbUrl: 'assets/img/Gambar Beranda.jpg'
        },
        {
            id: 'vid-3',
            title: 'Suasana Indah Kebun Bunga',
            videoUrl: 'assets/img/video refugia 2.mp4',
            thumbUrl: 'assets/img/Tentang kami.jpeg'
        }
    ];

    const DEFAULT_HERO = {
        heroBgImg: 'assets/img/Gambar Beranda.jpg',
        heroBadge: 'Selamat Datang di',
        heroTitle1: 'Kebun Refugia',
        heroTitle2: 'Magetan',
        heroTagline: 'Nikmati keindahan hamparan bunga yang memukau dengan latar megah Gunung Lawu, serta berbagai spot wisata menarik yang cocok untuk dinikmati bersama seluruh keluarga.',
        stat1Val: '200+',
        stat1Label: 'Koleksi Bunga',
        stat2Val: '3.5Ha',
        stat2Label: 'Area Lahan',
        stat3Val: '12M',
        stat3Label: 'Menara Pandang',
        tentangTitle: 'Pesona Keindahan Alam di Kaki Gunung Lawu',
        tentangDesc1: 'Kebun Refugia Magetan awalnya merupakan inisiatif lahan untuk menanam bunga hias yang berfungsi sebagai pengalih hama tanaman. Namun, berkat keindahannya, kini bertransformasi menjadi destinasi agrowisata favorit yang memanjakan mata.',
        tentangDesc2: 'Dengan latar belakang Gunung Lawu yang megah dan udara sejuk pegunungan, tempat ini menjadi lokasi yang sempurna untuk melepas penat dan berkreasi dengan fotografi.',
        tentangImg: 'assets/img/Tentang kami.jpeg',
        tentangTag1: 'Wisata Alam',
        tentangTag2: 'Edukasi Botani',
        tentangTag3: 'Ramah Keluarga',
        galeriTitle: 'Keseruan di Kebun Refugia Magetan'
    };

    const DEFAULT_TICKETS = [
        { id: '1', type: 'Anak-anak', price: 5000, desc: 'Untuk usia di bawah 12 tahun', status: 'Aktif', category: 'Utama' },
        { id: '2', type: 'Dewasa', price: 10000, desc: 'Untuk usia 12 tahun ke atas', status: 'Aktif', category: 'Utama' },
        { id: '3', type: 'Parkir Motor', price: 2000, desc: 'Kendaraan Roda 2', status: 'Aktif', category: 'Parkir' },
        { id: '4', type: 'Parkir Mobil', price: 5000, desc: 'Kendaraan Roda 4', status: 'Aktif', category: 'Parkir' },
        { id: '5', type: 'Parkir Bus', price: 10000, desc: 'Kendaraan Roda 6+', status: 'Aktif', category: 'Parkir' }
    ];

    const DEFAULT_FAQS = [
        {
            id: 'faq-1',
            question: 'Berapa harga tiket masuk Kebun Refugia?',
            answer: 'Harga tiket masuk adalah Rp 10.000 untuk Dewasa dan Rp 5.000 untuk Anak-anak (di bawah 12 tahun). Menariknya, potongan tiket Anda dapat ditukarkan dengan sayuran gratis saat pulang!'
        },
        {
            id: 'faq-2',
            question: 'Jam berapa Kebun Refugia buka?',
            answer: 'Kami buka setiap hari (Senin - Minggu) mulai pukul 08.00 WIB hingga 17.00 WIB. Waktu terbaik untuk berkunjung adalah pagi hari untuk mendapatkan udara tersejuk dan pencahayaan foto yang sempurna.'
        },
        {
            id: 'faq-3',
            question: 'Fasilitas apa saja yang tersedia?',
            answer: 'Fasilitas unggulan kami meliputi Hamparan Spot Foto Bunga, Menara Pandang, Taman Kelinci (Ramah Anak), Gazebo Istirahat, Masjid Ki Mageti, Area Parkir luas, Toilet yang bersih, serta Lapak Petani untuk berbelanja hasil bumi dan oleh-oleh.'
        },
        {
            id: 'faq-4',
            question: 'Di mana lokasi tepatnya?',
            answer: 'Lokasi Kebun Refugia sangat strategis dan mudah diakses. Berada tepat di pinggir jalan raya utama menuju objek wisata Telaga Sarangan, yaitu di Jl. Raya Sarangan, Plaosan II, Kec. Plaosan, Kabupaten Magetan.'
        }
    ];

    const DEFAULT_FACILITIES = [
        { id: 'fac-1', name: 'Spot Foto Hamparan Bunga', category: 'Fotografi', desc: 'Hamparan bunga refugia beraneka warna yang ditata rapi.', status: 'Aktif' },
        { id: 'fac-2', name: 'Taman Kelinci', category: 'Interaksi Anak', desc: 'Area bermain & memberi makan kelinci secara langsung.', status: 'Aktif' },
        { id: 'fac-3', name: 'Lapak Souvenir & Kerajinan', category: 'Belanja', desc: 'Souvenir eksklusif, kaos, & kerajinan tangan Magetan.', status: 'Aktif' }
    ];

    const DEFAULT_MESSAGES = [
        {
            id: 'MSG-101',
            date: '25 Juli 2026',
            name: 'Rina Wijaya',
            phone: '6281234567890',
            message: 'Tempatnya sangat asri dan bersih! Mohon diperbanyak tempat duduk bersantai di dekat kolam anak.',
            status: 'Baru'
        },
        {
            id: 'MSG-102',
            date: '26 Juli 2026',
            name: 'Budi Kurniawan',
            phone: '6285712345678',
            message: 'Apakah untuk rombongan bus 50 orang ada potongan harga khusus? Terima kasih admin.',
            status: 'Dibaca'
        }
    ];

    const DEFAULT_SETTINGS = {
        jamBuka: 'Setiap Hari: 08.00 - 17.00 WIB',
        phoneAdmin: '0859-3148-6608',
        tagline: 'Menyajikan keindahan alam dan edukasi tanaman bagi seluruh keluarga di Magetan.',
        qrisAccount: 'TAMAN REFUGIA MAGETAN',
        qrisUrl: 'assets/img/Qrish Kebun Refugia Magetan.png'
    };

    const DEFAULT_SALES = [];

    // Safe LocalStorage helpers
    const getItem = (key, fallback) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (e) {
            console.warn('LocalStorage read error, using fallback', e);
            return fallback;
        }
    };

    const setItem = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            window.dispatchEvent(new Event('refugia_db_updated'));
        } catch (e) {
            console.error('LocalStorage write error', e);
        }
    };

    // Public API
    return {
        // SETTINGS API
        getSettings: () => getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
        saveSettings: (newSettings) => {
            const current = getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
            const updated = { ...current, ...newSettings };
            setItem(STORAGE_KEYS.SETTINGS, updated);

            if (newSettings.jamBuka) {
                const faqs = getItem(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
                const faqJam = faqs.find(f => f.id === 'faq-2' || f.question.toLowerCase().includes('jam'));
                if (faqJam) {
                    faqJam.answer = `Kami buka ${newSettings.jamBuka}. Waktu terbaik untuk berkunjung adalah pagi hari untuk mendapatkan udara tersejuk dan pencahayaan foto yang sempurna.`;
                    setItem(STORAGE_KEYS.FAQS, faqs);
                }
            }
            return updated;
        },

        // TICKETS API
        getTickets: () => getItem(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS),
        saveTicket: (ticketData) => {
            const tickets = getItem(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
            if (ticketData.id) {
                const idx = tickets.findIndex(t => String(t.id) === String(ticketData.id));
                if (idx !== -1) {
                    tickets[idx] = { ...tickets[idx], ...ticketData };
                }
            } else {
                const newT = {
                    id: 't-' + Date.now(),
                    type: ticketData.type,
                    price: parseInt(ticketData.price, 10) || 0,
                    desc: ticketData.desc || '',
                    status: ticketData.status || 'Aktif',
                    category: ticketData.category || 'Umum'
                };
                tickets.push(newT);
            }
            setItem(STORAGE_KEYS.TICKETS, tickets);
        },
        deleteTicket: (id) => {
            let tickets = getItem(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
            tickets = tickets.filter(t => String(t.id) !== String(id));
            setItem(STORAGE_KEYS.TICKETS, tickets);
        },

        // SALES / TRANSACTIONS API (PENCATATAN TIKET LOKET MANUAL)
        getSales: () => getItem(STORAGE_KEYS.SALES, DEFAULT_SALES),
        addSale: (saleData) => {
            const sales = getItem(STORAGE_KEYS.SALES, DEFAULT_SALES);
            const qty = parseInt(saleData.qty, 10) || 1;
            const price = parseInt(saleData.price, 10) || 0;
            const newSale = {
                id: 'TRX-' + Math.floor(100 + Math.random() * 900),
                date: saleData.date || new Date().toISOString().split('T')[0],
                ticketType: saleData.ticketType || 'Tiket Masuk',
                price: price,
                qty: qty,
                total: price * qty,
                notes: saleData.notes || 'Pencatatan Manual Loket'
            };
            sales.unshift(newSale);
            setItem(STORAGE_KEYS.SALES, sales);
            return newSale;
        },
        deleteSale: (id) => {
            let sales = getItem(STORAGE_KEYS.SALES, DEFAULT_SALES);
            sales = sales.filter(s => String(s.id) !== String(id));
            setItem(STORAGE_KEYS.SALES, sales);
        },

        // MESSAGES API
        getMessages: () => getItem(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES),
        addMessage: (msgData) => {
            const messages = getItem(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
            const newMsg = {
                id: 'MSG-' + Math.floor(100 + Math.random() * 900),
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                name: msgData.name || 'Pengunjung Anonim',
                phone: msgData.phone ? String(msgData.phone).replace(/[^0-9]/g, '') : '',
                message: msgData.message || '',
                status: 'Baru'
            };
            messages.unshift(newMsg);
            setItem(STORAGE_KEYS.MESSAGES, messages);
            return newMsg;
        },
        deleteMessage: (id) => {
            let messages = getItem(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
            messages = messages.filter(m => m.id !== id);
            setItem(STORAGE_KEYS.MESSAGES, messages);
        },

        // FAQS API
        getFaqs: () => getItem(STORAGE_KEYS.FAQS, DEFAULT_FAQS),
        saveFaq: (faqData) => {
            const faqs = getItem(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
            if (faqData.id) {
                const idx = faqs.findIndex(f => String(f.id) === String(faqData.id));
                if (idx !== -1) {
                    faqs[idx] = { ...faqs[idx], ...faqData };
                }
            } else {
                const newFaq = {
                    id: 'faq-' + (faqs.length + 1) + '-' + Date.now(),
                    question: faqData.question,
                    answer: faqData.answer
                };
                faqs.push(newFaq);
            }
            setItem(STORAGE_KEYS.FAQS, faqs);
        },
        deleteFaq: (id) => {
            let faqs = getItem(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
            faqs = faqs.filter(f => f.id !== id);
            setItem(STORAGE_KEYS.FAQS, faqs);
        },

        // FACILITIES API
        getFacilities: () => getItem(STORAGE_KEYS.FACILITIES, DEFAULT_FACILITIES),
        saveFacility: (facData) => {
            const facilities = getItem(STORAGE_KEYS.FACILITIES, DEFAULT_FACILITIES);
            if (facData.id) {
                const idx = facilities.findIndex(f => String(f.id) === String(facData.id));
                if (idx !== -1) {
                    facilities[idx] = { ...facilities[idx], ...facData };
                }
            } else {
                const newFac = {
                    id: 'fac-' + (facilities.length + 1) + '-' + Date.now(),
                    name: facData.name,
                    category: facData.category || 'Umum',
                    desc: facData.desc || '',
                    status: facData.status || 'Aktif'
                };
                facilities.push(newFac);
            }
            setItem(STORAGE_KEYS.FACILITIES, facilities);
        },
        deleteFacility: (id) => {
            let facilities = getItem(STORAGE_KEYS.FACILITIES, DEFAULT_FACILITIES);
            facilities = facilities.filter(f => f.id !== id);
            setItem(STORAGE_KEYS.FACILITIES, facilities);
        },

        // VIDEOS API
        getVideos: () => getItem(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS),
        saveVideo: (videoData) => {
            const videos = getItem(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS);
            if (videoData.id) {
                const idx = videos.findIndex(v => String(v.id) === String(videoData.id));
                if (idx !== -1) {
                    videos[idx] = { ...videos[idx], ...videoData };
                }
            } else {
                const newVid = {
                    id: 'vid-' + Date.now(),
                    title: videoData.title || 'Video Keseruan',
                    videoUrl: videoData.videoUrl || 'assets/img/video refugia 2.mp4',
                    thumbUrl: videoData.thumbUrl || 'assets/img/Tentang kami.jpeg'
                };
                videos.push(newVid);
            }
            setItem(STORAGE_KEYS.VIDEOS, videos);
        },
        deleteVideo: (id) => {
            let videos = getItem(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS);
            videos = videos.filter(v => String(v.id) !== String(id));
            setItem(STORAGE_KEYS.VIDEOS, videos);
        },

        // HERO MEDIA API
        getHeroSettings: () => getItem(STORAGE_KEYS.HERO, DEFAULT_HERO),
        saveHeroSettings: (heroData) => {
            const current = getItem(STORAGE_KEYS.HERO, DEFAULT_HERO);
            const updated = { ...current, ...heroData };
            delete updated.heroTitle; // Remove legacy heroTitle string to prevent override bugs
            setItem(STORAGE_KEYS.HERO, updated);
            return updated;
        }
    };
})();
