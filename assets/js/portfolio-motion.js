(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var media = gsap.matchMedia();
  document.documentElement.classList.add('motion-ready');

  media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', function () {
    // 入场有节奏，落位后保持 100% 清晰稳定，不干扰阅读。
    function revealOnce(element, fromVars, options) {
      var opts = options || {};
      return gsap.fromTo(element, fromVars, Object.assign({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: opts.duration || 0.72,
        ease: opts.ease || 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: opts.trigger || element,
          start: opts.start || 'top 90%',
          once: true
        }
      }, opts.toVars));
    }

    gsap.fromTo('.site-progress', { scaleX: 0 }, {
      scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.15 }
    });

    gsap.utils.toArray('.section-heading').forEach(function (heading) {
      gsap.fromTo(heading, { '--rule-progress': 0 }, {
        '--rule-progress': 1, ease: 'power2.inOut',
        scrollTrigger: { trigger: heading, start: 'top 92%', end: 'top 52%', scrub: 0.6 }
      });
    });

    // 较早经历：2×2 纸张轻落归正。
    gsap.utils.toArray('.proof-note').forEach(function (note, index) {
      var rotation = (Number(note.dataset.noteRotation) || 0) * 0.45;
      revealOnce(note, { rotation: rotation, y: 34, opacity: 0 }, {
        trigger: note.parentElement,
        duration: 0.78,
        toVars: { delay: (index % 2) * 0.08 }
      });
    });

    // 近期实习成果卡：干脆上浮落稳。
    gsap.utils.toArray('.proof-showcase .company-feature, .proof-showcase .proof-secondary').forEach(function (card, index) {
      revealOnce(card, { y: 32, scale: 0.985, opacity: 0 }, {
        duration: 0.74,
        toVars: { delay: index > 0 ? (index - 1) * 0.09 : 0 }
      });
    });

    // 五张经历卡：1 秒内利落展开，顶部轨道配合焦橙引路点依次点亮。
    gsap.timeline({
      scrollTrigger: { trigger: '#pathStage', start: 'top 86%', once: true }
    }).fromTo('#pathLine', { scaleX: 0, transformOrigin: 'left center' }, {
      scaleX: 1, duration: 0.72, ease: 'power2.out'
    }, 0).fromTo('#pathStage .pathCard', {
      y: 26, opacity: 0
    }, {
      y: 0, opacity: 1, duration: 0.54, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity'
    }, 0.06);

    // 能力大字：轻幅交错落位后释放行内样式，确保悬停聚焦降暗顺畅工作。
    gsap.utils.toArray('.capability-line').forEach(function (line, index) {
      revealOnce(line, { x: index % 2 ? 36 : -36, opacity: 0 }, {
        duration: 0.72,
        toVars: { delay: index * 0.05 }
      });
    });

    gsap.fromTo('.tool-ribbon-track', { x: 0, xPercent: -4 }, {
      xPercent: -19, ease: 'none',
      scrollTrigger: { trigger: '.tool-ribbon', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    });

    gsap.utils.toArray('.about-intro > div:last-child, .signal, .proof-archive-heading, .knowledge-group-heading, .knowledge-list > a, .footer-agent-cta, .footer-grid, .footer-bottom').forEach(function (element) {
      revealOnce(element, { y: 22, opacity: 0 }, { duration: 0.68 });
    });
  });

  media.add('(min-width: 768px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)', function () {
    gsap.utils.toArray('#studio, #darkAct').forEach(function (section) {
      gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 98%', end: 'bottom 2%', scrub: 0.6 }
      }).fromTo(section, { clipPath: 'inset(0 4% 0 4% round 32px)' }, {
        clipPath: 'inset(0 0% 0 0% round 0px)', duration: 1, ease: 'power2.out'
      }, 0).to(section, { clipPath: 'inset(0 4% 0 4% round 32px)', duration: 1, ease: 'power2.in' }, 4);
    });
  });

  media.add('(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)', function () {
    // 档案叠卡：后一张卡上移时，前一张轻微后退并柔和压暗，顶部 58px 索引眉始终完整可见。
    gsap.utils.toArray('.paper-steps > li').forEach(function (card) {
      if (!card.nextElementSibling) return;
      gsap.to(card, {
        scale: 0.968,
        '--stack-dim': 1,
        transformOrigin: 'center top',
        ease: 'none',
        scrollTrigger: { trigger: card.nextElementSibling, start: 'top 72%', end: 'top 24%', scrub: 0.55 }
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
