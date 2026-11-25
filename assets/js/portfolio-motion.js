(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var media = gsap.matchMedia();
  document.documentElement.classList.add('motion-ready');

  /* 共享实习指标动态演算控制器（供滚动揭幕与 A1 小焦橙进度条联动实时读取当前进度） */
  var meterSpecs = {
    diva: {
      targetRatio: 0.67,
      meterId: 'meterDiva',
      barId: 'meterBarDiva',
      applyValue: function (t) {
        var el = document.querySelector('[data-proof-metric="diva"]');
        if (el) el.textContent = String(Math.round(120 - 80 * t));
      }
    },
    pricing: {
      targetRatio: 0.75,
      meterId: 'meterPricing',
      barId: 'meterBarPricing',
      applyValue: function (t) {
        var el = document.querySelector('[data-proof-metric="pricing"]');
        if (el) el.textContent = String(Math.round(75 * t));
      }
    },
    baidu: {
      targetRatio: 0.714,
      meterId: 'meterBaidu',
      barId: 'meterBarBaidu',
      applyValue: function (t) {
        var el = document.querySelector('[data-proof-metric="baidu"]');
        if (el) el.textContent = (71.4 * t).toFixed(1);
      }
    },
    baichuan: {
      targetRatio: 0.86,
      meterId: 'meterBaichuan',
      barId: 'meterBarBaichuan',
      applyValue: function (t) {
        var rEl = document.querySelector('[data-proof-metric="baichuan-rounds"]');
        var iEl = document.querySelector('[data-proof-metric="baichuan-items"]');
        if (rEl) rEl.textContent = String(Math.max(1, Math.min(3, Math.round(1 + 2 * t))));
        if (iEl) iEl.textContent = String(Math.round(30 * t));
      }
    }
  };

  var meterState = {
    diva: { ratio: 0.67, played: false, lastReplayAt: 0, tween: null },
    pricing: { ratio: 0.75, played: false, lastReplayAt: 0, tween: null },
    baidu: { ratio: 0.714, played: false, lastReplayAt: 0, tween: null },
    baichuan: { ratio: 0.86, played: false, lastReplayAt: 0, tween: null }
  };

  function setMeterVisual(key, ratio, valueProgress) {
    var spec = meterSpecs[key];
    var st = meterState[key];
    if (!spec || !st) return;
    st.ratio = ratio;
    var meterEl = document.getElementById(spec.meterId);
    if (meterEl) meterEl.style.setProperty('--meter-p', ratio.toFixed(4));
    spec.applyValue(valueProgress);
  }

  function playMeter(key, options) {
    var spec = meterSpecs[key];
    var st = meterState[key];
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
    if (st.tween) st.tween.kill();

    var startT = isReplay ? 0.22 : 0;
    var proxy = { t: startT };
    setMeterVisual(key, spec.targetRatio * startT, startT);

    st.tween = gsap.to(proxy, {
      t: 1,
      duration: isReplay ? 0.92 : 1.28,
      delay: opts.delay || 0,
      ease: 'expo.out',
      onUpdate: function () {
        setMeterVisual(key, spec.targetRatio * proxy.t, proxy.t);
      },
      onComplete: function () {
        setMeterVisual(key, spec.targetRatio, 1);
        window.dispatchEvent(new CustomEvent('portfolio:metricdone', { detail: { stage: key } }));
      }
    });
  }

  window.portfolioProofMeters = {
    getRatio: function (key) {
      return meterState[key] ? meterState[key].ratio : 0.7;
    },
    getTargetRatio: function (key) {
      return meterSpecs[key] ? meterSpecs[key].targetRatio : 0.7;
    },
    isPlayed: function (key) {
      return !!(meterState[key] && meterState[key].played);
    },
    play: function (key, delay) {
      playMeter(key, { delay: delay || 0, replay: false });
    },
    replay: function (key) {
      playMeter(key, { delay: 0, replay: true });
    }
  };

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

    // 实习成果区：分层错峰排版揭幕（卡框 → 抬头 → 标题遮罩升起 → 正文 → 数字动态演算 × 进度条同步拉出 → 落款按钮）
    function choreographProofStage(stageEl, delayOffset) {
      var key = stageEl.dataset.proofStage;
      var title = stageEl.querySelector('.proof-reveal-title');
      var copy = stageEl.querySelector('.proof-reveal-copy');
      var metric = stageEl.querySelector('.proof-reveal-metric');
      var meter = stageEl.querySelector('.proof-meter');
      var foots = Array.from(stageEl.querySelectorAll('.proof-reveal-foot'));
      var base = delayOffset || 0;

      if (key) setMeterVisual(key, 0, 0);

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
        tl.fromTo(metric, { y: 20, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.68,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        }, base + 0.19);
      }
      if (meter) {
        tl.fromTo(meter, { opacity: 0 }, {
          opacity: 1,
          duration: 0.42,
          ease: 'power2.out',
          clearProps: 'opacity'
        }, base + 0.22);
      }
      if (key) {
        tl.call(function () {
          playMeter(key, { delay: 0, replay: false });
        }, null, base + 0.24);
      }
      if (foots.length) {
        tl.fromTo(foots, { y: 14, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.56,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        }, base + 0.34);
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
      var didiStages = Array.from(didiFeature.querySelectorAll('[data-proof-stage]'));
      didiStages.forEach(function (stEl, i) {
        choreographProofStage(stEl, 0.12 + i * 0.24);
      });
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

    return function () {
      Object.keys(meterSpecs).forEach(function (k) {
        if (meterState[k].tween) meterState[k].tween.kill();
        setMeterVisual(k, meterSpecs[k].targetRatio, 1);
      });
    };
  });

  /* 窄屏与减弱动态时确保全部实习数字与进度条立刻归位到最终态 */
  media.add('(max-width: 767px), (prefers-reduced-motion: reduce)', function () {
    Object.keys(meterSpecs).forEach(function (k) {
      setMeterVisual(k, meterSpecs[k].targetRatio, 1);
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
