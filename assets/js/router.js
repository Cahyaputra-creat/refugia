/* =========================================
   REFUGIA HIGH-PERFORMANCE AJAX ROUTER
   - Zero-delay instant navigation (Link Prefetching)
   - Parallel fetch & GPU-accelerated page transitions
   - Full pushState history & live DOM re-binding
   ========================================= */

const RefugiaRouter = (() => {
    let isNavigating = false;
    const pageCache = new Map(); // In-memory HTML cache for instant 0ms loads

    function init() {
        document.addEventListener('click', handleLinkClick);
        document.addEventListener('mouseover', handleLinkHover);
        document.addEventListener('touchstart', handleLinkHover, { passive: true });
        window.addEventListener('popstate', handlePopState);
        injectTransitionStyles();

        // Cache current page
        const currentPath = window.location.pathname;
        const mainContainer = document.querySelector('main') || document.querySelector('.section') || document.body;
        if (mainContainer) {
            pageCache.set(currentPath, document.documentElement.outerHTML);
        }
    }

    function injectTransitionStyles() {
        if (document.getElementById('router-transition-styles')) return;
        const style = document.createElement('style');
        style.id = 'router-transition-styles';
        style.textContent = `
            .page-transition-wrapper {
                transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: opacity, transform;
            }
            .page-fade-out {
                opacity: 0 !important;
                transform: translateY(-6px) scale(0.998) !important;
            }
            .page-fade-in {
                opacity: 1 !important;
                transform: translateY(0) scale(1) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Prefetch HTML on hover/touch for 0ms delay
    function handleLinkHover(e) {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
        if (href.includes('admin/')) return;

        try {
            const targetUrl = new URL(href, window.location.href);
            if (targetUrl.origin !== window.location.origin) return;
            prefetchPage(targetUrl.href);
        } catch (err) {}
    }

    async function prefetchPage(url) {
        const pathname = new URL(url, window.location.href).pathname;
        if (pageCache.has(pathname)) return;
        try {
            const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (res.ok) {
                const text = await res.text();
                pageCache.set(pathname, text);
            }
        } catch (e) {}
    }

    function handleLinkClick(e) {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
        if (href.includes('admin/') || href.startsWith('http://') || href.startsWith('https://')) {
            if (!href.includes(window.location.origin)) return;
        }

        const targetUrl = new URL(href, window.location.href);
        if (targetUrl.origin !== window.location.origin) return;

        if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
            e.preventDefault();
            setTimeout(closeMobileNavbar, 80);
            return;
        }

        e.preventDefault();
        updateActiveNavbarLinks(targetUrl.href); // Instant 0ms visual active highlight
        navigateTo(targetUrl.href);
        setTimeout(closeMobileNavbar, 80);
    }

    function handlePopState() {
        updateActiveNavbarLinks(window.location.href);
        navigateTo(window.location.href, false);
        setTimeout(closeMobileNavbar, 80);
    }

    async function navigateTo(url, pushHistory = true) {
        if (isNavigating) return;
        isNavigating = true;
        closeMobileNavbar();
        updateActiveNavbarLinks(url); // Ensure 0ms instant highlight

        const mainContainer = document.querySelector('main') || document.querySelector('.section') || document.body;
        const pathname = new URL(url, window.location.href).pathname;

        try {
            // Start fetch IN PARALLEL with fade out
            const fetchPromise = pageCache.has(pathname) 
                ? Promise.resolve(pageCache.get(pathname))
                : fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } }).then(res => res.text());

            // Animate fade out — also fade hero if present
            const currentHero = document.querySelector('header.hero');
            if (mainContainer) {
                mainContainer.classList.add('page-transition-wrapper');
                mainContainer.classList.add('page-fade-out');
            }
            if (currentHero) {
                currentHero.classList.add('page-transition-wrapper');
                currentHero.classList.add('page-fade-out');
            }

            const [htmlText] = await Promise.all([
                fetchPromise,
                new Promise(r => setTimeout(r, 120)) // Fast 120ms max transition
            ]);

            pageCache.set(pathname, htmlText);

            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, 'text/html');

            // 1. Sync missing head stylesheets
            newDoc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !document.querySelector(`link[href="${href}"]`)) {
                    const newLink = document.createElement('link');
                    newLink.rel = 'stylesheet';
                    newLink.href = href;
                    document.head.appendChild(newLink);
                }
            });

            // 2. CRITICAL FIX: Sync hero section (exists on Beranda/index only)
            const newHero = newDoc.querySelector('header.hero');
            const existingHero = document.querySelector('header.hero');
            const navbar = document.querySelector('.navbar, nav.navbar');

            if (newHero && !existingHero) {
                // Navigating TO Beranda: insert hero before the main section
                const heroClone = newHero.cloneNode(true);
                if (navbar && navbar.nextSibling) {
                    navbar.parentNode.insertBefore(heroClone, navbar.nextSibling);
                } else if (mainContainer) {
                    mainContainer.parentNode.insertBefore(heroClone, mainContainer);
                }
            } else if (!newHero && existingHero) {
                // Navigating AWAY from Beranda: remove hero
                existingHero.remove();
            } else if (newHero && existingHero) {
                // Both exist: update hero content (e.g. admin changed hero image)
                existingHero.innerHTML = newHero.innerHTML;
            }

            // 3. Also swap videoModal if present in new page
            const newVideoModal = newDoc.getElementById('videoModal');
            const existingVideoModal = document.getElementById('videoModal');
            if (newVideoModal && !existingVideoModal) {
                document.body.insertBefore(newVideoModal.cloneNode(true), document.querySelector('.footer, footer'));
            }

            // 4. Swap main section content
            const newMain = newDoc.querySelector('main') || newDoc.querySelector('.section') || newDoc.body;
            // Re-find mainContainer after possible DOM changes
            const updatedContainer = document.querySelector('main') || document.querySelector('.section') || document.body;

            if (newMain && updatedContainer) {
                updatedContainer.innerHTML = newMain.innerHTML;

                // Re-execute scripts inside swapped main
                updatedContainer.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            }

            if (newDoc.title) {
                document.title = newDoc.title;
            }

            if (pushHistory) {
                window.history.pushState({}, '', url);
            }

            updateActiveNavbarLinks(url);
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Animate fade in — on updated containers
            const freshContainer = document.querySelector('main') || document.querySelector('.section') || document.body;
            const freshHero = document.querySelector('header.hero');
            if (freshContainer) {
                freshContainer.classList.remove('page-fade-out');
                freshContainer.classList.add('page-transition-wrapper', 'page-fade-in');
            }
            if (freshHero) {
                freshHero.classList.remove('page-fade-out');
                freshHero.classList.add('page-transition-wrapper', 'page-fade-in');
            }

            reinitializePageScripts();

            setTimeout(() => {
                if (freshContainer) freshContainer.classList.remove('page-transition-wrapper', 'page-fade-in');
                if (freshHero) freshHero.classList.remove('page-transition-wrapper', 'page-fade-in');
            }, 200);

        } catch (err) {
            console.error('Router navigation fallback:', err);
            window.location.href = url;
        } finally {
            isNavigating = false;
        }
    }

    function closeMobileNavbar() {
        const hamburger = document.querySelector('.hamburger, #hamburger');
        const navLinks = document.querySelector('.nav-links, .nav-menu');
        if (hamburger) hamburger.classList.remove('active');
        if (navLinks) navLinks.classList.remove('active');
    }

    function updateActiveNavbarLinks(currentUrl) {
        const currentPath = new URL(currentUrl, window.location.href).pathname;
        document.querySelectorAll('.nav-links a, .nav-menu a').forEach(link => {
            const linkPath = new URL(link.getAttribute('href'), window.location.href).pathname;
            if (linkPath === currentPath || (currentPath === '/' && linkPath.endsWith('index.html'))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function reinitializePageScripts() {
        // Core public page reinit (hero, videos, hamburger, hero buttons)
        if (typeof window.reinitPublicPage === 'function') {
            window.reinitPublicPage();
        }
        // Module-specific reinit
        if (typeof window.initHamburger === 'function') {
            window.initHamburger();
        }
        if (typeof RefugiaFasilitas !== 'undefined' && typeof RefugiaFasilitas.initSlider === 'function') {
            RefugiaFasilitas.initSlider();
        }
    }

    return {
        init,
        navigateTo,
        prefetchPage
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    RefugiaRouter.init();
});
