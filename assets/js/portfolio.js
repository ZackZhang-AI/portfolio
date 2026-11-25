(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var menuButton = header.querySelector('.menu-toggle');
  var menu = document.getElementById('siteMenu');
  var mobile = window.matchMedia('(max-width: 767px)');

  function closeMenu(restoreFocus) {
    header.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuButton.focus();
  }

  function syncMenu() {
    menuButton.hidden = !mobile.matches;
    closeMenu(false);
  }

  header.classList.add('menu-ready');
  syncMenu();
  mobile.addEventListener('change', syncMenu);
  menuButton.addEventListener('click', function () {
    var open = header.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && header.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', function (event) {
    if (!header.contains(event.target)) closeMenu(false);
  });
  header.addEventListener('focusout', function () {
    window.requestAnimationFrame(function () {
      if (!header.contains(document.activeElement)) closeMenu(false);
    });
  });

  document.getElementById('copyEmail').addEventListener('click', function () {
    var status = document.getElementById('copyStatus');
    var email = 'zackzhang124@163.com';
    function manualCopy() {
      status.textContent = '请长按或选中邮箱复制：' + email;
    }
    if (!navigator.clipboard) return manualCopy();
    navigator.clipboard.writeText(email).then(function () {
      status.textContent = '邮箱已复制。';
    }, manualCopy);
  });

  // 保留旧页面锚点；定位折叠内容前先展开，链接仍可直接访问。
  function revealHashTarget() {
    var id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); }
    catch (_) { return; }
    var target = document.getElementById(id);
    if (!target) return;
    var parent = target.closest('details');
    if (parent && !parent.open) {
      parent.open = true;
      window.requestAnimationFrame(function () { target.scrollIntoView(); });
    }
  }
  revealHashTarget();
  window.addEventListener('hashchange', revealHashTarget);

  // 顶栏首屏透明、暗色章节自动切换深墨主题，以及全章节精确导航高亮。
  var darkAct = document.getElementById('darkAct');
  var navLinks = Array.from(menu.querySelectorAll('a[href^="#"]'));
  var trackedSections = [
    { el: document.getElementById('heroWrap'), nav: '' },
    { el: document.getElementById('studio'), nav: '#studio' },
    { el: document.getElementById('testimonials'), nav: '#testimonials' },
    { el: document.getElementById('work'), nav: '#work' },
    { el: document.getElementById('capabilities'), nav: '#work' },
    { el: document.getElementById('method'), nav: '' },
    { el: document.getElementById('knowledge'), nav: '#knowledge' },
    { el: document.getElementById('footer'), nav: '#footer' }
  ].filter(function (item) { return item.el; });

  var scrollFrame = 0;
  function syncHeaderAndNav() {
    scrollFrame = 0;
    var y = window.scrollY || window.pageYOffset || 0;
    var headerHeight = header.offsetHeight || 76;

    header.classList.toggle('is-top', y < 24);

    if (darkAct) {
      var darkRect = darkAct.getBoundingClientRect();
      var probe = headerHeight * 0.6;
      header.classList.toggle('is-dark', darkRect.top <= probe && darkRect.bottom > probe);
    }

    var activeNav = '';
    var triggerY = headerHeight + Math.min(180, window.innerHeight * 0.25);
    for (var i = 0; i < trackedSections.length; i++) {
      if (trackedSections[i].el.getBoundingClientRect().top <= triggerY) {
        activeNav = trackedSections[i].nav;
      }
    }
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 24) {
      activeNav = '#footer';
    }
    var changed = false;
    navLinks.forEach(function (link) {
      var wasCurrent = link.getAttribute('aria-current') === 'location';
      var isCurrent = !!(activeNav && link.getAttribute('href') === activeNav);
      if (isCurrent) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
      if (wasCurrent !== isCurrent) changed = true;
    });
    if (changed) {
      window.dispatchEvent(new CustomEvent('portfolio:navchange'));
    }
  }

  function scheduleSync() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(syncHeaderAndNav);
  }

  syncHeaderAndNav();
  window.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync, { passive: true });

  if (!window.gsap || !window.ScrollTrigger) return;
  window.gsap.registerPlugin(window.ScrollTrigger);
  window.ScrollTrigger.addEventListener('refreshInit', function () {
    // 先让滚动样式生效，避免重算位置时浏览器仍平滑滚向临时原点；GSAP 会恢复原样式。
    document.documentElement.style.scrollBehavior = 'auto';
    window.getComputedStyle(document.documentElement).scrollBehavior;
  });
  if (window.initPortfolioHero) window.initPortfolioHero();
  function refreshLayout() {
    window.ScrollTrigger.refresh();
    syncHeaderAndNav();
  }
  document.querySelectorAll('details').forEach(function (details) {
    details.addEventListener('toggle', refreshLayout);
  });
  window.addEventListener('load', refreshLayout, { once: true });
  if (document.fonts) document.fonts.ready.then(refreshLayout);
})();
