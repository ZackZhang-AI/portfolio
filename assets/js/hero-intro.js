(function () {
  'use strict';

  var media;

  function splitHeroChars() {
    var words = Array.from(document.querySelectorAll('.hero-word:not(.hero-period)'));
    var originals = [];
    var line1Chars = [];
    var line2Chars = [];

    words.forEach(function (wordEl) {
      var rule = wordEl.querySelector('.hero-impact-rule');
      var textNode = null;
      for (var i = 0; i < wordEl.childNodes.length; i++) {
        if (wordEl.childNodes[i].nodeType === 3 && wordEl.childNodes[i].nodeValue.trim()) {
          textNode = wordEl.childNodes[i];
          break;
        }
      }
      if (!textNode) return;
      var raw = textNode.nodeValue;
      originals.push({ el: wordEl, raw: raw, rule: rule });

      var frag = document.createDocumentFragment();
      var isLine2 = !!(wordEl.closest('.hero-title-mask:last-child'));
      raw.split('').forEach(function (ch) {
        var span = document.createElement('span');
        span.className = 'hero-char';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = ch;
        frag.appendChild(span);
        if (isLine2) line2Chars.push(span);
        else line1Chars.push(span);
      });

      wordEl.textContent = '';
      wordEl.appendChild(frag);
      if (rule) wordEl.appendChild(rule);
    });

    return {
      line1: line1Chars,
      line2: line2Chars,
      revert: function () {
        originals.forEach(function (item) {
          item.el.textContent = item.raw;
          if (item.rule) item.el.appendChild(item.rule);
        });
      }
    };
  }

  window.initPortfolioHero = function () {
    if (media) media.revert();
    var gsap = window.gsap;
    media = gsap.matchMedia();

    /* 1.35s 幕布掀开后的精密首屏大标题总谱：逐字从遮罩线优雅翻升 → 赤陶笔锋拉出 → 副文案与战绩条分层落位 */
    media.add('(prefers-reduced-motion: no-preference)', function () {
      document.documentElement.classList.add('hero-orchestrated');
      var split = splitHeroChars();
      var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });

      if (split.line1.length) {
        intro.fromTo(split.line1, {
          yPercent: 118,
          rotateZ: 3.5,
          opacity: 0
        }, {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          duration: 0.96,
          stagger: 0.032,
          clearProps: 'transform,opacity'
        }, 0.04);
      }
      if (split.line2.length) {
        intro.fromTo(split.line2, {
          yPercent: 122,
          rotateZ: 3.5,
          opacity: 0
        }, {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.036,
          clearProps: 'transform,opacity'
        }, 0.22);
      }

      intro
        .fromTo('.hero-impact-rule', { scaleX: 0 }, {
          scaleX: 1,
          duration: 0.72,
          ease: 'expo.inOut',
          clearProps: 'transform'
        }, 0.56)
        .fromTo('.hero-description', {
          y: 20,
          opacity: 0,
          clipPath: 'inset(0 0 100% 0)'
        }, {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.78,
          ease: 'power3.out',
          clearProps: 'transform,opacity,clipPath'
        }, 0.52)
        .fromTo(['.hero-background', '.hero-focus-strip', '.hero-actions'], { y: 18, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.09,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        }, 0.64)
        .fromTo('.hero-corner', { scale: 0.55, opacity: 0 }, {
          scale: 1,
          opacity: 1,
          duration: 0.62,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        }, 0.72)
        .fromTo(['#sideLabels', '#bottomUI'], { opacity: 0, y: 10 }, {
          opacity: 1,
          y: 0,
          duration: 0.64,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        }, 0.78);

      return function () {
        intro.kill();
        split.revert();
        document.documentElement.classList.remove('hero-orchestrated');
      };
    });

    media.add('(min-width: 768px) and (min-height: 601px) and (prefers-reduced-motion: no-preference)', function () {
      var timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'heroIntro',
          trigger: '#heroWrap',
          start: 'top top',
          end: 'bottom 35%',
          scrub: 0.55
        }
      });

      timeline.to('.hero-copy', { y: -36, autoAlpha: 0, duration: 0.65 }, 0.22);
      timeline.to('.hero-title-mask:first-child', { xPercent: -10, rotation: -0.8, duration: 1 }, 0);
      timeline.to('.hero-title-mask:last-child', { xPercent: 10, rotation: 0.8, duration: 1 }, 0);
      timeline.to(['#sideLabels', '#bottomUI', '.hero-corner'], {
        autoAlpha: 0,
        duration: 0.45
      }, 0.14);
    });
  };

  /* 首屏滚动成果词槽（参考支付宝首屏垂直词槽，克制纸墨呈现，悬停/聚焦/离屏暂停） */
  (function initHeroFocusTicker() {
    var strip = document.getElementById('heroFocusStrip');
    if (!strip || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var items = Array.from(strip.querySelectorAll('.hero-focus-item'));
    if (items.length < 2) return;
    var idx = 0;
    var paused = false;

    strip.addEventListener('pointerenter', function () { paused = true; });
    strip.addEventListener('pointerleave', function () { paused = false; });
    strip.addEventListener('focusin', function () { paused = true; });
    strip.addEventListener('focusout', function () { paused = false; });

    window.setInterval(function () {
      if (paused || document.hidden || (window.scrollY || 0) > window.innerHeight * 0.8) return;
      var prev = items[idx];
      idx = (idx + 1) % items.length;
      var next = items[idx];
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      window.setTimeout(function () { prev.classList.remove('is-leaving'); }, 440);
      next.classList.add('is-active');
      var nextHref = next.getAttribute('data-focus-href');
      if (nextHref) strip.setAttribute('href', nextHref);
    }, 2800);
  })();
})();
