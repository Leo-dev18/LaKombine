/* =========================================================
   La Kombine — interações do site
   Vanilla JS, sem dependências.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ano no rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Nav: sombra ao rolar ---------- */
  var nav = document.getElementById('nav');
  var lastStuck = null;

  function onScroll() {
    var stuck = window.scrollY > 24;
    if (stuck !== lastStuck) {
      nav.classList.toggle('is-stuck', stuck);
      lastStuck = stuck;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Nav: menu mobile ---------- */
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });

    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ---------- Reveal ao rolar ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // escalona irmãos do mesmo grupo para um efeito em cascata
        var siblings = Array.prototype.slice.call(el.parentElement.children)
          .filter(function (n) { return n.classList.contains('reveal'); });
        var i = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Contadores das estatísticas ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 1200;
    var start = null;

    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- FAQ: abre um por vez ---------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Galeria: arrastar com o mouse ---------- */
  var gallery = document.getElementById('gallery');
  if (gallery) {
    var isDown = false, startX = 0, startScroll = 0, moved = 0;

    gallery.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return; // toque já rola nativamente
      isDown = true;
      moved = 0;
      startX = e.clientX;
      startScroll = gallery.scrollLeft;
      gallery.classList.add('is-dragging');
      gallery.setPointerCapture(e.pointerId);
    });

    gallery.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      gallery.scrollLeft = startScroll - dx;
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      gallery.addEventListener(evt, function () {
        isDown = false;
        gallery.classList.remove('is-dragging');
      });
    });

    // evita que o "arrastar" dispare cliques em links dentro da galeria
    gallery.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ---------- Link ativo conforme a seção visível ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = links ? links.querySelectorAll('a[href^="#"]') : [];

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navAnchors.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }
})();
