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
            closeMobileNavbar();
            return;
        }

        e.preventDefault();
        closeMobileNavbar();
        updateActiveNavbarLinks(targetUrl.href); // Instant 0ms visual active highlight
        navigateTo(targetUrl.href);
    }

    function handlePopState() {
        closeMobileNavbar();
        updateActiveNavbarLinks(window.location.href);
        navigateTo(window.location.href, false);
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

            // Animate fade out
            if (mainContainer) {
                mainContainer.classList.add('page-transition-wrapper');
                mainContainer.classList.add('page-fade-out');
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

            const newMain = newDoc.querySelector('main') || newDoc.querySelector('.section') || newDoc.body;

            if (newMain && mainContainer) {
                mainContainer.innerHTML = newMain.innerHTML;

                // Re-execute scripts inside swapped main
                mainContainer.querySelectorAll('script').forEach(oldScript => {
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

            if (mainContainer) {
                mainContainer.classList.remove('page-fade-out');
                mainContainer.classList.add('page-fade-in');
            }

            reinitializePageScripts();

            setTimeout(() => {
                if (mainContainer) mainContainer.classList.remove('page-transition-wrapper', 'page-fade-in');
            }, 200);

        } catch (err) {
            console.error('Router navigation fallback:', err);
            window.location.href = url;
        } finally {
            isNavigating = false;
        }
    }

    function closeMobileNavbar() {
        const hamburger = document.querySelector('.hamburger, #hamburger, .menu-toggle');
        const navLinks = document.querySelector('.nav-links, .nav-menu');
        if (hamburger) hamburger.classList.remove('active');
        if (navLinks) navLinks.classList.remove('active');
    }

    function updateActiveNavbarLinks(currentUrl) {
        closeMobileNavbar();
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
        if (typeof window.reinitPublicPage === 'function') {
            window.reinitPublicPage();
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
