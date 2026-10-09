(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var media = gsap.matchMedia();
  var counters = Array.from(document.querySelectorAll('[data-count]'));
  document.documentElement.classList.add('motion-ready');

  media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', function () {
    // 中间留出稳定阅读区；跨过上下边缘时都能顺滑进入或退出。
    function revealBothWays(element, entering, leaving, trigger, resting) {
      return gsap.timeline({
        scrollTrigger: { trigger: trigger || element, start: 'top 94%', end: 'bottom 8%', scrub: 0.7 }
      }).fromTo(element, entering, Object.assign({
        x: 0, y: 0, rotation: 0, opacity: 1, duration: 1, ease: 'power2.out'
      }, resting), 0).to(element, Object.assign({ duration: 1, ease: 'power2.in' }, leaving), 4);
    }

    gsap.fromTo('.site-progress', { scaleX: 0 }, {
      scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 }
    });
    gsap.utils.toArray('.section-heading').forEach(function (heading) {
      gsap.fromTo(heading, { '--rule-progress': 0 }, {
        '--rule-progress': 1, ease: 'power2.inOut',
        scrollTrigger: { trigger: heading, start: 'top 92%', end: 'top 48%', scrub: 0.7 }
      });
    });
    gsap.utils.toArray('.section-heading h2, .about-intro h2').forEach(function (heading) {
      revealBothWays(heading, { y: 28, opacity: 0.35 }, { y: -20, opacity: 0.35 });
    });
    // 上滑时反向经过退出段，从屏幕上方淡入并归正。
    gsap.utils.toArray('.proof-note').forEach(function (note) {
      var rotation = Number(note.dataset.noteRotation);
      revealBothWays(note, { rotation: rotation, y: 72, opacity: 0 }, {
        rotation: -rotation * 0.6, y: -48, opacity: 0
      }, note.parentElement);
    });
    // 近期项目整组展开，正文落稳后再阅读；旧经历仍按纸张逐张出现。
    gsap.utils.toArray('.proof-showcase .company-feature, .proof-showcase .proof-secondary').forEach(function (card) {
      revealBothWays(card, { y: 72, scale: 0.95, rotationX: 10, transformPerspective: 1200, opacity: 0.25 }, {
        y: -32, scale: 0.985, rotationX: -3, opacity: 0.25
      }, null, { scale: 1, rotationX: 0 });
    });
    // 五张经历卡按 01→05 逐步展开，上下重新进入时均可重播。
    gsap.timeline({
      scrollTrigger: { trigger: '#pathStage', start: 'top 84%', end: 'bottom 16%', toggleActions: 'play reverse play reverse' }
    }).fromTo('#pathLine', { scaleX: 0, transformOrigin: 'left center' }, {
      scaleX: 1, duration: 1.4, ease: 'power2.inOut'
    }, 0).fromTo('#pathStage .pathCard', {
      y: 52, rotation: function (index) { return index % 2 ? -3 : 3; }, opacity: 0
    }, { y: 0, rotation: 0, opacity: 1, duration: 0.9, stagger: 0.28, ease: 'power3.out' }, 0.08);

    gsap.utils.toArray('.capability-line').forEach(function (line, index) {
      revealBothWays(line, { x: index % 2 ? 140 : -140, opacity: 0.2 }, {
        x: index % 2 ? -80 : 80, opacity: 0.2
      });
    });
    gsap.fromTo('.tool-ribbon-track', { x: 0, xPercent: -4 }, {
      xPercent: -19, ease: 'none',
      scrollTrigger: { trigger: '.tool-ribbon', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    });
    gsap.utils.toArray('.method-statement > span').forEach(function (line, index) {
      revealBothWays(line, { x: index ? 38 : -24, opacity: 0.35 }, { x: index ? -24 : 24, opacity: 0.35 });
    });
    // 各内容区使用同一套轻量双向反馈，保留悬停预览和文字中段的稳定性。
    gsap.utils.toArray('.about-intro > div:last-child, .signal, .proof-archive-heading, .work-feature, .project-index-row, .knowledge-group-heading, .knowledge-list > a, .talk-title, .footer-agent-cta, .footer-grid, .footer-bottom').forEach(function (element) {
      revealBothWays(element, { y: 24, opacity: 0.55 }, { y: -18, opacity: 0.55 });
    });
    gsap.utils.toArray('.work-image > img').forEach(function (image) {
      revealBothWays(image, { scale: 1.1, y: 18 }, { scale: 1.07, y: -16 }, image.closest('.work-feature'), { scale: 1 });
    });
    counters.forEach(function (element, index) {
      var value = { count: 0 };
      gsap.to(value, {
        count: Number(element.dataset.count), duration: 1.35, delay: index * 0.08, ease: 'power2.out',
        onUpdate: function () { element.textContent = Math.round(value.count); },
        scrollTrigger: { trigger: '.signal-grid', start: 'top 88%', end: 'bottom 15%', toggleActions: 'restart none restart none' }
      });
    });
    return function () {
      counters.forEach(function (element) { element.textContent = element.dataset.count; });
    };
  });

  media.add('(min-width: 768px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)', function () {
    gsap.utils.toArray('.chapter-panel').forEach(function (section) {
      gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 98%', end: 'bottom 2%', scrub: 0.6 }
      }).fromTo(section, { clipPath: 'inset(0 5% 0 5% round 48px)' }, {
        clipPath: 'inset(0 0% 0 0% round 0px)', duration: 1, ease: 'power2.out'
      }, 0).to(section, { clipPath: 'inset(0 5% 0 5% round 48px)', duration: 1, ease: 'power2.in' }, 4);
    });
  });

  media.add('(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)', function () {
    // 后一张纸进入时，前一张轻微后退；上滑时自然展开。
    gsap.utils.toArray('.paper-steps > li').forEach(function (card) {
      if (!card.nextElementSibling) return;
      gsap.to(card, {
        scale: 0.955, rotation: -0.8, transformOrigin: 'center top', ease: 'none',
        scrollTrigger: { trigger: card.nextElementSibling, start: 'top 65%', end: 'top 28%', scrub: 0.65 }
      });
    });
  });

  media.add('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
    var disposers = [];
    document.querySelectorAll('.capability-line').forEach(function (line) {
      var title = line.querySelector('.capability-title');
      var bounds;
      var frame;
      var point;
      function move(event) {
        point = { x: event.clientX, y: event.clientY };
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = null;
          title.style.setProperty('--glow-x', (point.x - bounds.left) + 'px');
          title.style.setProperty('--glow-y', (point.y - bounds.top) + 'px');
        });
      }
      function enter(event) { bounds = title.getBoundingClientRect(); line.classList.add('is-lit'); move(event); }
      function leave() { cancelAnimationFrame(frame); frame = null; line.classList.remove('is-lit'); }
      line.addEventListener('pointerenter', enter);
      line.addEventListener('pointermove', move);
      line.addEventListener('pointerleave', leave);
      disposers.push(function () {
        leave(); line.removeEventListener('pointerenter', enter);
        line.removeEventListener('pointermove', move); line.removeEventListener('pointerleave', leave);
        title.style.removeProperty('--glow-x'); title.style.removeProperty('--glow-y');
      });
    });
    return function () { disposers.forEach(function (dispose) { dispose(); }); };
  });
})();
