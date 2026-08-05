/* =========================================
   REFUGIA HIGH-PERFORMANCE AJAX ROUTER
   - Zero-delay instant navigation (Link Prefetching)
   - Parallel fetch & GPU-accelerated page transitions
   - Full pushState history & live DOM re-binding
   - Swaps ALL content between navbar and footer
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
        pageCache.set(currentPath, document.documentElement.outerHTML);
    }

    function injectTransitionStyles() {
        if (document.getElementById('router-transition-styles')) return;
        const style = document.createElement('style');
        style.id = 'router-transition-styles';
        style.textContent = `
            #app-wrapper {
                transition: opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1), transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: opacity, transform;
            }
            #app-wrapper.fade-out {
                opacity: 0 !important;
                transform: translateY(-6px) scale(0.998) !important;
            }
            #app-wrapper.fade-in {
                opacity: 1 !important;
                transform: translateY(0) scale(1) !important;
            }
        `;
        document.head.appendChild(style);
    }

    /* =========================================
       Get or create the #app-wrapper div which
       wraps ALL page content between navbar & footer.
       This is created dynamically if not in HTML.
    ========================================= */
    function getOrCreateWrapper() {
        let wrapper = document.getElementById('app-wrapper');
        if (wrapper) return wrapper;

        // Create wrapper and move all body content between nav and footer into it
        wrapper = document.createElement('div');
        wrapper.id = 'app-wrapper';

        const navbar = document.querySelector('nav.navbar, .navbar');
        const footer = document.querySelector('footer.footer, footer');

        if (!navbar || !footer) return null;

        // Collect elements between navbar and footer (exclude scripts at body end)
        const toMove = [];
        let node = navbar.nextSibling;
        while (node && node !== footer) {
            toMove.push(node);
            node = node.nextSibling;
        }

        // Move elements into wrapper
        toMove.forEach(el => wrapper.appendChild(el));

        // Insert wrapper before footer
        footer.parentNode.insertBefore(wrapper, footer);
        return wrapper;
    }

    /* =========================================
       Extract page content from parsed HTML doc:
       All elements between navbar and footer.
    ========================================= */
    function extractPageContent(doc) {
        const navbar = doc.querySelector('nav.navbar, .navbar');
        const footer = doc.querySelector('footer.footer, footer');

        if (!navbar || !footer) {
            // Fallback: return body content
            return doc.body.innerHTML;
        }

        const fragment = doc.createDocumentFragment();
        let node = navbar.nextSibling;
        while (node && node !== footer) {
            const next = node.nextSibling;
            // Skip trailing scripts
            if (node.tagName !== 'SCRIPT') {
                fragment.appendChild(node.cloneNode(true));
            }
            node = next;
        }

        const temp = doc.createElement('div');
        temp.appendChild(fragment);
        return temp.innerHTML;
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
        updateActiveNavbarLinks(url);

        const pathname = new URL(url, window.location.href).pathname;

        try {
            // Start fetch IN PARALLEL with fade out
            const fetchPromise = pageCache.has(pathname)
                ? Promise.resolve(pageCache.get(pathname))
                : fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } }).then(res => res.text());

            // Ensure wrapper exists and animate fade out
            const wrapper = getOrCreateWrapper();
            if (wrapper) {
                wrapper.classList.remove('fade-in');
                wrapper.classList.add('fade-out');
            }

            const [htmlText] = await Promise.all([
                fetchPromise,
                new Promise(r => setTimeout(r, 150)) // 150ms fade out
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

            // 2. Swap ALL page content (hero + all sections + modals) between nav and footer
            const newContent = extractPageContent(newDoc);
            const currentWrapper = getOrCreateWrapper();

            if (currentWrapper) {
                currentWrapper.innerHTML = newContent;

                // Re-execute any inline scripts inside swapped content
                currentWrapper.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            }

            // 3. Update title
            if (newDoc.title) {
                document.title = newDoc.title;
            }

            if (pushHistory) {
                window.history.pushState({}, '', url);
            }

            updateActiveNavbarLinks(url);
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Animate fade in
            const freshWrapper = document.getElementById('app-wrapper');
            if (freshWrapper) {
                freshWrapper.classList.remove('fade-out');
                freshWrapper.classList.add('fade-in');
                setTimeout(() => freshWrapper.classList.remove('fade-in'), 250);
            }

            reinitializePageScripts();

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
