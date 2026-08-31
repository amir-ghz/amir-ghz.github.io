/* Blog behaviour: reading progress, TOC scrollspy, share, giscus.
   Depends on nothing. Loaded after js/site.js. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ------------------------------------------------ reading progress bar */
  var bar = document.getElementById('progressBar');
  var article = document.querySelector('.prose');
  if (bar && article) {
    var tick = false;
    function progress() {
      var start = article.offsetTop;
      var span  = article.offsetHeight - window.innerHeight * 0.5;
      var p = (window.scrollY - start) / Math.max(span, 1);
      bar.style.width = Math.max(0, Math.min(1, p)) * 100 + '%';
      tick = false;
    }
    addEventListener('scroll', function () {
      if (!tick) { requestAnimationFrame(progress); tick = true; }
    }, { passive: true });
    addEventListener('resize', progress, { passive: true });
    progress();
  }

  /* -------------------------------------------------------- TOC scrollspy */
  var tocLinks = [].slice.call(document.querySelectorAll('.post-toc a'));
  if (tocLinks.length) {
    var heads = tocLinks
      .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
      .filter(Boolean);

    var spyTick = false;
    function spy() {
      var line = window.scrollY + (document.getElementById('nav') || {offsetHeight:62}).offsetHeight + 110;
      var cur = 0;
      for (var i = 0; i < heads.length; i++) if (heads[i].offsetTop <= line) cur = i;
      tocLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
      spyTick = false;
    }
    addEventListener('scroll', function () {
      if (!spyTick) { requestAnimationFrame(spy); spyTick = true; }
    }, { passive: true });
    spy();
  }

  /* -------------------------------------------------------------- sharing */
  var title = document.title.split(' — ')[0];
  var url = location.href;
  [].forEach.call(document.querySelectorAll('[data-share]'), function (btn) {
    btn.addEventListener('click', function () {
      var kind = btn.getAttribute('data-share');
      if (kind === 'x') {
        open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) +
             '&url=' + encodeURIComponent(url), '_blank', 'noopener');
      } else if (kind === 'hn') {
        open('https://news.ycombinator.com/submitlink?u=' + encodeURIComponent(url) +
             '&t=' + encodeURIComponent(title), '_blank', 'noopener');
      } else if (kind === 'link' && navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          var old = btn.innerHTML;
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M20 6L9 17l-5-5"/></svg>';
          setTimeout(function () { btn.innerHTML = old; }, 1600);
        });
      }
    });
  });

  /* --------------------------------------------------------------- giscus */
  var slot = document.getElementById('giscus-slot');
  var THEMES = {
    light: 'https://amir-ghz.github.io/css/giscus-light.css',
    dark:  'https://amir-ghz.github.io/css/giscus-dark.css'
  };
  function giscusTheme() {
    return root.getAttribute('data-theme') === 'light' ? THEMES.light : THEMES.dark;
  }
  if (slot) {
    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', 'amir-ghz/amir-ghz.github.io');
    s.setAttribute('data-repo-id', 'MDEwOlJlcG9zaXRvcnkyNjI0MDk2ODY=');
    s.setAttribute('data-category', 'Announcements');
    s.setAttribute('data-category-id', 'DIC_kwDOD6QN1s4DEmS1');
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '1');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-theme', giscusTheme());
    s.setAttribute('data-lang', 'en');
    s.setAttribute('data-loading', 'lazy');
    slot.appendChild(s);
  }

  /* keep the comment widget in step with the site theme toggle */
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn && slot) {
    themeBtn.addEventListener('click', function () {
      // site.js flips the attribute on the same click; read it next frame
      requestAnimationFrame(function () {
        var frame = document.querySelector('iframe.giscus-frame');
        if (!frame) return;
        frame.contentWindow.postMessage(
          { giscus: { setConfig: { theme: giscusTheme() } } }, 'https://giscus.app');
      });
    });
  }

})();
