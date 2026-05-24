'use strict';

const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


(function () {
    const navbar = qs('#navbar');
    const toggle = qs('#navToggle');
    const navLinks = qs('#navLinks');
    let open = false;

    function setMenu(state) {
        open = state;
        toggle.classList.toggle('active', state);
        toggle.setAttribute('aria-expanded', String(state));
        navLinks.classList.toggle('open', state);
        navbar.classList.toggle('menu-open', state);
        document.body.style.overflow = state ? 'hidden' : '';
    }

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    toggle.addEventListener('click', () => setMenu(!open));
    qsa('a', navLinks).forEach(a => a.addEventListener('click', () => setMenu(false)));

    document.addEventListener('click', e => {
        if (open && !navbar.contains(e.target)) setMenu(false);
    });
})();



(function () {
    const items = qsa('.reveal, .reveal-left, .reveal-right');
    if (!items.length) return;

    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('active');
            io.unobserve(entry.target);
        }
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    items.forEach(el => io.observe(el));
})();



(function () {
    const counters = qsa('.counter');
    if (!counters.length) return;

    function run(el) {
        const target = parseInt(el.dataset.target, 10);
        const step = target / 120; 
        let value = 0;

        (function tick() {
            value += step;
            if (value < target) {
                el.textContent = Math.floor(value).toLocaleString('es-AR');
                requestAnimationFrame(tick);
            } else {
                el.textContent = target.toLocaleString('es-AR') + '+';
            }
        })();
    }

    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            run(entry.target);
            io.unobserve(entry.target);
        }
    }, { threshold: 0.5 });

    counters.forEach(el => io.observe(el));
})();


const smooth = (function () {
    let target = window.scrollY;
    let current = window.scrollY;
    let running = false;

    const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clamp = (y) => Math.max(0, Math.min(y, maxY()));

    function frame() {
        current += (target - current) * 0.15;
        if (Math.abs(target - current) < 0.5) current = target;
        window.scrollTo(0, current);
        if (current !== target) {
            requestAnimationFrame(frame);
        } else {
            running = false;
        }
    }

    function to(y) {
        target = clamp(y);
        if (!running) {
            running = true;
            current = window.scrollY;
            requestAnimationFrame(frame);
        }
    }

    return {
        to,
        by: (dy) => to((running ? target : window.scrollY) + dy),
        sync: () => { if (!running) { target = current = window.scrollY; } }
    };
})();

function scrollToTarget(el) {
    smooth.to(el.getBoundingClientRect().top + window.scrollY - 80);
}


if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return; 

        for (let node = e.target; node && node !== document.body; node = node.parentElement) {
            if (node.scrollHeight > node.clientHeight && /(auto|scroll)/.test(getComputedStyle(node).overflowY)) return;
        }

        let dy = e.deltaY;
        if (e.deltaMode === 1) dy *= 16;
        else if (e.deltaMode === 2) dy *= window.innerHeight;

        e.preventDefault();
        smooth.by(dy);
    }, { passive: false });

    window.addEventListener('scroll', () => smooth.sync(), { passive: true });
}

document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;

    const target = qs(id);
    if (!target) return;

    e.preventDefault();
    scrollToTarget(target);
});



(function () {
    const form = qs('#contactForm');
    const btn = qs('#formSubmit');
    if (!form || !btn) return;

    const phone = '5493525403637';
    const defaultLabel = btn.innerHTML;

    const armarMensaje = ({ nombre, telefono, lugar, mensaje }) => [
        'Hola, quiero consultar por un servicio.',
        '',
        `Nombre: ${nombre}`,
        `Tel\u{00E9}fono: ${telefono}`,
        `Lugar: ${lugar}`,
        '',
        'Necesito llevar:',
        mensaje,
    ].join('\n');

    form.addEventListener('submit', e => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = {
            nombre: qs('#nombre').value.trim(),
            telefono: qs('#telefono').value.trim(),
            lugar: qs('#lugar').value.trim(),
            mensaje: qs('#mensaje').value.trim(),
        };

        if (!data.nombre || !data.telefono || !data.lugar || !data.mensaje) {
            form.reportValidity();
            return;
        }

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(armarMensaje(data))}`;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Abriendo WhatsApp...';
        btn.disabled = true;
        window.open(url, '_blank', 'noopener');

        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> \u{00A1}Listo! Te esperamos';
            btn.style.background = 'linear-gradient(135deg, #25D366, #1da851)';

            setTimeout(() => {
                btn.innerHTML = defaultLabel;
                btn.disabled = false;
                btn.style.background = '';
                form.reset();
            }, 3500);
        }, 600);
    });
})();


(function () {
    const arrow = qs('.hero-scroll');
    if (!arrow) return;
    arrow.addEventListener('click', () => {
        const target = qs('#servicios');
        if (target) scrollToTarget(target);
    });
})();
