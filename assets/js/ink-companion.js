(function () {
  'use strict';

  var guide = document.getElementById('inkGuide');
  var preloader = document.getElementById('sitePreloader');
  if (!guide) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopMq = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');

  var faceEl = guide.querySelector('.ink-face');
  var pupilEls = Array.from(guide.querySelectorAll('.ink-pupil-group'));
  var dialog = document.getElementById('projectDialog');
  var heroPeriod = document.getElementById('heroPeriod');
  var brandDot = document.getElementById('headerBrandDot');
  var pathStage = document.getElementById('pathStage');
  var pathLine = document.getElementById('pathLine');
  var pathCards = Array.from(document.querySelectorAll('#pathStage .pathCard'));
  var proofSection = document.getElementById('testimonials');
  var proofShowcase = proofSection ? proofSection.querySelector('.proof-showcase') : null;
  var darkAct = document.getElementById('darkAct');
  var workStage = document.getElementById('workStage');
  var workFrame = document.getElementById('workStageFrame');
  var capabilitiesSection = document.getElementById('capabilities');
  var capabilitiesList = capabilitiesSection ? capabilitiesSection.querySelector('.capabilities-list') : null;
  var methodSection = document.getElementById('method');
  var paperSteps = document.getElementById('paperSteps');
  var methodCards = paperSteps ? Array.from(paperSteps.children) : [];
  var knowledgeSection = document.getElementById('knowledge');
  var knowledgeList = knowledgeSection ? knowledgeSection.querySelector('.knowledge-list') : null;
  var footer = document.getElementById('footer');
  var talkArrow = document.getElementById('talkArrow');

  function clamp(v, min, max) { return v < min ? min : (v > max ? max : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* 核心状态：单一活体墨点（开屏预加载 → 抛物线入场 → 全站 7 幕伴随互动） */
  var state = {
    mode: 'idle', /* 'preloader' | 'flight' | 'live' | 'hidden' */
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0,
    scale: 1,
    tilt: 0,
    /* 独立弹跳与挤压变形物理 */
    hopY: 0,
    hopVy: 0,
    squash: 0,
    squashV: 0,
    /* 双层眼球追踪（头转 + 瞳孔微视差） */
    gx: 0,
    gy: 0,
    targetGx: 0,
    targetGy: 0,
    /* 表情计时器 */
    happyUntil: 0,
    winkUntil: 0,
    curious: false,
    selfHovered: false,
    pulsing: false,
    isDark: false,
    /* 指针与静置观察 */
    pointerX: window.innerWidth * 0.5,
    pointerY: window.innerHeight * 0.5,
    pointerActiveAt: 0,
    lastScrollAt: 0,
    lastScrollY: window.scrollY || 0,
    nextIdleGlanceAt: performance.now() + 3400,
    idleGx: 0,
    idleGy: 0,
    /* 悬停交互组件上下文 */
    hoveredEl: null,
    hoveredKind: '',
    lastPathIdx: -1,
    /* 上一帧时间戳 */
    lastFrame: performance.now()
  };

  /* 1. 表情与物理动作控制 API */
  var blinkTimer = 0;
  var blinkCloseTimer = 0;

  function triggerBlink(allowDouble) {
    if (state.mode === 'hidden') return;
    if (guide.classList.contains('is-happy') || guide.classList.contains('is-wink')) return;
    guide.classList.add('is-blinking');
    clearTimeout(blinkCloseTimer);
    blinkCloseTimer = window.setTimeout(function () {
      guide.classList.remove('is-blinking');
      if (allowDouble && Math.random() < 0.22) {
        blinkCloseTimer = window.setTimeout(function () {
          triggerBlink(false);
        }, 120);
      }
    }, 130);
  }

  function scheduleNextBlink() {
    clearTimeout(blinkTimer);
    if (reducedMotion) return;
    var delay = 2500 + Math.random() * 2900;
    blinkTimer = window.setTimeout(function () {
      triggerBlink(true);
      scheduleNextBlink();
    }, delay);
  }

  function hop(strength) {
    var s = typeof strength === 'number' ? strength : 1;
    state.hopVy = -260 * s;
    state.squashV += 4.2 * s;
  }

  function triggerHappy(durationMs, withHop) {
    state.happyUntil = Math.max(state.happyUntil, performance.now() + (durationMs || 900));
    if (withHop) hop(0.85);
    pulseOnce();
  }

  function triggerWink(durationMs, withHop) {
    state.winkUntil = Math.max(state.winkUntil, performance.now() + (durationMs || 340));
    if (withHop) hop(0.55);
  }

  var pulseTimeout = 0;
  function pulseOnce() {
    guide.classList.add('is-burst');
    clearTimeout(pulseTimeout);
    pulseTimeout = window.setTimeout(function () {
      guide.classList.remove('is-burst');
    }, 680);
  }

  function applyGazeDOM(gx, gy) {
    if (faceEl) {
      faceEl.setAttribute('transform', 'translate(' + (gx * 2.15).toFixed(2) + ' ' + (gy * 1.75).toFixed(2) + ')');
    }
    var px = (gx * 1.12).toFixed(2);
    var py = (gy * 1.05).toFixed(2);
    for (var i = 0; i < pupilEls.length; i++) {
      pupilEls[i].setAttribute('transform', 'translate(' + px + ' ' + py + ')');
    }
  }

  function renderGuide(now, dt) {
    /* 弹跳垂直重力与落地软挤压 */
    if (state.hopY < 0 || state.hopVy !== 0) {
      state.hopVy += 1550 * dt;
      state.hopY += state.hopVy * dt;
      if (state.hopY >= 0) {
        state.hopY = 0;
        if (Math.abs(state.hopVy) > 90) {
          state.squashV -= Math.min(7.5, Math.abs(state.hopVy) * 0.018);
        }
        state.hopVy = 0;
      }
    }

    /* 阻尼弹性挤压还原（squash > 0 竖向拉长，< 0 横向压扁） */
    var springForce = -115 * state.squash - 14 * state.squashV;
    state.squashV += springForce * dt;
    state.squash += state.squashV * dt;
    if (Math.abs(state.squash) < 0.002 && Math.abs(state.squashV) < 0.01) {
      state.squash = 0;
      state.squashV = 0;
    }

    /* 平滑眼球插值 */
    var gazeFollow = 1 - Math.exp(-15 * dt);
    state.gx += (state.targetGx - state.gx) * gazeFollow;
    state.gy += (state.targetGy - state.gy) * gazeFollow;
    applyGazeDOM(state.gx, state.gy);

    /* 表情类名同步 */
    var isHappy = state.selfHovered || now < state.happyUntil;
    var isWink = !isHappy && now < state.winkUntil;
    guide.classList.toggle('is-happy', isHappy);
    guide.classList.toggle('is-wink', isWink);
    guide.classList.toggle('is-curious', !isHappy && !isWink && state.curious);
    guide.classList.toggle('is-pulsing', state.pulsing);
    guide.classList.toggle('is-dark-surface', state.isDark);

    /* 合成方向性体积守恒拉伸 + 弹跳挤压 + 轻柔呼吸浮沉 */
    var hStretch = clamp(Math.abs(state.vx) / 1100, 0, 0.16);
    var vStretch = clamp(Math.abs(state.vy) / 1100, 0, 0.18);
    var hoverBoost = state.selfHovered ? 1.12 : 1;
    var breatheY = (state.mode === 'live' && hStretch < 0.01 && vStretch < 0.01 && state.hopY === 0)
      ? Math.sin(now * 0.0028) * 2.1
      : 0;

    var sx = state.scale * hoverBoost * (1 - state.squash * 0.22 + hStretch - vStretch * 0.45);
    var sy = state.scale * hoverBoost * (1 + state.squash * 0.22 + vStretch - hStretch * 0.45);
    var drawX = state.x - 16;
    var drawY = state.y - 16 + state.hopY + breatheY;

    guide.style.transform =
      'translate3d(' + drawX.toFixed(2) + 'px,' + drawY.toFixed(2) + 'px,0) ' +
      'rotate(' + state.tilt.toFixed(2) + 'deg) ' +
      'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
  }

  /* 2. 计算首屏稳定停靠坐标（落在 IMPACT. 句点基线位，让句点本身“活”过来；使用 .hero-word-clip 保证飞入落点零漂移） */
  function getHeroPerch() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    if (desktopMq.matches && heroPeriod) {
      var clip = heroPeriod.parentElement || heroPeriod;
      var r = clip.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        return {
          x: clamp(r.left + r.width * 0.56 + 4, 60, vw - 44),
          y: clamp(r.bottom - r.height * 0.245, 92, vh - 100),
          scale: 0.90
        };
      }
    }
    if (brandDot) {
      var br = brandDot.getBoundingClientRect();
      return {
        x: br.left + br.width / 2,
        y: br.top + br.height / 2,
        scale: desktopMq.matches ? 0.72 : 0.34
      };
    }
    return { x: vw * 0.76, y: vh * 0.36, scale: 0.9 };
  }

  /* 3. 全站 7 幕动态落点与组件协同 */
  function computeLiveTarget(now) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var y = window.scrollY || 0;

    var hero = getHeroPerch();
    var tx = hero.x;
    var ty = hero.y;
    var scale = hero.scale;
    var pulsing = y < 48;
    var isDark = false;
    var tiltTarget = 0;
    var actGazeX = null;
    var actGazeY = null;
    var activeAct = 'hero';

    /* 若滚出首屏且未落入下方特定幕布，先轻巧停泊在右上安全呼吸位，绝不遮挡文字 */
    if (y >= 110) {
      tx = clamp(vw - 38, 60, vw - 26);
      ty = clamp(118, 96, vh - 120);
      scale = 0.78;
      pulsing = false;
      activeAct = 'rail';
    }

    /* Act 2: 经历时间轴 01 -> 05，沿轨道行走并依次点亮卡片节点 */
    if (pathStage && pathLine && pathCards.length) {
      var stageRect = pathStage.getBoundingClientRect();
      var enterStart = vh * 0.90;
      var sweepStart = vh * 0.68;
      var sweepEnd = vh * 0.24;
      var exitEnd = vh * 0.03;

      if (stageRect.top <= enterStart && stageRect.top >= exitEnd) {
        activeAct = 'path';
        var lineRect = pathLine.getBoundingClientRect();
        var startNodeX = pathCards[0].getBoundingClientRect().left + 24.5;
        var endNodeX = pathCards[pathCards.length - 1].getBoundingClientRect().left + 24.5;
        var railY = lineRect.top + lineRect.height / 2 - 14;

        if (stageRect.top > sweepStart) {
          var tIn = easeInOut(clamp((enterStart - stageRect.top) / (enterStart - sweepStart), 0, 1));
          tx = lerp(hero.x, startNodeX, tIn);
          ty = lerp(hero.y, railY, tIn) - Math.sin(tIn * Math.PI) * 34;
          scale = lerp(hero.scale, 0.78, tIn);
          var lit0 = tIn > 0.85;
          pathCards.forEach(function (c, i) {
            c.classList.toggle('is-passed', i === 0 && lit0);
            c.classList.toggle('is-current', i === 0 && lit0);
          });
          if (lit0 && state.lastPathIdx !== 0) {
            state.lastPathIdx = 0;
            hop(0.45);
          }
        } else if (stageRect.top >= sweepEnd) {
          var tSweep = clamp((sweepStart - stageRect.top) / (sweepStart - sweepEnd), 0, 1);
          tx = lerp(startNodeX, endNodeX, tSweep);
          ty = railY;
          scale = 0.80;
          pulsing = true;
          var passedIdx = Math.floor(tSweep * (pathCards.length - 1) + 0.15);
          pathCards.forEach(function (c, i) {
            c.classList.toggle('is-passed', i <= passedIdx);
            c.classList.toggle('is-current', i === passedIdx);
          });
          if (passedIdx !== state.lastPathIdx) {
            state.lastPathIdx = passedIdx;
            hop(0.5);
          }
          actGazeX = 0.15;
          actGazeY = 0.82;
        } else {
          var tOut = easeInOut(clamp((sweepEnd - stageRect.top) / (sweepEnd - exitEnd), 0, 1));
          var nextRailX = clamp(vw - 40, 60, vw - 26);
          var nextRailY = clamp(vh * 0.34, 110, vh - 140);
          tx = lerp(endNodeX, nextRailX, tOut);
          ty = lerp(railY, nextRailY, tOut) - Math.sin(tOut * Math.PI) * 26;
          scale = 0.78;
          pathCards.forEach(function (c) {
            c.classList.add('is-passed');
            c.classList.remove('is-current');
          });
        }
      } else if (stageRect.top < exitEnd) {
        pathCards.forEach(function (c) {
          c.classList.add('is-passed');
          c.classList.remove('is-current');
        });
      } else {
        state.lastPathIdx = -1;
        pathCards.forEach(function (c) {
          c.classList.remove('is-passed');
          c.classList.remove('is-current');
        });
      }
    }

    /* Act 3: 实习成果区，停驻在卡片外缘呼应数据与悬停卡片 */
    if (proofSection && activeAct !== 'path') {
      var pr = proofSection.getBoundingClientRect();
      if (pr.top < vh * 0.56 && pr.bottom > vh * 0.24) {
        activeAct = 'proof';
        if (state.hoveredEl && state.hoveredKind === 'proof-card') {
          var cr = state.hoveredEl.getBoundingClientRect();
          tx = clamp(cr.right - 16, 48, vw - 26);
          ty = clamp(cr.top - 10, 92, vh - 44);
          scale = 0.80;
          tiltTarget = -7;
        } else if (proofShowcase) {
          var sr = proofShowcase.getBoundingClientRect();
          tx = clamp(sr.right + 18, 48, vw - 26);
          ty = clamp(Math.max(116, Math.min(vh * 0.38, sr.top + 36)), 96, vh - 120);
          scale = 0.78;
          actGazeX = -0.82;
          actGazeY = 0.15;
        }
      }
    }

    /* Act 4 & 5: 暗色作品展台 + 能力宣言（切换为暖琥珀微光墨点） */
    if (darkAct) {
      var darkRect = darkAct.getBoundingClientRect();
      if (darkRect.top <= vh * 0.48 && darkRect.bottom > 96) {
        isDark = true;
        if (workStage && workFrame) {
          var wsRect = workStage.getBoundingClientRect();
          if (wsRect.top < vh * 0.50 && wsRect.bottom > vh * 0.34) {
            activeAct = 'work';
            var fr = workFrame.getBoundingClientRect();
            tx = clamp(fr.right - 6, 48, vw - 22);
            ty = clamp(fr.top - 14, 86, vh - 60);
            scale = 0.82;
            pulsing = true;
            actGazeX = -0.58;
            actGazeY = 0.56;
            if (state.hoveredKind === 'work-frame') {
              ty -= 4;
              tiltTarget = -9;
            }
          }
        }
        if (activeAct !== 'work' && capabilitiesSection && capabilitiesList) {
          var capR = capabilitiesSection.getBoundingClientRect();
          if (capR.top < vh * 0.62 && capR.bottom > vh * 0.20) {
            activeAct = 'capabilities';
            var clR = capabilitiesList.getBoundingClientRect();
            tx = clamp(clR.right + 18, 48, vw - 28);
            if (state.hoveredEl && state.hoveredKind === 'capability') {
              var lr = state.hoveredEl.getBoundingClientRect();
              ty = clamp(lr.top + lr.height * 0.5, 100, vh - 60);
              scale = 0.84;
              tiltTarget = -8;
              actGazeX = -0.95;
              actGazeY = 0;
            } else {
              ty = clamp(vh * 0.44, 110, vh - 120);
              scale = 0.78;
              actGazeX = -0.8;
              actGazeY = 0.1;
            }
          }
        }
      }
    }

    /* Act 6: 方法论档案叠卡 + 知识手册 */
    if (!isDark && methodSection && methodCards.length) {
      var mr = methodSection.getBoundingClientRect();
      if (mr.top < vh * 0.56 && mr.bottom > vh * 0.25) {
        activeAct = 'method';
        var frontCard = methodCards[0];
        for (var m = 0; m < methodCards.length; m++) {
          var mcr = methodCards[m].getBoundingClientRect();
          if (mcr.top <= vh * 0.52) frontCard = methodCards[m];
        }
        var fcr = frontCard.getBoundingClientRect();
        tx = clamp(fcr.right - 22, 48, vw - 26);
        ty = clamp(fcr.top - 10, 92, vh - 60);
        scale = 0.80;
        actGazeX = -0.55;
        actGazeY = 0.45;
      }
    }

    if (!isDark && activeAct !== 'method' && knowledgeSection && knowledgeList) {
      var kr = knowledgeSection.getBoundingClientRect();
      if (kr.top < vh * 0.58 && kr.bottom > vh * 0.24) {
        activeAct = 'knowledge';
        var klr = knowledgeList.getBoundingClientRect();
        tx = clamp(klr.right + 18, 48, vw - 28);
        if (state.hoveredEl && state.hoveredKind === 'knowledge-item') {
          var kir = state.hoveredEl.getBoundingClientRect();
          ty = clamp(kir.top + kir.height * 0.5, 96, vh - 56);
          scale = 0.82;
          tiltTarget = -6;
          actGazeX = -0.92;
          actGazeY = 0;
        } else {
          ty = clamp(vh * 0.42, 110, vh - 120);
          scale = 0.76;
          actGazeX = -0.78;
          actGazeY = 0.1;
        }
      }
    }

    /* Act 7: 页尾 Let's talk 邀约停泊 */
    if (footer && talkArrow) {
      var fRect = footer.getBoundingClientRect();
      if (fRect.top < vh * 0.74) {
        activeAct = 'footer';
        var tFoot = easeInOut(clamp((vh * 0.74 - fRect.top) / (vh * 0.34), 0, 1));
        var arrowRect = talkArrow.getBoundingClientRect();
        var footX = clamp(arrowRect.right + 24, 48, vw - 32);
        var footY = clamp(arrowRect.top + arrowRect.height * 0.52, 96, vh - 40);
        tx = lerp(tx, footX, tFoot);
        ty = lerp(ty, footY, tFoot);
        scale = lerp(scale, 0.94, tFoot);
        pulsing = tFoot > 0.62;
        isDark = false;
        actGazeX = -0.75;
        actGazeY = 0.08;
      }
    }

    /* 首屏停靠时让静态句点隐去，小墨点本体即为活体句点；离开首屏后保留极淡残印 */
    if (heroPeriod) {
      heroPeriod.classList.toggle('is-docked', activeAct === 'hero');
      heroPeriod.classList.toggle('is-departed', activeAct !== 'hero');
    }

    /* 首屏悬停 CTA / 导航链接时，轻盈向目标倾身并歪头注视 */
    if (activeAct === 'hero' && state.hoveredEl && (state.hoveredKind === 'cta' || state.hoveredKind === 'nav')) {
      var hr = state.hoveredEl.getBoundingClientRect();
      var hdx = (hr.left + hr.width / 2) - tx;
      var hdy = (hr.top + hr.height / 2) - ty;
      var hdist = Math.hypot(hdx, hdy) || 1;
      tx += (hdx / hdist) * 8;
      ty += (hdy / hdist) * 6;
      tiltTarget = clamp((hdx / 450) * 10, -9, 9);
    }

    /* 视线优先级：1) 悬停组件 2) 近期鼠标 3) 快速滚动方向 4) 当前章节默认注视 / 静置东张西望 */
    var gx = 0;
    var gy = 0;
    var scrollVel = window.portfolioScroll ? window.portfolioScroll.getVelocity() : 0;

    if (state.hoveredEl && !state.selfHovered) {
      var er = state.hoveredEl.getBoundingClientRect();
      var ecx = er.left + er.width / 2;
      var ecy = er.top + er.height / 2;
      gx = clamp((ecx - state.x) / 170, -1, 1);
      gy = clamp((ecy - state.y) / 150, -1, 1);
    } else if (now - state.pointerActiveAt < 2600 && !state.selfHovered) {
      gx = clamp((state.pointerX - state.x) / 220, -1, 1);
      gy = clamp((state.pointerY - state.y) / 180, -1, 1);
    } else if (Math.abs(scrollVel) > 160) {
      gx = 0;
      gy = clamp(scrollVel / 900, -0.88, 0.88);
    } else if (now - state.lastScrollAt > 3000 && now - state.pointerActiveAt > 3000) {
      /* 静置超过 3 秒：偶尔好奇四处张望 */
      if (now >= state.nextIdleGlanceAt) {
        var presets = [
          [-0.92, -0.15],
          [0.88, -0.1],
          [-0.4, 0.65],
          [0.5, 0.45],
          [0, 0]
        ];
        var pick = presets[Math.floor(Math.random() * presets.length)];
        state.idleGx = pick[0];
        state.idleGy = pick[1];
        state.nextIdleGlanceAt = now + 2200 + Math.random() * 2400;
      }
      gx = state.idleGx;
      gy = state.idleGy;
    } else if (actGazeX !== null) {
      gx = actGazeX;
      gy = actGazeY;
    }

    return {
      x: tx,
      y: ty,
      scale: scale,
      pulsing: pulsing,
      isDark: isDark,
      tilt: tiltTarget,
      gx: gx,
      gy: gy
    };
  }

  /* 4. 实时伴随主循环 */
  var liveLoopRunning = false;
  var liveRaf = 0;

  function stepLive() {
    var now = performance.now();
    var dt = Math.min(0.05, Math.max(0.004, (now - state.lastFrame) / 1000));
    state.lastFrame = now;

    if (state.mode !== 'live') return;

    var hiddenByDialog = !!(dialog && dialog.open);
    if (hiddenByDialog || !desktopMq.matches) {
      guide.classList.remove('is-visible');
      return;
    }

    var curScrollY = window.scrollY || 0;
    if (Math.abs(curScrollY - state.lastScrollY) > 0.5) {
      state.lastScrollY = curScrollY;
      state.lastScrollAt = now;
    }

    var t = computeLiveTarget(now);
    var prevX = state.x;
    var prevY = state.y;
    var follow = 1 - Math.exp(-11.5 * dt);
    state.x += (t.x - state.x) * follow;
    state.y += (t.y - state.y) * follow;
    state.vx = (state.x - prevX) / dt;
    state.vy = (state.y - prevY) / dt;
    state.scale += (t.scale - state.scale) * (1 - Math.exp(-10 * dt));

    var moveTilt = clamp(state.vx / 48, -11, 11);
    var desiredTilt = t.tilt + moveTilt;
    state.tilt += (desiredTilt - state.tilt) * (1 - Math.exp(-12 * dt));

    state.targetGx = t.gx;
    state.targetGy = t.gy;
    state.pulsing = t.pulsing;
    state.isDark = t.isDark;

    guide.classList.add('is-visible');
    renderGuide(now, dt);
  }

  function startLiveLoop() {
    if (liveLoopRunning) return;
    liveLoopRunning = true;
    state.lastFrame = performance.now();
    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.add(stepLive);
    } else {
      (function loop() {
        if (!liveLoopRunning) return;
        stepLive();
        liveRaf = window.requestAnimationFrame(loop);
      })();
    }
  }

  function enterLiveMode(alreadyPositioned) {
    if (!desktopMq.matches) {
      state.mode = 'hidden';
      guide.classList.remove('is-visible', 'is-preloader-mode');
      document.documentElement.classList.remove('ink-guide-ready');
      return;
    }
    document.documentElement.classList.add('ink-guide-ready');
    guide.classList.remove('is-preloader-mode');
    state.mode = 'live';
    if (!alreadyPositioned) {
      var target = computeLiveTarget(performance.now());
      state.x = target.x;
      state.y = target.y;
      state.scale = target.scale;
    }
    state.vx = 0;
    state.vy = 0;
    guide.classList.add('is-visible');
    startLiveLoop();
  }

  /* 5. 网页组件微互动监听（按钮、卡片、作品展台、能力宣言、方法论叠卡、邮箱、轻戳本体） */
  function bindInteractions() {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      state.pointerX = e.clientX;
      state.pointerY = e.clientY;
      state.pointerActiveAt = performance.now();
    }, { passive: true });

    /* 直接悬停与点击小墨点本体：笑眼 + 雀跃轻跳 */
    guide.addEventListener('pointerenter', function () {
      if (state.mode !== 'live') return;
      state.selfHovered = true;
    });
    guide.addEventListener('pointerleave', function () {
      state.selfHovered = false;
    });
    guide.addEventListener('click', function (e) {
      if (state.mode !== 'live') return;
      e.preventDefault();
      e.stopPropagation();
      triggerHappy(950, true);
      state.tilt += (Math.random() < 0.5 ? -16 : 16);
    });

    /* 委托监听各类可交互网页组件 */
    var hoverRules = [
      { sel: '#talkLink, .footer-agent-cta', kind: 'footer-cta', happy: true },
      { sel: '.work-stage-frame', kind: 'work-frame' },
      { sel: '.work-stage-pill', kind: 'work-pill' },
      { sel: '.capability-line', kind: 'capability' },
      { sel: '.company-feature, .proof-secondary, .proof-note', kind: 'proof-card' },
      { sel: '.pathCard', kind: 'path-card' },
      { sel: '.knowledge-list > a', kind: 'knowledge-item' },
      { sel: '.hero-actions a, #bottomUI a', kind: 'cta' },
      { sel: '.site-menu a', kind: 'nav' }
    ];

    document.addEventListener('pointerover', function (e) {
      if (state.mode !== 'live') return;
      for (var i = 0; i < hoverRules.length; i++) {
        var match = e.target.closest(hoverRules[i].sel);
        if (match) {
          state.hoveredEl = match;
          state.hoveredKind = hoverRules[i].kind;
          state.curious = !hoverRules[i].happy;
          if (hoverRules[i].happy) {
            state.happyUntil = performance.now() + 900;
          }
          return;
        }
      }
    }, { passive: true });

    document.addEventListener('pointerout', function (e) {
      if (!state.hoveredEl) return;
      if (e.relatedTarget && state.hoveredEl.contains(e.relatedTarget)) return;
      state.hoveredEl = null;
      state.hoveredKind = '';
      state.curious = false;
    }, { passive: true });

    /* 作品切换：俏皮眨眼 + 轻跳 */
    window.addEventListener('portfolio:workchange', function () {
      if (state.mode !== 'live') return;
      triggerWink(360, true);
    });

    /* 方法论叠卡切换：雀跃轻跳 */
    window.addEventListener('portfolio:methodchange', function () {
      if (state.mode !== 'live') return;
      triggerWink(320, true);
    });

    /* 复制邮箱成功：笑眼庆祝 */
    window.addEventListener('portfolio:emailcopied', function () {
      if (state.mode !== 'live') return;
      triggerHappy(1200, true);
    });

    desktopMq.addEventListener('change', function () {
      if (state.mode === 'preloader' || state.mode === 'flight') return;
      enterLiveMode(false);
    });
  }

  /* 6. 开屏加载编排：小墨点苏醒 → 踏步进度条 → 东张西望 → 100% 欢呼跳跃 → 幕布丝滑展开 + 抛物线飞往首屏 */
  function runPreloader() {
    var shouldPreload = preloader && document.documentElement.classList.contains('is-preloading') && !reducedMotion;
    if (!shouldPreload) {
      if (preloader) preloader.classList.add('is-done');
      document.documentElement.classList.remove('is-preloading');
      enterLiveMode(false);
      return;
    }

    var trackEl = document.getElementById('preloaderTrack');
    var fillEl = document.getElementById('preloaderFill');
    var shadowEl = document.getElementById('preloaderShadow');
    var statusEl = document.getElementById('preloaderStatus');
    var pctEl = document.getElementById('preloaderPct');
    var stageEl = preloader.querySelector('.preloader-stage');

    var fontsReady = false;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { fontsReady = true; });
    } else {
      fontsReady = true;
    }

    state.mode = 'preloader';
    guide.classList.add('is-visible', 'is-preloader-mode');

    var startAt = performance.now();
    var phase = 'load'; /* 'load' -> 'celebrate' -> 'flight' -> 'done' */
    var progress = 0;
    var celebrateStart = 0;
    var flightStart = 0;
    var flightFrom = { x: 0, y: 0, scale: 1.18 };
    var flightTo = { x: 0, y: 0, scale: 0.90 };
    var curtainOpened = false;
    var lastStatusText = '';
    var lookBlinkDone = false;
    var wakeBlinkDone = false;
    var finished = false;

    function setStatus(text) {
      if (!statusEl || text === lastStatusText) return;
      lastStatusText = text;
      statusEl.textContent = text;
    }

    function getTrackMetrics() {
      var r = trackEl.getBoundingClientRect();
      return { left: r.left, width: Math.max(120, r.width), y: r.top };
    }

    /* 初始落在进度条左端 */
    var m0 = getTrackMetrics();
    state.x = m0.left;
    state.y = m0.y - 24;
    state.scale = 0.01;
    state.lastFrame = performance.now();

    function finishAll() {
      if (finished) return;
      finished = true;
      document.documentElement.classList.remove('is-preloading', 'ink-flight-active');
      if (preloader) preloader.classList.add('is-done');
      if (!curtainOpened && window.initPortfolioHero) {
        curtainOpened = true;
        window.initPortfolioHero();
      }
      if (window.portfolioScroll) window.portfolioScroll.sync();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (desktopMq.matches) {
        enterLiveMode(true);
        state.squashV -= 4.2; /* 落稳时轻微弹性软着陆 */
        window.setTimeout(function () { triggerBlink(false); }, 260);
      } else {
        state.mode = 'hidden';
        guide.classList.remove('is-visible', 'is-preloader-mode');
      }
    }

    /* 4.6 秒兜底安全阀：任何网络异常都不阻挡访问 */
    var failsafe = window.setTimeout(finishAll, 4600);

    function preloaderFrame() {
      if (finished) return;
      var now = performance.now();
      var dt = Math.min(0.05, Math.max(0.004, (now - state.lastFrame) / 1000));
      state.lastFrame = now;
      var elapsed = (now - startAt) / 1000;
      var tm = getTrackMetrics();

      if (phase === 'load') {
        if (elapsed < 0.28) {
          /* 0.00s - 0.28s：弹跳苏醒 */
          var pWake = easeOutCubic(clamp(elapsed / 0.28, 0, 1));
          state.scale = lerp(0.15, 1.18, pWake) + Math.sin(pWake * Math.PI) * 0.14;
          state.x = tm.left;
          state.y = tm.y - 24 - Math.sin(pWake * Math.PI) * 14;
          state.targetGx = 0.65;
          state.targetGy = 0;
          state.tilt = 0;
          setStatus('正在铺开作品集');
          if (elapsed > 0.16 && !wakeBlinkDone) {
            wakeBlinkDone = true;
            triggerBlink(false);
          }
        } else if (elapsed < 0.88) {
          /* 0.28s - 0.88s：踏着进度条轻快前进（0% -> 42%） */
          var tWalk = clamp((elapsed - 0.28) / 0.60, 0, 1);
          progress = lerp(0, 0.42, easeInOut(tWalk));
          var stepBounce = Math.abs(Math.sin(tWalk * Math.PI * 4.5)) * 10;
          state.scale = 1.18;
          state.x = tm.left + tm.width * progress;
          state.y = tm.y - 24 - stepBounce;
          state.tilt = 6 + Math.sin(tWalk * Math.PI * 9) * 3.5;
          state.targetGx = 0.92;
          state.targetGy = 0.06;
          setStatus('正在铺开作品集');
        } else if (elapsed < 1.54) {
          /* 0.88s - 1.54s：短暂停步“东张西望”（42% -> 68%） */
          var tLook = clamp((elapsed - 0.88) / 0.66, 0, 1);
          progress = lerp(0.42, 0.68, tLook * 0.85 + easeInOut(tLook) * 0.15);
          state.scale = 1.18;
          state.x = tm.left + tm.width * progress;
          state.y = tm.y - 24;
          setStatus('四处看看…');
          if (tLook < 0.34) {
            state.targetGx = -1.0;
            state.targetGy = -0.18;
            state.tilt = -9;
          } else if (tLook < 0.68) {
            state.targetGx = 1.0;
            state.targetGy = -0.12;
            state.tilt = 9;
            if (!lookBlinkDone && tLook > 0.42) {
              lookBlinkDone = true;
              triggerBlink(false);
            }
          } else {
            /* 好奇低头瞟一眼正在上涨的百分比数字 */
            state.targetGx = 0.28;
            state.targetGy = 0.95;
            state.tilt = 4;
          }
        } else {
          /* 1.54s -> 1.94s：等待字体就绪（最多多等 0.35s），冲刺至 100% */
          var tSprint = clamp((elapsed - 1.54) / 0.38, 0, 1);
          var cap = (fontsReady || elapsed > 2.25) ? 1 : 0.94;
          progress = Math.min(cap, lerp(0.68, 1, easeOutCubic(tSprint)));
          var sprintBounce = Math.abs(Math.sin(tSprint * Math.PI * 3)) * 11;
          state.scale = 1.18;
          state.x = tm.left + tm.width * progress;
          state.y = tm.y - 24 - sprintBounce;
          state.tilt = 8;
          state.targetGx = 0.9;
          state.targetGy = -0.05;
          setStatus('准备就绪');

          if (progress >= 0.998) {
            progress = 1;
            phase = 'celebrate';
            celebrateStart = now;
            setStatus('HELLO.');
            state.tilt = 0;
            state.targetGx = 0;
            state.targetGy = 0;
            triggerHappy(1150, true);
            hop(1.15);
          }
        }

        if (fillEl) fillEl.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
        if (pctEl) pctEl.textContent = String(Math.round(progress * 100)).padStart(2, '0') + '%';
        if (shadowEl) {
          var airHeight = Math.max(0, (tm.y - 24) - state.y - state.hopY);
          var shadowScale = clamp(1 - airHeight / 44, 0.38, 1) * clamp(state.scale / 1.18, 0, 1);
          shadowEl.style.transform = 'translate3d(' + (tm.width * progress).toFixed(1) + 'px, 0, 0) scale(' + shadowScale.toFixed(3) + ')';
        }
      } else if (phase === 'celebrate') {
        /* 100% 欢呼跳跃停顿 0.32s，然后掀开纸面幕布并起飞 */
        var cElapsed = (now - celebrateStart) / 1000;
        state.x = tm.left + tm.width;
        state.y = tm.y - 24;
        state.scale = 1.20;
        if (shadowEl) {
          var sAir = Math.max(0, -state.hopY);
          var sScale = clamp(1 - sAir / 48, 0.32, 1);
          shadowEl.style.transform = 'translate3d(' + tm.width.toFixed(1) + 'px, 0, 0) scale(' + sScale.toFixed(3) + ')';
        }
        if (cElapsed >= 0.32) {
          phase = 'flight';
          state.mode = 'flight';
          if (desktopMq.matches) document.documentElement.classList.add('ink-flight-active');
          flightStart = now;
          flightFrom = { x: state.x, y: state.y + state.hopY, scale: state.scale };
          state.hopY = 0;
          state.hopVy = 0;

          /* 同步淡出进度条文案、丝滑上掀幕布，并触发首屏精密词组编排 */
          if (stageEl) stageEl.classList.add('is-fading');
          preloader.classList.add('is-lifting');
          window.setTimeout(function () {
            document.documentElement.classList.remove('is-preloading');
            if (!curtainOpened && window.initPortfolioHero) {
              curtainOpened = true;
              window.initPortfolioHero();
            }
          }, 90);
        }
      } else if (phase === 'flight') {
        /* 0.72s 丝滑抛物线飞往首屏停靠位（实时读取落点，兼容各种窗口尺寸） */
        var fProgress = clamp((now - flightStart) / 720, 0, 1);
        var fEase = easeInOut(fProgress);
        flightTo = (window.scrollY || 0) > 80 && desktopMq.matches
          ? computeLiveTarget(now)
          : getHeroPerch();

        var prevFx = state.x;
        var prevFy = state.y;
        /* 二次贝塞尔高抛弧线，起飞轻盈优雅 */
        var arcLift = Math.min(130, Math.max(64, Math.hypot(flightTo.x - flightFrom.x, flightTo.y - flightFrom.y) * 0.28));
        var ctrlX = (flightFrom.x + flightTo.x) * 0.5;
        var ctrlY = Math.min(flightFrom.y, flightTo.y) - arcLift;
        var inv = 1 - fEase;
        state.x = inv * inv * flightFrom.x + 2 * inv * fEase * ctrlX + fEase * fEase * flightTo.x;
        state.y = inv * inv * flightFrom.y + 2 * inv * fEase * ctrlY + fEase * fEase * flightTo.y;
        state.vx = (state.x - prevFx) / dt;
        state.vy = (state.y - prevFy) / dt;
        state.scale = lerp(flightFrom.scale, flightTo.scale, fEase);
        state.tilt = clamp(state.vx / 42, -16, 16) * (1 - fEase * 0.65);

        if (!desktopMq.matches && fProgress > 0.72) {
          guide.style.opacity = String(clamp((1 - fProgress) / 0.28, 0, 1));
        }

        if (fProgress >= 1) {
          clearTimeout(failsafe);
          guide.style.removeProperty('opacity');
          state.tilt = 0;
          finishAll();
          return;
        }
      }

      renderGuide(now, dt);
      window.requestAnimationFrame(preloaderFrame);
    }

    window.requestAnimationFrame(preloaderFrame);
  }

  bindInteractions();
  scheduleNextBlink();
  runPreloader();

  window.inkCompanion = {
    hop: hop,
    happy: triggerHappy,
    wink: triggerWink,
    blink: function () { triggerBlink(false); }
  };
})();
