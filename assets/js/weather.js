/* =========================================
   REFUGIA REAL-TIME WEATHER WIDGET (Open-Meteo API)
   Location: Plaosan, Magetan (Kaki Gunung Lawu)
   Coordinates: -7.659, 111.325
   Includes 10-minute sessionStorage caching for 0ms instant load
   ========================================= */

const RefugiaWeather = (() => {

    const LAT = -7.659;
    const LON = 111.325;
    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`;
    const CACHE_KEY = 'refugia_weather_cache_v1';
    const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

    const WMO_MAP = {
        0: { text: 'Cerah Pegunungan', icon: '☀️' },
        1: { text: 'Cerah Berawan', icon: '🌤️' },
        2: { text: 'Berawan Sejuk', icon: '⛅' },
        3: { text: 'Mendung Syahdu', icon: '☁️' },
        45: { text: 'Kabut Tipis Sejuk', icon: '🌫️' },
        48: { text: 'Berkabut Tebal', icon: '🌫️' },
        51: { text: 'Gerimis Ringan', icon: '🌦️' },
        53: { text: 'Gerimis Sedang', icon: '🌧️' },
        55: { text: 'Hujan Pegunungan', icon: '🌧️' },
        61: { text: 'Hujan Ringan', icon: '🌧️' },
        63: { text: 'Hujan Sedang', icon: '🌧️' },
        65: { text: 'Hujan Lebat', icon: '⛈️' },
        80: { text: 'Hujan Lokal', icon: '🌦️' },
        81: { text: 'Hujan Deras', icon: '⛈️' }
    };

    const getCondition = (code) => {
        return WMO_MAP[code] || { text: 'Cerah Berawan', icon: '🌤️' };
    };

    const fetchWeather = async () => {
        // 1. Check Session Cache
        try {
            const cachedData = sessionStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                if (Date.now() - parsed.timestamp < CACHE_TTL) {
                    return parsed.data;
                }
            }
        } catch (e) {}

        // 2. Fetch Fresh Data
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('API response error');
            const data = await res.json();

            if (data && data.current_weather) {
                const temp = Math.round(data.current_weather.temperature);
                const code = data.current_weather.weathercode;
                const cond = getCondition(code);
                const result = {
                    success: true,
                    temp: temp,
                    text: cond.text,
                    icon: cond.icon,
                    wind: data.current_weather.windspeed
                };

                try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: result }));
                } catch (e) {}

                return result;
            }
        } catch (e) {
            console.warn('Gagal memuat API cuaca, menggunakan data sejuk pegunungan.', e);
        }

        // Fallback Data
        return {
            success: false,
            temp: 22,
            text: 'Cerah Berawan (Sejuk Pegunungan)',
            icon: '🌤️',
            wind: 10
        };
    };

    const initWidgets = async () => {
        const containers = document.querySelectorAll('.weather-widget-container, #weatherWidget');
        if (containers.length === 0) return;

        const weather = await fetchWeather();

        containers.forEach(el => {
            el.innerHTML = `
                <div class="weather-badge-pill" title="Cuaca Terkini Kebun Refugia Magetan (Kaki Gunung Lawu)">
                    <span class="w-icon">${weather.icon}</span>
                    <span class="w-temp">${weather.temp}°C</span>
                    <span class="w-text">· ${weather.text}</span>
                </div>
            `;
        });
    };

    document.addEventListener('DOMContentLoaded', initWidgets);

    return {
        fetchWeather,
        initWidgets
    };
})();
