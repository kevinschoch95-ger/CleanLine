document.addEventListener('DOMContentLoaded', () => {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.querySelector('.navbar__hamburger');
    const nav       = document.getElementById('main-nav');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('navbar--scrolled', window.scrollY > 80);
    }, { passive: true });

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('navbar__nav--open');
        hamburger.setAttribute('aria-expanded', isOpen);
        hamburger.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
        document.body.classList.toggle('nav-open', isOpen);
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && nav.classList.contains('navbar__nav--open')) {
            closeMenu();
        }
    });

    // Close menu on nav link click
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    function closeMenu() {
        nav.classList.remove('navbar__nav--open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Menü öffnen');
        document.body.classList.remove('nav-open');
    }

    // Active nav link via IntersectionObserver
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.navbar__nav a');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const active = nav.querySelector(`a[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => sectionObserver.observe(s));

    // Contact form feedback
    const form = document.querySelector('.contact__form');
    if (form) {
        form.addEventListener('submit', () => {
            const btn = form.querySelector('[type="submit"]');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = 'Wird geöffnet…';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 3000);
        });
    }

    // Scroll-triggered animation observer
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                animObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.animate').forEach(el => animObserver.observe(el));

    // Parallax — desktop only, respects reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;

    if (!prefersReducedMotion && isDesktop) {
        const parallaxEls = document.querySelectorAll('[data-parallax]');
        if (parallaxEls.length > 0) {
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        parallaxEls.forEach(el => {
                            const rate   = parseFloat(el.dataset.parallax) || 0.3;
                            const rect   = el.getBoundingClientRect();
                            const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * rate;
                            el.style.transform = `translateY(${offset}px)`;
                        });
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    // Before/After slider
    const baSlider = document.querySelector('.ba-slider');
    if (baSlider) {
        const clip      = baSlider.querySelector('.ba-clip');
        const handle    = baSlider.querySelector('.ba-handle');
        const beforeImg = clip.querySelector('.ba-img--before');
        let   pct       = 50;
        let   dragging  = false;

        function baSetPosition(clientX) {
            const rect = baSlider.getBoundingClientRect();
            pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
            clip.style.width           = pct + '%';
            handle.style.left          = pct + '%';
            // Keep before image at the slider's full pixel width so object-fit: cover works
            baSlider.style.setProperty('--ba-full-width', baSlider.offsetWidth + 'px');
        }

        // Set initial state
        baSetPosition(baSlider.getBoundingClientRect().left + baSlider.offsetWidth * 0.5);

        // Mouse
        baSlider.addEventListener('mousedown', (e) => {
            dragging = true;
            baSetPosition(e.clientX);
        });
        document.addEventListener('mousemove', (e) => {
            if (dragging) baSetPosition(e.clientX);
        });
        document.addEventListener('mouseup', () => { dragging = false; });

        // Touch
        baSlider.addEventListener('touchstart', (e) => {
            dragging = true;
            baSetPosition(e.touches[0].clientX);
        }, { passive: true });
        document.addEventListener('touchmove', (e) => {
            if (dragging) baSetPosition(e.touches[0].clientX);
        }, { passive: true });
        document.addEventListener('touchend', () => { dragging = false; });

        // Keep image width correct after resize
        window.addEventListener('resize', () => {
            baSlider.style.setProperty('--ba-full-width', baSlider.offsetWidth + 'px');
        }, { passive: true });
    }

    // Center-out card spread — pricing section, desktop only
    const packagesSection = document.querySelector('.packages');
    const spreadCols = packagesSection
        ? Array.from(packagesSection.querySelectorAll('[data-spread]'))
        : [];

    if (spreadCols.length > 0 && isDesktop && !prefersReducedMotion) {
        const MAX_PX = 72;

        function updateSpread() {
            const rect = packagesSection.getBoundingClientRect();
            const wh   = window.innerHeight;

            // progress: 0 when section center enters at viewport bottom
            //           1 when section center reaches viewport center
            // stays clamped at 1 as section scrolls further up
            const sectionMid = rect.top + rect.height / 2;
            const raw = (wh - sectionMid) / (wh / 2);
            const progress = Math.max(0, Math.min(1, raw));

            // easeOutCubic — fast spread entry, smooth settle
            const eased = 1 - Math.pow(1 - progress, 3);

            spreadCols.forEach(col => {
                const dir = parseFloat(col.dataset.spread);
                col.style.transform = `translateX(${dir * MAX_PX * eased}px)`;
            });
        }

        // Set initial state before any scroll fires
        updateSpread();

        let spreadTicking = false;
        window.addEventListener('scroll', () => {
            if (!spreadTicking) {
                requestAnimationFrame(() => {
                    updateSpread();
                    spreadTicking = false;
                });
                spreadTicking = true;
            }
        }, { passive: true });
    }

    // Ceramic packages fly-in — desktop only
    const ceramicSection = document.querySelector('.ceramic-pkgs');
    const splitCols = ceramicSection
        ? Array.from(ceramicSection.querySelectorAll('[data-split]'))
        : [];

    if (splitCols.length > 0 && isDesktop && !prefersReducedMotion) {
        const SPLIT_PX = 100;

        function updateSplit() {
            const rect = ceramicSection.getBoundingClientRect();
            const wh   = window.innerHeight;
            const sectionMid = rect.top + rect.height / 2;
            const raw = (wh - sectionMid) / (wh / 2);
            const progress = Math.max(0, Math.min(1, raw));
            const eased = 1 - Math.pow(1 - progress, 3);

            splitCols.forEach(col => {
                const dir = parseFloat(col.dataset.split);
                col.style.transform = `translateX(${dir * SPLIT_PX * eased}px)`;
            });
        }

        updateSplit();

        let splitTicking = false;
        window.addEventListener('scroll', () => {
            if (!splitTicking) {
                requestAnimationFrame(() => {
                    updateSplit();
                    splitTicking = false;
                });
                splitTicking = true;
            }
        }, { passive: true });
    }
});
