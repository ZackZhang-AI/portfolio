(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var media = gsap.matchMedia();
  document.documentElement.classList.add('motion-ready');

  /* 5 组实习专属视觉演算引擎（风控时间落差轨 / DiVA 进度条 / Skill 3节点 / 百度 7维柱 / 百川 3轮印记） */
  var riskPathLen = 0;
  function ensureRiskPath() {
    var path = document.getElementById('riskDropPath');
    if (!path || typeof path.getTotalLength !== 'function') return null;
    if (!riskPathLen) {
      riskPathLen = Math.ceil(path.getTotalLength());
      path.style.strokeDasharray = String(riskPathLen);
    }
    return path;
  }

  var stageSpecs = {
    risk: {
      duration: 1.55,
      apply: function (t) {
        var el = document.querySelector('[data-proof-metric="risk"]');
        /* 前 24% 为小焦橙环绕 120m 蓄势阶段，24%→100% 沿下降曲线俯冲压缩 120→30 分钟 */
        var dropT = t <= 0.24 ? 0 : (t - 0.24) / 0.76;
        if (el) el.textContent = String(Math.round(120 - 90 * dropT));
        var path = ensureRiskPath();
        if (path) {
          path.style.strokeDashoffset = String((riskPathLen * (1 - dropT)).toFixed(2));
        }
        var arrow = document.getElementById('riskDropArrow');
        var endDot = document.getElementById('riskDropEndDot');
        if (arrow) arrow.style.opacity = dropT > 0.78 ? String(((dropT - 0.78) / 0.22).toFixed(2)) : '0';
        if (endDot) endDot.style.opacity = dropT > 0.85 ? '1' : '0.25';
      }
    },
    diva: {
      duration: 1.25,
      apply: function (t) {
        var el = document.querySelector('[data-proof-metric="diva"]');
        if (el) el.textContent = String(Math.round(120 - 80 * t));
        var meter = document.getElementById('meterDiva');
        if (meter) meter.style.setProperty('--meter-p', (0.67 * t).toFixed(4));
      }
    },
    pricing: {
      duration: 1.32,
      apply: function (t) {
        var el = document.querySelector('[data-proof-metric="pricing"]');
        var rEl = document.querySelector('[data-proof-metric="pricing-routes"]');
        if (el) el.textContent = String(Math.round(90 * t));
        if (rEl) rEl.textContent = Math.round(2500 * t).toLocaleString('en-US');
        var steps = document.querySelectorAll('#skillPipeline .skill-step');
        steps.forEach(function (step, idx) {
          var threshold = idx === 0 ? 0.06 : (idx === 1 ? 0.44 : 0.78);
          var lit = t >= threshold;
          var active = (idx === 0 && t < 0.44) || (idx === 1 && t >= 0.44 && t < 0.78) || (idx === 2 && t >= 0.78);
          step.classList.toggle('is-lit', lit);
          step.classList.toggle('is-active', t > 0.02 && t < 0.99 && active);
        });
      }
    },
    baidu: {
      duration: 1.28,
      apply: function (t) {
        var el = document.querySelector('[data-proof-metric="baidu"]');
        if (el) el.textContent = (71.4 * t).toFixed(1);
        var cols = document.querySelectorAll('#baiduDims .eval-dim-col');
        cols.forEach(function (col, idx) {
          var start = idx * 0.11;
          var local = Math.max(0, Math.min(1, (t - start) / 0.34));
          col.style.setProperty('--dim-scale', (0.14 + 0.86 * local).toFixed(3));
          col.classList.toggle('is-lit', local > 0.35);
          col.classList.toggle('is-active', local > 0.2 && local < 0.92);
        });
      }
    },
    baichuan: {
      duration: 1.25,
      apply: function (t) {
        var rEl = document.querySelector('[data-proof-metric="baichuan-rounds"]');
        var iEl = document.querySelector('[data-proof-metric="baichuan-items"]');
        if (rEl) rEl.textContent = String(Math.max(1, Math.min(3, Math.round(1 + 2 * t))));
        if (iEl) iEl.textContent = String(Math.round(30 * t));
        var stamps = document.querySelectorAll('#baichuanStamps .rag-stamp');
        stamps.forEach(function (st, idx) {
          var threshold = idx === 0 ? 0.08 : (idx === 1 ? 0.46 : 0.80);
          var lit = t >= threshold;
          var active = (idx === 0 && t < 0.46) || (idx === 1 && t >= 0.46 && t < 0.80) || (idx === 2 && t >= 0.80);
          st.classList.toggle('is-lit', lit);
          st.classList.toggle('is-active', t > 0.02 && t < 0.99 && active);
        });
      }
    }
  };

  var stageState = {
    risk: { progress: 1, played: false, running: false, lastReplayAt: 0, tween: null },
    diva: { progress: 1, played: false, running: false, lastReplayAt: 0, tween: null },
    pricing: { progress: 1, played: false, running: false, lastReplayAt: 0, tween: null },
    baidu: { progress: 1, played: false, running: false, lastReplayAt: 0, tween: null },
    baichuan: { progress: 1, played: false, running: false, lastReplayAt: 0, tween: null }
  };

  function setStageProgress(key, t) {
    var spec = stageSpecs[key];
    var st = stageState[key];
    if (!spec || !st) return;
    st.progress = t;
    spec.apply(t);
  }

  function playStage(key, options) {
    var spec = stageSpecs[key];
    var st = stageState[key];
    if (!spec || !st) return;
    var opts = options || {};
    var isReplay = !!opts.replay;
    var now = performance.now();
    if (isReplay) {
      if (!st.played || now - st.lastReplayAt < 1800) return;
      st.lastReplayAt = now;
    } else if (st.played) {
      return;
    }
    st.played = true;
    st.running = true;
    if (st.tween) st.tween.kill();

    var startT = isReplay && key !== 'risk' ? 0.14 : 0;
    var proxy = { t: startT };
    setStageProgress(key, startT);

    st.tween = gsap.to(proxy, {
      t: 1,
      duration: isReplay ? spec.duration * 0.85 : spec.duration,
      delay: opts.delay || 0,
      ease: key === 'risk' ? 'power2.inOut' : 'expo.out',
      onUpdate: function () {
        setStageProgress(key, proxy.t);
      },
      onComplete: function () {
        st.running = false;
        setStageProgress(key, 1);
        window.dispatchEvent(new CustomEvent('portfolio:metricdone', { detail: { stage: key } }));
      }
    });
  }

  window.portfolioProofMeters = {
    getProgress: function (key) {
      return stageState[key] ? stageState[key].progress : 1;
    },
    getRatio: function (key) {
      if (key === 'diva') return 0.67 * (stageState.diva ? stageState.diva.progress : 1);
      return stageState[key] ? stageState[key].progress : 1;
    },
    isRunning: function (key) {
      return !!(stageState[key] && stageState[key].running);
    },
    isPlayed: function (key) {
      return !!(stageState[key] && stageState[key].played);
    },
    play: function (key, delay) {
      playStage(key, { delay: delay || 0, replay: false });
    },
    replay: function (key) {
      playStage(key, { delay: 0, replay: true });
    }
  };

  media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', function () {
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

    gsap.utils.toArray('.proof-note').forEach(function (note, index) {
      var rotation = (Number(note.dataset.noteRotation) || 0) * 0.45;
      revealOnce(note, { rotation: rotation, y: 36, opacity: 0 }, {
        trigger: note,
        start: 'top 84%',
        duration: 0.82,
        toVars: { delay: (index % 2) * 0.09 }
      });
    });

    /* 实习成果区：分层错峰排版揭幕 + 专属数据演出同步触发 */
    function choreographProofStage(stageEl, delayOffset) {
      var key = stageEl.dataset.proofStage;
      var title = stageEl.querySelector('.proof-reveal-title');
      var copy = stageEl.querySelector('.proof-reveal-copy');
      var metric = stageEl.querySelector('.proof-reveal-metric');
      var foots = Array.from(stageEl.querySelectorAll('.proof-reveal-foot'));
      var base = delayOffset || 0;

      if (key) setStageProgress(key, 0);

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageEl,
          start: 'top 82%',
          once: true
        }
      });

      if (title) {
        tl.fromTo(title, {
          y: 22,
          opacity: 0,
          clipPath: 'inset(0 0 100% 0)'
        }, {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.78,
          ease: 'expo.out',
          clearProps: 'transform,opacity,clipPath'
        }, base);
      }
      if (copy) {
        tl.fromTo(copy, { y: 16, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.64,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        }, base + 0.11);
      }
      if (metric) {
        tl.fromTo(metric, { y: 18, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.66,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        }, base + 0.18);
      }
      if (key) {
        tl.call(function () {
          playStage(key, { delay: 0, replay: false });
        }, null, base + 0.22);
      }
      if (foots.length) {
        tl.fromTo(foots, { y: 14, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.56,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        }, base + 0.30);
      }
    }

    var didiFeature = document.getElementById('didiFeature');
    if (didiFeature) {
      var didiHeading = didiFeature.querySelector('.company-heading');
      gsap.fromTo(didiFeature, { y: 36, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.78,
        ease: 'expo.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: didiFeature, start: 'top 84%', once: true }
      });
      if (didiHeading) {
        gsap.fromTo(didiHeading, { y: 14, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.62,
          delay: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: didiFeature, start: 'top 84%', once: true }
        });
      }
      var riskEl = didiFeature.querySelector('[data-proof-stage="risk"]');
      if (riskEl) choreographProofStage(riskEl, 0.10);
      var subStages = Array.from(didiFeature.querySelectorAll('.didi-projects [data-proof-stage]'));
      subStages.forEach(function (stEl, i) {
        choreographProofStage(stEl, 0.08 + i * 0.22);
      });
    }

    var proofBridge = document.getElementById('proofBridge');
    if (proofBridge) {
      revealOnce(proofBridge, { y: 16, opacity: 0 }, { duration: 0.62, start: 'top 88%' });
    }

    gsap.utils.toArray('.proof-showcase .proof-secondary').forEach(function (card, idx) {
      var head = card.querySelector('.company-heading');
      gsap.fromTo(card, { y: 40, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.82,
        delay: idx * 0.12,
        ease: 'expo.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: card, start: 'top 83%', once: true }
      });
      if (head) {
        gsap.fromTo(head, { y: 14, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.58,
          delay: idx * 0.12 + 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: card, start: 'top 83%', once: true }
        });
      }
      choreographProofStage(card, idx * 0.12 + 0.14);
    });

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

    return function () {
      Object.keys(stageSpecs).forEach(function (k) {
        if (stageState[k].tween) stageState[k].tween.kill();
        stageState[k].running = false;
        setStageProgress(k, 1);
      });
    };
  });

  media.add('(max-width: 767px), (prefers-reduced-motion: reduce)', function () {
    Object.keys(stageSpecs).forEach(function (k) {
      setStageProgress(k, 1);
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
