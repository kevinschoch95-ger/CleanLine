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
});
