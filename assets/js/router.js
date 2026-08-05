/* =========================================
   REFUGIA AJAX ROUTER & SPA NAVIGATOR
   Provides ultra-smooth dynamic page transitions
   with pushState history and live DOM re-render
   ========================================= */

const RefugiaRouter = (() => {
    let isNavigating = false;

    // Initialize router interceptors
    function init() {
        document.addEventListener('click', handleLinkClick);
        window.addEventListener('popstate', handlePopState);
        injectTransitionStyles();
    }

    // CSS for smooth fade & slide transitions
    function injectTransitionStyles() {
        if (document.getElementById('router-transition-styles')) return;
        const style = document.createElement('style');
        style.id = 'router-transition-styles';
        style.textContent = `
            .page-transition-wrapper {
                transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: opacity, transform;
            }
            .page-fade-out {
                opacity: 0 !important;
                transform: translateY(-8px) scale(0.995) !important;
            }
            .page-fade-in {
                opacity: 1 !important;
                transform: translateY(0) scale(1) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Intercept <a> link clicks
    function handleLinkClick(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip anchors, javascript:, external links, and admin area
        if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
        if (href.includes('admin/') || href.startsWith('http://') || href.startsWith('https://')) {
            if (!href.includes(window.location.origin)) return;
        }

        // Normalize target URL
        const targetUrl = new URL(href, window.location.href);
        if (targetUrl.origin !== window.location.origin) return;

        // Ignore same page clicks
        if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        navigateTo(targetUrl.href);
    }

    // Handle browser Back / Forward buttons
    function handlePopState() {
        navigateTo(window.location.href, false);
    }

    // Core AJAX Navigation method
    async function navigateTo(url, pushHistory = true) {
        if (isNavigating) return;
        isNavigating = true;

        const mainContainer = document.querySelector('main') || document.querySelector('.section') || document.body;

        try {
            // 1. Fade out current content
            if (mainContainer) {
                mainContainer.classList.add('page-transition-wrapper');
                mainContainer.classList.add('page-fade-out');
            }

            await new Promise(r => setTimeout(r, 220));

            // 2. Fetch new page HTML
            const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!response.ok) throw new Error('Page fetch failed: ' + response.status);

            const htmlText = await response.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, 'text/html');

            // 3. Swap main content & title
            const newMain = newDoc.querySelector('main') || newDoc.querySelector('.section') || newDoc.body;
            if (newMain && mainContainer) {
                mainContainer.innerHTML = newMain.innerHTML;
            }
            if (newDoc.title) {
                document.title = newDoc.title;
            }

            // 4. Update browser URL history if requested
            if (pushHistory) {
                window.history.pushState({}, '', url);
            }

            // 5. Update Navbar Active States
            updateActiveNavbarLinks(url);

            // 6. Scroll smoothly to top
            window.scrollTo({ top: 0, behavior: 'instant' });

            // 7. Fade in new content
            if (mainContainer) {
                mainContainer.classList.remove('page-fade-out');
                mainContainer.classList.add('page-fade-in');
            }

            // 8. Re-initialize components for newly loaded page
            reinitializePageScripts();

            setTimeout(() => {
                if (mainContainer) mainContainer.classList.remove('page-transition-wrapper', 'page-fade-in');
            }, 300);

        } catch (err) {
            console.error('AJAX Router navigation error:', err);
            window.location.href = url; // Fallback to traditional reload if error
        } finally {
            isNavigating = false;
        }
    }

    // Update navbar active CSS classes
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

    // Trigger component re-renders after AJAX content swap
    function reinitializePageScripts() {
        if (typeof window.reinitPublicPage === 'function') {
            window.reinitPublicPage();
        }
    }

    return {
        init,
        navigateTo
    };
})();

// Auto Init on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    RefugiaRouter.init();
});
