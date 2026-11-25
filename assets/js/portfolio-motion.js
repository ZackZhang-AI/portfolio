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
      revealOnce(note, { rotation: rotation, y: 36, opacity: 0 }, {
        trigger: note,
        start: 'top 84%',
        duration: 0.82,
        toVars: { delay: (index % 2) * 0.09 }
      });
    });

    // 近期实习成果卡：进入阅读黄金区逐张窗帘式揭开，而非一滑到底全展开。
    gsap.utils.toArray('.proof-showcase .company-feature, .proof-showcase .proof-secondary').forEach(function (card, index) {
      gsap.fromTo(card, {
        y: 44,
        opacity: 0,
        clipPath: 'inset(0 0 12% 0 round 4px)'
      }, {
        y: 0,
        opacity: 1,
        clipPath: 'inset(0 0 0% 0 round 4px)',
        duration: 0.88,
        delay: index === 2 ? 0.1 : 0,
        ease: 'expo.out',
        clearProps: 'transform,opacity,clipPath',
        scrollTrigger: { trigger: card, start: 'top 81%', once: true }
      });
    });

    // 实习提效刻度条：随卡片揭开丝滑拉出。
    gsap.utils.toArray('.proof-meter-fill[data-meter]').forEach(function (fill) {
      var ratio = Math.max(0.1, Math.min(1, Number(fill.dataset.meter || 70) / 100));
      gsap.fromTo(fill, { scaleX: 0 }, {
        scaleX: ratio,
        duration: 1.05,
        ease: 'expo.out',
        scrollTrigger: { trigger: fill.closest('.proof-project, .proof-secondary') || fill, start: 'top 80%', once: true }
      });
    });

    // 五张经历卡轨道基线绘制；桌面端由小墨点 A1 走过 01→05 逐张唤醒，窄屏保底常规展开。
    gsap.fromTo('#pathLine', { scaleX: 0, transformOrigin: 'left center' }, {
      scaleX: 1,
      duration: 0.78,
      ease: 'power2.out',
      scrollTrigger: { trigger: '#pathStage', start: 'top 84%', once: true }
    });
    if (window.innerWidth < 1024) {
      gsap.fromTo('#pathStage .pathCard', {
        y: 26, opacity: 0
      }, {
        y: 0, opacity: 1, duration: 0.56, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '#pathStage', start: 'top 86%', once: true }
      });
    }

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
    // 非对称双实习卡：轻微纵向视差，打破呆板静态双栏。
    var pair = document.querySelector('.proof-pair');
    var inkCard = document.querySelector('.proof-secondary--ink');
    var leadCard = document.querySelector('.proof-secondary--lead');
    if (pair && inkCard && leadCard) {
      gsap.fromTo(leadCard, { '--proof-parallax': '8px' }, {
        '--proof-parallax': '-10px',
        ease: 'none',
        scrollTrigger: { trigger: pair, start: 'top bottom', end: 'bottom top', scrub: 0.65 }
      });
      gsap.fromTo(inkCard, { '--proof-parallax': '28px' }, {
        '--proof-parallax': '-24px',
        ease: 'none',
        scrollTrigger: { trigger: pair, start: 'top bottom', end: 'bottom top', scrub: 0.65 }
      });
    }

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
