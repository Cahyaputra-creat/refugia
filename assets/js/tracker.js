/* =========================================================================
   REFUGIA REAL-TIME GLOBAL CLOUD VISITOR TRACKER & MULTI-DEVICE SYNC ENGINE
========================================================================= */
(function() {
    const STORAGE_KEY = 'refugia_web_analytics_v3';
    const BROADCAST_NAME = 'refugia_traffic_channel';
    const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(BROADCAST_NAME) : null;

    function getAnalytics() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {
                totalViews: 0,
                uniqueVisitors: 0,
                pages: {
                    'Beranda Utama': 0,
                    'Fasilitas & Kuliner': 0,
                    'Pemesanan Tiket': 0,
                    'Lapak & Kontak': 0,
                    'FAQ & Saran': 0
                }
            };
        } catch(e) {
            return {
                totalViews: 0,
                uniqueVisitors: 0,
                pages: {
                    'Beranda Utama': 0,
                    'Fasilitas & Kuliner': 0,
                    'Pemesanan Tiket': 0,
                    'Lapak & Kontak': 0,
                    'FAQ & Saran': 0
                }
            };
        }
    }

    function saveAnalytics(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            window.dispatchEvent(new Event('refugia_db_updated'));
            if (bc) bc.postMessage({ type: 'TRAFFIC_UPDATE', data: data });
        } catch(e) {}
    }

    async function trackVisit() {
        if (window.location.pathname.includes('/admin')) return;

        let pageName = 'Beranda Utama';
        let pageKey = 'beranda';
        const path = window.location.pathname.toLowerCase();
        
        if (path.includes('fasilitas')) {
            pageName = 'Fasilitas & Kuliner';
            pageKey = 'fasilitas';
        } else if (path.includes('pemesanan')) {
            pageName = 'Pemesanan Tiket';
            pageKey = 'pemesanan';
        } else if (path.includes('kontak')) {
            pageName = 'Lapak & Kontak';
            pageKey = 'kontak';
        } else if (path.includes('faq')) {
            pageName = 'FAQ & Saran';
            pageKey = 'faq';
        } else if (path.includes('lokasi')) {
            pageName = 'Lokasi & Peta';
            pageKey = 'lokasi';
        }

        const data = getAnalytics();
        data.totalViews = (data.totalViews || 0) + 1;
        if (!data.pages) data.pages = {};
        data.pages[pageName] = (data.pages[pageName] || 0) + 1;

        saveAnalytics(data);

        // Ping Global Cloud Counters (Works across all mobile networks & devices)
        try {
            fetch(`https://api.counterapi.dev/v1/refugia_magetan_2026/views/up`).catch(() => {});
            fetch(`https://api.counterapi.dev/v1/refugia_magetan_2026/page_${pageKey}/up`).catch(() => {});
        } catch(e) {}
    }

    async function syncGlobalCloudData() {
        const local = getAnalytics();
        try {
            const res = await fetch(`https://api.counterapi.dev/v1/refugia_magetan_2026/views`);
            if (res.ok) {
                const json = await res.json();
                if (json && typeof json.count === 'number') {
                    local.totalViews = Math.max(local.totalViews, json.count);
                }
            }

            const pageKeys = [
                { key: 'page_beranda', name: 'Beranda Utama' },
                { key: 'page_fasilitas', name: 'Fasilitas & Kuliner' },
                { key: 'page_pemesanan', name: 'Pemesanan Tiket' },
                { key: 'page_kontak', name: 'Lapak & Kontak' },
                { key: 'page_faq', name: 'FAQ & Saran' }
            ];

            for (const p of pageKeys) {
                try {
                    const pRes = await fetch(`https://api.counterapi.dev/v1/refugia_magetan_2026/${p.key}`);
                    if (pRes.ok) {
                        const pData = await pRes.json();
                        if (pData && typeof pData.count === 'number') {
                            local.pages[p.name] = Math.max(local.pages[p.name] || 0, pData.count);
                        }
                    }
                } catch(e) {}
            }

            saveAnalytics(local);
        } catch(err) {}
        return local;
    }

    if (bc) {
        bc.onmessage = function(ev) {
            if (ev.data && ev.data.type === 'TRAFFIC_UPDATE') {
                saveAnalytics(ev.data.data);
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackVisit);
    } else {
        trackVisit();
    }

    window.RefugiaTracker = {
        getAnalytics: getAnalytics,
        syncGlobalCloudData: syncGlobalCloudData
    };
})();
