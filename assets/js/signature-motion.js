(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var media = gsap.matchMedia();

  function clamp(v, min, max) { return v < min ? min : (v > max ? max : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* 1. 顶栏共享焦橙游标滑块 */
  media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', function () {
    var menu = document.getElementById('siteMenu');
    var indicator = document.getElementById('navIndicator');
    if (!menu || !indicator) return;

    var links = Array.from(menu.querySelectorAll('a[href^="#"]'));
    var hovered = null;
    menu.classList.add('nav-indicator-ready');

    function moveTo(link) {
      if (!link) {
        indicator.style.opacity = '0';
        return;
      }
      var menuRect = menu.getBoundingClientRect();
      var linkRect = link.getBoundingClientRect();
      indicator.style.width = linkRect.width + 'px';
      indicator.style.transform = 'translate3d(' + (linkRect.left - menuRect.left) + 'px, 0, 0)';
      indicator.style.opacity = '1';
    }

    function sync() {
      var active = hovered || menu.querySelector('a[aria-current="location"]');
      moveTo(active);
    }

    var disposers = [];
    links.forEach(function (link) {
      function onEnter() { hovered = link; sync(); }
      function onFocus() { hovered = link; sync(); }
      function onLeave() { if (hovered === link) hovered = null; sync(); }
      link.addEventListener('pointerenter', onEnter);
      link.addEventListener('focus', onFocus);
      link.addEventListener('pointerleave', onLeave);
      link.addEventListener('blur', onLeave);
      disposers.push(function () {
        link.removeEventListener('pointerenter', onEnter);
        link.removeEventListener('focus', onFocus);
        link.removeEventListener('pointerleave', onLeave);
        link.removeEventListener('blur', onLeave);
      });
    });

    window.addEventListener('portfolio:navchange', sync);
    window.addEventListener('resize', sync);
    if (document.fonts) document.fonts.ready.then(sync);
    sync();

    return function () {
      disposers.forEach(function (fn) { fn(); });
      window.removeEventListener('portfolio:navchange', sync);
      window.removeEventListener('resize', sync);
      menu.classList.remove('nav-indicator-ready');
      indicator.style.removeProperty('width');
      indicator.style.removeProperty('transform');
      indicator.style.removeProperty('opacity');
    };
  });

  /* 2. 机械卷轴数字（Odometer Roll） */
  media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', function () {
    var countEls = Array.from(document.querySelectorAll('[data-count]'));
    if (!countEls.length) return;
    var restores = [];
    var tracks = [];

    countEls.forEach(function (el, cardIndex) {
      var raw = String(el.dataset.count || el.textContent).trim();
      var wrap = document.createElement('span');
      wrap.className = 'odo-wrap';

      raw.split('').forEach(function (ch, digitIndex) {
        if (!/[0-9]/.test(ch)) {
          wrap.appendChild(document.createTextNode(ch));
          return;
        }
        var targetDigit = Number(ch);
        var slot = document.createElement('span');
        slot.className = 'odo-digit';
        var track = document.createElement('span');
        track.className = 'odo-track';
        for (var n = 0; n <= 9; n++) {
          var cell = document.createElement('span');
          cell.textContent = String(n);
          track.appendChild(cell);
        }
        slot.appendChild(track);
        wrap.appendChild(slot);
        tracks.push({
          track: track,
          target: targetDigit,
          delay: cardIndex * 0.08 + digitIndex * 0.06,
          duration: 0.95 + digitIndex * 0.14
        });
      });

      el.textContent = '';
      el.appendChild(wrap);
      restores.push(function () { el.textContent = raw; });
    });

    var trigger = ScrollTrigger.create({
      trigger: '.signal-grid',
      start: 'top 86%',
      once: true,
      onEnter: function () {
        tracks.forEach(function (item) {
          gsap.fromTo(item.track, { yPercent: 0 }, {
            yPercent: -(item.target * 10),
            duration: item.duration,
            delay: item.delay,
            ease: 'expo.out'
          });
        });
      }
    });

    return function () {
      trigger.kill();
      restores.forEach(function (fn) { fn(); });
    };
  });

  /* 3. 作品区：左文右画粘性叙事展台（45% 阅读线双向切换） */
  media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', function () {
    var stage = document.getElementById('workStage');
    var frame = document.getElementById('workStageFrame');
    var labelEl = document.getElementById('workStageLabel');
    var countEl = document.getElementById('workStageCount');
    if (!stage || !frame) return;

    var chapters = Array.from(stage.querySelectorAll('.work-chapter'));
    var slides = Array.from(stage.querySelectorAll('.work-stage-slide'));
    var pills = Array.from(stage.querySelectorAll('.work-stage-pill'));
    var currentIndex = 0;
    var leaveTimers = [];

    function activate(index) {
      if (index === currentIndex || !chapters[index]) return;
      var prevIndex = currentIndex;
      currentIndex = index;

      var chapter = chapters[index];
      var projectId = chapter.dataset.projectId;
      var frameLabel = chapter.dataset.frameLabel || '';
      var frameAccent = chapter.dataset.frameAccent || 'rgba(239, 138, 76, 0.14)';
      var titleEl = chapter.querySelector('h3');
      var titleText = titleEl ? titleEl.textContent.trim() : '';

      chapters.forEach(function (ch, idx) { ch.classList.toggle('is-active', idx === index); });
      pills.forEach(function (pill, idx) { pill.classList.toggle('is-active', idx === index); });

      if (slides[prevIndex]) {
        var leaving = slides[prevIndex];
        leaving.classList.remove('is-active');
        leaving.classList.add('is-leaving');
        var timer = window.setTimeout(function () { leaving.classList.remove('is-leaving'); }, 580);
        leaveTimers.push(timer);
      }
      if (slides[index]) {
        slides[index].classList.remove('is-leaving');
        slides[index].classList.add('is-active');
      }

      frame.setAttribute('data-project-id', projectId);
      frame.setAttribute('aria-label', '查看 ' + titleText + ' 项目详情');
      frame.style.setProperty('--stage-accent', frameAccent);
      if (labelEl) labelEl.textContent = frameLabel;
      if (countEl) countEl.textContent = '0' + (index + 1) + ' / 0' + chapters.length;
      window.dispatchEvent(new CustomEvent('portfolio:workchange', {
        detail: { index: index, projectId: projectId }
      }));
    }

    var triggers = chapters.map(function (chapter, index) {
      return ScrollTrigger.create({
        trigger: chapter,
        start: 'top 54%',
        end: 'bottom 54%',
        onEnter: function () { activate(index); },
        onEnterBack: function () { activate(index); }
      });
    });

    var pillDisposers = pills.map(function (pill) {
      function onClick() {
        var idx = Number(pill.dataset.stageGoto);
        var target = chapters[idx];
        if (!target) return;
        var offset = Math.round(window.innerHeight * 0.24);
        if (window.portfolioScroll) window.portfolioScroll.scrollTo(target, offset);
        else target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      pill.addEventListener('click', onClick);
      return function () { pill.removeEventListener('click', onClick); };
    });

    return function () {
      triggers.forEach(function (t) { t.kill(); });
      pillDisposers.forEach(function (fn) { fn(); });
      leaveTimers.forEach(function (id) { clearTimeout(id); });
    };
  });

  /* 4. 生命感焦橙墨点伙伴与开屏入场由 ink-companion.js 独立驱动 */

  /* 5. 方法论叠卡：动态 SVG 线稿描绘 + 点击外露索引眉平滑展开对应卡片 */
  media.add('(prefers-reduced-motion: no-preference)', function () {
    var list = document.getElementById('paperSteps');
    if (!list) return;
    var cards = Array.from(list.children);
    var triggers = [];

    cards.forEach(function (card) {
      var paths = Array.from(card.querySelectorAll('.method-diagram .md-draw'));
      var nodes = Array.from(card.querySelectorAll('.method-diagram .md-node'));
      paths.forEach(function (path) {
        if (typeof path.getTotalLength !== 'function') return;
        var len = Math.ceil(path.getTotalLength());
        if (path.classList.contains('md-dash')) {
          gsap.set(path, { opacity: 0 });
        } else {
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        }
      });
      gsap.set(nodes, { scale: 0, opacity: 0, transformOrigin: 'center center' });

      var st = ScrollTrigger.create({
        trigger: card,
        start: 'top 84%',
        once: true,
        onEnter: function () {
          var tl = gsap.timeline();
          paths.forEach(function (path, i) {
            if (path.classList.contains('md-dash')) {
              tl.to(path, { opacity: 1, duration: 0.55, ease: 'power2.out' }, 0.35);
            } else {
              tl.to(path, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out' }, i * 0.08);
            }
          });
          tl.to(nodes, {
            scale: 1,
            opacity: 1,
            duration: 0.42,
            stagger: 0.06,
            ease: 'back.out(1.7)',
            clearProps: 'transform'
          }, 0.25);
        }
      });
      triggers.push(st);
    });

    /* 点击任意叠卡顶部索引眉，计算该卡自然文档位置并平滑滚动展开 */
    var tabButtons = Array.from(list.querySelectorAll('.step-tab-trigger'));
    var clickDisposers = tabButtons.map(function (btn) {
      function onClick() {
        var idx = Number(btn.dataset.stepGoto);
        if (isNaN(idx) || !cards[idx]) return;
        var listTop = list.getBoundingClientRect().top + (window.scrollY || 0);
        var offset = 0;
        for (var i = 0; i < idx; i++) {
          offset += cards[i].offsetHeight + 28;
        }
        var stickyTop = 92 + idx * 58;
        var dest = Math.max(0, listTop + offset - stickyTop + 4);
        if (window.portfolioScroll) window.portfolioScroll.scrollTo(dest);
        else window.scrollTo({ top: dest, behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('portfolio:methodchange', { detail: { index: idx } }));
      }
      btn.addEventListener('click', onClick);
      return function () { btn.removeEventListener('click', onClick); };
    });

    return function () {
      triggers.forEach(function (st) { st.kill(); });
      clickDisposers.forEach(function (fn) { fn(); });
      cards.forEach(function (card) {
        card.querySelectorAll('.method-diagram .md-draw').forEach(function (p) {
          p.style.removeProperty('stroke-dasharray');
          p.style.removeProperty('stroke-dashoffset');
          p.style.removeProperty('opacity');
        });
        card.querySelectorAll('.method-diagram .md-node').forEach(function (n) {
          n.style.removeProperty('transform');
          n.style.removeProperty('opacity');
        });
      });
    };
  });

  /* 6. 工具横幅速度联动（滚动越快横幅越带惯性微倾） */
  media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', function () {
    var ribbon = document.querySelector('.tool-ribbon-track');
    if (!ribbon || !window.portfolioScroll) return;
    var skewTo = gsap.quickTo(ribbon, 'skewX', { duration: 0.4, ease: 'power3.out' });
    function onTick() {
      var vel = window.portfolioScroll.getVelocity();
      skewTo(clamp(-vel / 420, -4.5, 4.5));
    }
    gsap.ticker.add(onTick);
    return function () {
      gsap.ticker.remove(onTick);
      gsap.set(ribbon, { skewX: 0 });
    };
  });
})();
