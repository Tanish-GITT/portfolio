/* ==========================================================================
   Portfolio — behaviour
   No dependencies. Everything here is progressive enhancement: with JS
   disabled the page is fully readable and every link still works.

     1. Theme toggle (light / dark, remembered)
     2. Sticky topbar shadow
     3. Active section highlighting
     4. Scroll reveal
     5. Copy-to-clipboard
     6. Current year
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;

  /* ------------------------------------------------------------------------
     1. Theme toggle

     Three states matter: no stored preference (follow the OS), stored
     'light', stored 'dark'. The inline script in <head> has already applied
     any stored value; this only wires up the button.
     ------------------------------------------------------------------------ */
  var toggle = document.querySelector('.theme-toggle');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  }

  function syncToggle() {
    if (!toggle) return;
    var dark = currentTheme() === 'dark';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  if (toggle) {
    syncToggle();

    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch (e) { /* storage unavailable — the choice just won't persist */ }
      syncToggle();
    });

    // If the visitor never chose explicitly, keep following the OS when it
    // changes (e.g. at sunset on a scheduled dark mode).
    systemDark.addEventListener('change', function () {
      if (!root.dataset.theme) syncToggle();
    });
  }

  /* ------------------------------------------------------------------------
     2. Sticky topbar shadow
     Show the bottom rule only once content has scrolled under the bar.
     ------------------------------------------------------------------------ */
  var topbar = document.querySelector('.topbar');

  if (topbar) {
    var ticking = false;

    var updateStuck = function () {
      topbar.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateStuck);
    }, { passive: true });

    updateStuck();
  }

  /* ------------------------------------------------------------------------
     3. Active section highlighting
     Marks the nav link for whichever section currently owns the upper
     portion of the viewport.
     ------------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.topbar__nav a[href^="#"]')
  );

  if (navLinks.length && 'IntersectionObserver' in window) {
    var linkFor = {};
    var sections = [];

    navLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      linkFor[id] = link;
      sections.push(section);
    });

    var visible = new Set();

    var setActive = function () {
      // With several sections on screen, the topmost one wins — that's the
      // one the reader is most likely looking at.
      var winner = sections.filter(function (s) { return visible.has(s.id); })[0];

      navLinks.forEach(function (link) {
        var isActive = winner && link.getAttribute('href') === '#' + winner.id;
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.add(entry.target.id);
        } else {
          visible.delete(entry.target.id);
        }
      });
      setActive();
    }, {
      // Watch a band just below the topbar rather than the whole viewport.
      rootMargin: '-20% 0px -70% 0px'
    });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ------------------------------------------------------------------------
     4. Scroll reveal
     The .js-reveal class is added here, not in the HTML, so that a visitor
     without JS never gets stuck looking at opacity: 0 content.
     ------------------------------------------------------------------------ */
  var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (motionOK && 'IntersectionObserver' in window) {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll('.section, .entry, .project')
    );

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);   // reveal once, then stop watching
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    targets.forEach(function (el) {
      el.classList.add('js-reveal');
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     5. Copy-to-clipboard
     Any element with data-copy="..." copies that value on click. On an
     <a href="mailto:">, a plain click still opens the mail client — only a
     modifier-free click on a *button* is intercepted.
     ------------------------------------------------------------------------ */
  function flash(el, message) {
    el.setAttribute('data-copied', message);
    window.setTimeout(function () {
      el.removeAttribute('data-copied');
    }, 1800);
  }

  document.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function (event) {
      var value = el.getAttribute('data-copy');

      // Links keep their default behaviour; buttons are copy-only.
      if (el.tagName === 'BUTTON') event.preventDefault();

      if (!navigator.clipboard) {
        flash(el, '— ' + value);
        return;
      }

      navigator.clipboard.writeText(value).then(function () {
        flash(el, 'Copied');
      }, function () {
        flash(el, '— ' + value);
      });
    });
  });

  /* ------------------------------------------------------------------------
     6. Current year in the footer
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
