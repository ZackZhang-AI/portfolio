(function () {
  'use strict';

  var media;

  window.initPortfolioHero = function () {
    if (media) media.revert();
    var gsap = window.gsap;
    media = gsap.matchMedia();

    /* 1.05s 精密首屏入场总谱：按词组错峰裁切升起 → 赤陶下划线笔锋拉出 → 副文案与动作柔和落位 */
    media.add('(prefers-reduced-motion: no-preference)', function () {
      document.documentElement.classList.add('hero-orchestrated');
      var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });

      intro
        .fromTo('.hero-word', { yPercent: 108, opacity: 0 }, {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.075,
          clearProps: 'transform,opacity'
        }, 0.06)
        .fromTo('.hero-impact-rule', { scaleX: 0 }, {
          scaleX: 1,
          duration: 0.62,
          ease: 'expo.inOut',
          clearProps: 'transform'
        }, 0.42)
        .fromTo(['.hero-description', '.hero-background', '.hero-focus-strip', '.hero-actions'], { y: 18, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.68,
          stagger: 0.075,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        }, 0.46)
        .fromTo(['#sideLabels', '#bottomUI', '.hero-corner'], { opacity: 0 }, {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'opacity'
        }, 0.62);

      return function () {
        intro.kill();
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
