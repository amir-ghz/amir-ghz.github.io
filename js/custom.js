(function ($) {
  "use strict";

  // ============================================================
  // 1. THEME TOGGLE  (light <-> dark)
  // ============================================================
  $('.color-mode').on('click', function () {
    $('.color-mode-icon').toggleClass('active');
    $('body').toggleClass('dark-mode');
  });

  // ============================================================
  // 2. STICKY HEADER
  // ============================================================
  $(".navbar").headroom();

  // ============================================================
  // 3. (legacy) OWL CAROUSEL — no-op if grid is used instead
  // ============================================================
  if ($('.owl-carousel').length) {
    $('.owl-carousel').owlCarousel({
      items: 1,
      loop: true,
      margin: 10,
      nav: true
    });
  }

  // ============================================================
  // 4. SMOOTH SCROLL — only intercept hash links
  // ============================================================
  $('.nav-link, .custom-btn-link').on('click', function (event) {
    var href = $(this).attr('href') || '';
    if (href.charAt(0) !== '#' || href.length < 2) return;
    var $target = $(href);
    if (!$target.length) return;
    event.preventDefault();
    $('html, body').stop().animate({
      scrollTop: $target.offset().top - 49
    }, 900);
  });

  // ============================================================
  // 5. TOOLTIPS
  // ============================================================
  $('.social-links a').tooltip();

})(jQuery);


// ============================================================
//   VANILLA-JS NERDERY (tilt, reveal, glow, scroll bar, counters)
// ============================================================
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches;

  // ----------------------------------------------------------
  // 6. SCROLL PROGRESS BAR
  // ----------------------------------------------------------
  var bar = document.querySelector('.scroll-progress > span');
  if (bar) {
    var ticking = false;
    function updateBar() {
      var doc = document.documentElement;
      var scrolled = doc.scrollTop || document.body.scrollTop;
      var height = doc.scrollHeight - doc.clientHeight;
      var pct = height > 0 ? (scrolled / height) * 100 : 0;
      bar.style.width = pct.toFixed(2) + '%';
      ticking = false;
    }
    updateBar();
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(updateBar); ticking = true; }
    }, { passive: true });
  }

  // ----------------------------------------------------------
  // 7. CURSOR GLOW (desktop + fine pointer only)
  // ----------------------------------------------------------
  var glow = document.querySelector('.cursor-glow');
  if (glow && !isCoarsePointer && !prefersReducedMotion) {
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    var tx = gx, ty = gy, raf = null;
    function animateGlow() {
      gx += (tx - gx) * 0.18;
      gy += (ty - gy) * 0.18;
      glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px) translate(-50%,-50%)';
      raf = requestAnimationFrame(animateGlow);
    }
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('glow-active');
      if (!raf) animateGlow();
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      document.body.classList.remove('glow-active');
    });
  }

  // ----------------------------------------------------------
  // 8. 3D TILT ON CARDS
  // ----------------------------------------------------------
  if (!isCoarsePointer && !prefersReducedMotion) {
    var tiltCards = document.querySelectorAll('.tilt-card');
    var TILT_MAX = 8; // degrees
    Array.prototype.forEach.call(tiltCards, function (card) {
      // inject sheen overlay (on the card itself if it has no inner card)
      var sheenHost = card.querySelector('.project-card, .stat-card') || card;
      if (!sheenHost.querySelector(':scope > .sheen')) {
        var sheen = document.createElement('div');
        sheen.className = 'sheen';
        sheenHost.appendChild(sheen);
      }

      var rect = null;
      function refreshRect() { rect = card.getBoundingClientRect(); }

      card.addEventListener('mouseenter', function () {
        refreshRect();
      });
      card.addEventListener('mousemove', function (e) {
        if (!rect) refreshRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var px = x / rect.width;
        var py = y / rect.height;
        var rx = (px - 0.5) * (TILT_MAX * 2);   // y-axis rotation
        var ry = (0.5 - py) * (TILT_MAX * 2);   // x-axis rotation
        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
      window.addEventListener('resize', function () { rect = null; });
    });
  }

  // ----------------------------------------------------------
  // 9. SCROLL REVEAL (IntersectionObserver)
  // ----------------------------------------------------------
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('in'); });
  }

  // ----------------------------------------------------------
  // 10. COUNTER ANIMATION (data-count="6")
  // ----------------------------------------------------------
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        co.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var dur = 1200;
        var startedAt = null;
        function step(ts) {
          if (!startedAt) startedAt = ts;
          var p = Math.min(1, (ts - startedAt) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = Math.round(target * eased);
          el.textContent = val;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(counters, function (el) {
      el.textContent = '0';
      co.observe(el);
    });
  }

})();
