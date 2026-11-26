(function () {
  'use strict';

  var guide = document.getElementById('inkGuide');
  var preloader = document.getElementById('sitePreloader');
  if (!guide) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopMq = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');

  var shapePath = document.getElementById('inkGuidePath');
  var faceEl = guide.querySelector('.ink-face');
  var sparkLayer = document.getElementById('inkSparkLayer');
  var popover = document.getElementById('inkPopover');
  var popoverNote = document.getElementById('inkPopoverNote');
  var dialog = document.getElementById('projectDialog');
  var heroPeriod = document.getElementById('heroPeriod');
  var siteBrand = document.getElementById('siteBrand');
  var brandDot = document.getElementById('headerBrandDot');
  var pathStage = document.getElementById('pathStage');
  var pathLine = document.getElementById('pathLine');
  var pathLineFill = document.getElementById('pathLineFill');
  var pathCards = Array.from(document.querySelectorAll('#pathStage .pathCard'));

  var proofSection = document.getElementById('testimonials');
  var didiFeature = document.getElementById('didiFeature');
  var didiSubProjects = document.getElementById('didiSubProjects');
  var proofBridgeNode = document.getElementById('proofBridgeNode');
  var didiBridgeNode = document.getElementById('didiBridgeNode');
  var pairPivotNode = document.getElementById('pairPivotNode');
  var proofPair = document.getElementById('proofPair');
  var proofStageEls = {
    risk: document.querySelector('[data-proof-stage="risk"]'),
    diva: document.querySelector('[data-proof-stage="diva"]'),
    pricing: document.querySelector('[data-proof-stage="pricing"]'),
    baidu: document.querySelector('[data-proof-stage="baidu"]'),
    baichuan: document.querySelector('[data-proof-stage="baichuan"]')
  };
  var riskHighAnchor = document.getElementById('riskHighAnchor');
  var riskLowAnchor = document.getElementById('riskLowAnchor');
  var riskDropPath = document.getElementById('riskDropPath');
  var meterBarDiva = document.getElementById('meterBarDiva');
  var skillSteps = Array.from(document.querySelectorAll('#skillPipeline .skill-step'));
  var baiduDimCols = Array.from(document.querySelectorAll('#baiduDims .eval-dim-col'));
  var baichuanStamps = Array.from(document.querySelectorAll('#baichuanStamps .rag-stamp'));

  var proofArchive = proofSection ? proofSection.querySelector('.proof-archive-heading') : null;
  var signalsSection = document.querySelector('.signals-section');
  var darkAct = document.getElementById('darkAct');
  var curtainTab = document.getElementById('darkCurtainTab');
  var curtainBerth = document.getElementById('curtainBerth');
  var workStage = document.getElementById('workStage');
  var workFrame = document.getElementById('workStageFrame');
  var workDockTrigger = document.getElementById('workDockTrigger');
  var workBerth = document.getElementById('workBerth');
  var capabilitiesSection = document.getElementById('capabilities');
  var capabilityLinesWrap = document.getElementById('capabilityLines');
  var capabilityLines = capabilitiesSection ? Array.from(capabilitiesSection.querySelectorAll('.capability-line')) : [];
  var methodSection = document.getElementById('method');
  var paperSteps = document.getElementById('paperSteps');
  var methodCards = paperSteps ? Array.from(paperSteps.children) : [];
  var knowledgeSection = document.getElementById('knowledge');
  var knowledgeList = knowledgeSection ? knowledgeSection.querySelector('.knowledge-list') : null;
  var footer = document.getElementById('footer');
  var talkText = document.getElementById('talkText');
  var talkArrow = document.getElementById('talkArrow');
  var footerRunway = document.getElementById('footerRunway');
  var runwayBerth = document.getElementById('runwayBerth');

  function clamp(v, min, max) { return v < min ? min : (v > max ? max : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function quadBezier(ax, ay, cx, cy, bx, by, t) {
    var inv = 1 - t;
    return {
      x: inv * inv * ax + 2 * inv * t * cx + t * t * bx,
      y: inv * inv * ay + 2 * inv * t * cy + t * t * by
    };
  }

  /* A1 轮廓形变函数：compact=0 为完整微前倾对话块，compact=0.7 收束尾翼贴合紧凑泊位 */
  function buildContour(compact) {
    var tailX = lerp(20.5, 25.4, compact);
    var tailY = lerp(46.0, 38.4, compact);
    var shoulder = lerp(11.0, 9.0, compact);
    var bottom = lerp(36.0, 35.6, compact);
    return 'M ' + shoulder.toFixed(1) + ' 5 H 47 Q 53 5 52 11 L 49.5 30 Q 48.5 ' +
      bottom.toFixed(1) + ' 42.5 ' + bottom.toFixed(1) + ' H 31 L ' +
      tailX.toFixed(1) + ' ' + tailY.toFixed(1) + ' L 22 ' + bottom.toFixed(1) +
      ' H 11 Q 5 ' + bottom.toFixed(1) + ' 6 30 L 8 11 Q 8.8 5 ' + shoulder.toFixed(1) + ' 5 Z';
  }

  var state = {
    mode: 'idle',
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0,
    scale: 1,
    compact: 0,
    lastCompactKey: -1,
    tilt: 0,
    idleTilt: 0,
    idleTiltUntil: 0,
    nextIdleBeatAt: performance.now() + 3000,
    workBonkUntil: 0,
    hopY: 0,
    hopVy: 0,
    squash: 0,
    squashV: 0,
    gx: 0,
    gy: 0,
    targetGx: 0,
    targetGy: 0,
    happyUntil: 0,
    winkUntil: 0,
    curious: false,
    selfHovered: false,
    pulsing: false,
    isDark: false,
    dockedInControl: false,
    activeAct: 'hero',
    activeBerth: '',
    activeProofStage: '',
    activeWaypoint: '',
    activeCapIdx: -1,
    steppedTalkIdx: -1,
    pointerX: window.innerWidth * 0.5,
    pointerY: window.innerHeight * 0.5,
    pointerActiveAt: 0,
    lastScrollAt: 0,
    lastScrollY: window.scrollY || 0,
    nextIdleGlanceAt: performance.now() + 2600,
    idleGx: 0,
    idleGy: 0,
    hoveredEl: null,
    hoveredKind: '',
    lastPathIdx: -1,
    lastMethodIdx: -1,
    popoverOpen: false,
    lastFrame: performance.now()
  };

  /* 1. 表情、眨眼、极简编辑风火花与快捷卡片 */
  var blinkTimer = 0;
  var blinkCloseTimer = 0;

  function triggerBlink(allowDouble) {
    if (state.mode === 'hidden') return;
    if (guide.classList.contains('is-happy') || guide.classList.contains('is-wink')) return;
    guide.classList.add('is-blinking');
    clearTimeout(blinkCloseTimer);
    blinkCloseTimer = window.setTimeout(function () {
      guide.classList.remove('is-blinking');
      if (allowDouble && Math.random() < 0.25) {
        blinkCloseTimer = window.setTimeout(function () {
          triggerBlink(false);
        }, 120);
      }
    }, 125);
  }

  function scheduleNextBlink() {
    clearTimeout(blinkTimer);
    if (reducedMotion) return;
    var delay = 2400 + Math.random() * 2600;
    blinkTimer = window.setTimeout(function () {
      triggerBlink(true);
      scheduleNextBlink();
    }, delay);
  }

  function hop(strength) {
    var s = typeof strength === 'number' ? strength : 1;
    state.hopVy = -255 * s;
    state.squashV += 4.0 * s;
  }

  function triggerHappy(durationMs, withHop) {
    state.happyUntil = Math.max(state.happyUntil, performance.now() + (durationMs || 900));
    if (withHop) hop(0.75);
    pulseOnce();
  }

  function triggerWink(durationMs, withHop) {
    state.winkUntil = Math.max(state.winkUntil, performance.now() + (durationMs || 360));
    if (withHop) hop(0.42);
  }

  var pulseTimeout = 0;
  function pulseOnce() {
    guide.classList.add('is-burst');
    clearTimeout(pulseTimeout);
    pulseTimeout = window.setTimeout(function () {
      guide.classList.remove('is-burst');
    }, 660);
  }

  /* 极简编辑风焦橙/暖金火花微粒（用于作品切屏顶撞展台框 & 风控降耗落位瞬间） */
  function emitSparks(cx, cy, isDarkSurface, count, upwardBias) {
    if (!sparkLayer || reducedMotion || !desktopMq.matches) return;
    var n = count || 9;
    var palette = isDarkSurface
      ? ['#ef8a4c', '#ffbe8a', '#f6f2ed', '#d45118']
      : ['#d45118', '#e06122', '#ef8a4c', '#17140f'];
    for (var i = 0; i < n; i++) {
      var angle = upwardBias
        ? (-Math.PI * 0.92 + (i / Math.max(1, n - 1)) * Math.PI * 0.84) + (Math.random() - 0.5) * 0.2
        : (Math.PI * 2 * i / n) + (Math.random() - 0.5) * 0.3;
      var dist = 24 + Math.random() * 34;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist - (upwardBias ? 8 : 0);
      var isDash = i % 2 === 0;
      var el = document.createElement('span');
      el.className = 'ink-spark';
      el.style.setProperty('--sp-x', Math.round(cx) + 'px');
      el.style.setProperty('--sp-y', Math.round(cy) + 'px');
      el.style.setProperty('--sp-dx', dx.toFixed(1) + 'px');
      el.style.setProperty('--sp-dy', dy.toFixed(1) + 'px');
      el.style.setProperty('--sp-w', isDash ? '7px' : '4.5px');
      el.style.setProperty('--sp-h', isDash ? '2.2px' : '4.5px');
      el.style.setProperty('--sp-r', isDash ? '2px' : '50%');
      el.style.setProperty('--sp-rot', (angle * 180 / Math.PI).toFixed(1) + 'deg');
      el.style.setProperty('--sp-color', palette[i % palette.length]);
      el.style.setProperty('--sp-dur', (460 + Math.round(Math.random() * 180)) + 'ms');
      sparkLayer.appendChild(el);
      (function (node) {
        window.setTimeout(function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        }, 700);
      })(el);
    }
  }

  /* 作品展台切屏时的物理“向上顶撞框 + 焦橙小烟花 + 展台弹性回弹” */
  var frameBonkTimer = 0;
  function triggerWorkFrameBonk() {
    if (state.mode !== 'live' || !desktopMq.matches) return;
    state.workBonkUntil = performance.now() + 420;
    hop(0.95);
    triggerWink(420, false);

    window.setTimeout(function () {
      if (workFrame) {
        workFrame.classList.remove('is-bonked');
        void workFrame.offsetWidth;
        workFrame.classList.add('is-bonked');
        clearTimeout(frameBonkTimer);
        frameBonkTimer = window.setTimeout(function () {
          workFrame.classList.remove('is-bonked');
        }, 580);
      }
      var sx = state.x;
      var sy = state.y - 22;
      if (workFrame) {
        var fr = workFrame.getBoundingClientRect();
        sx = clamp(state.x, fr.left + 32, fr.right - 32);
        sy = fr.bottom - 2;
      }
      emitSparks(sx, sy, true, 10, true);
    }, 85);
  }

  var actNotes = {
    hero: '你好，我是这段作品集的活体句点。想直接了解张倬玮？',
    path: '五段经历串成同一条证据链，想直接追问细节？',
    proof: '滴滴风控预审、DiVA、比价 Skill 与百度/百川实习成果，欢迎追问。',
    work: '正在浏览精选作品，也可以直接和 AI 分身聊设计取舍。',
    capabilities: '从模型评估到业务落地，聊聊具体项目吗？',
    method: '这套 AI 产品方法论来自真实踩坑，随时可追问。',
    knowledge: '7 篇一线评测与 Agent 沉淀，也可以先带走简历。',
    footer: '随时欢迎联系，或者先让 AI 分身回答你的问题。'
  };

  function positionPopover() {
    if (!popover || !state.popoverOpen) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var pw = 228;
    var ph = popover.offsetHeight || 104;
    var left;
    var top;
    if (state.x + 28 + pw <= vw - 18) {
      left = state.x + 28;
      top = clamp(state.y - ph * 0.5, 84, vh - ph - 16);
    } else if (state.x - 28 - pw >= 18) {
      left = state.x - 28 - pw;
      top = clamp(state.y - ph * 0.5, 84, vh - ph - 16);
    } else {
      left = clamp(state.x - pw / 2, 16, vw - pw - 16);
      var preferAbove = state.y > ph + 96;
      top = clamp(preferAbove ? state.y - ph - 32 : state.y + 32, 84, vh - ph - 16);
    }
    popover.style.left = Math.round(left) + 'px';
    popover.style.top = Math.round(top) + 'px';
    popover.classList.toggle('is-dark', state.isDark);
  }

  function openPopover() {
    if (!popover || !desktopMq.matches) return;
    if (popoverNote) popoverNote.textContent = actNotes[state.activeAct] || actNotes.hero;
    popover.hidden = false;
    state.popoverOpen = true;
    positionPopover();
    window.requestAnimationFrame(function () {
      if (state.popoverOpen) popover.classList.add('is-open');
    });
  }

  function closePopover() {
    if (!popover || !state.popoverOpen) return;
    state.popoverOpen = false;
    popover.classList.remove('is-open');
    window.setTimeout(function () {
      if (!state.popoverOpen) popover.hidden = true;
    }, 220);
  }

  var headerCameoTimer = 0;
  var headerCameoStep = 0;

  function stopHeaderCameo() {
    if (headerCameoTimer) {
      clearInterval(headerCameoTimer);
      headerCameoTimer = 0;
    }
  }

  function startHeaderCameo() {
    stopHeaderCameo();
    headerCameoStep = 0;
    window.setTimeout(function () {
      if (state.activeBerth === 'header') triggerWink(420, true);
    }, 220);
    headerCameoTimer = window.setInterval(function () {
      if (state.mode !== 'live' || state.activeBerth !== 'header' || document.hidden) return;
      headerCameoStep++;
      if (headerCameoStep % 2 === 1) {
        triggerHappy(780, false);
      } else {
        triggerWink(420, true);
      }
    }, 2500);
  }

  function syncProofStageFocus(stageKey) {
    if (state.activeProofStage === stageKey) return;
    state.activeProofStage = stageKey;
    Object.keys(proofStageEls).forEach(function (k) {
      if (proofStageEls[k]) proofStageEls[k].classList.toggle('is-companion-focus', k === stageKey);
    });
    if (stageKey) {
      hop(0.32);
      triggerWink(300, false);
    }
  }

  function syncWaypoints(wpKey) {
    if (state.activeWaypoint === wpKey) return;
    state.activeWaypoint = wpKey;
    if (didiBridgeNode) didiBridgeNode.classList.toggle('is-lit', wpKey === 'didi');
    if (proofBridgeNode) proofBridgeNode.classList.toggle('is-lit', wpKey === 'proof');
    if (pairPivotNode) pairPivotNode.classList.toggle('is-lit', wpKey === 'pair');
    if (wpKey) hop(0.28);
  }

  var capTapTimers = [];
  function syncCapabilitiesFocus(capIdx) {
    if (state.activeCapIdx === capIdx) return;
    state.activeCapIdx = capIdx;
    if (capabilityLinesWrap) {
      capabilityLinesWrap.classList.toggle('has-companion-focus', capIdx >= 0);
    }
    for (var i = 0; i < capabilityLines.length; i++) {
      var isCur = i === capIdx;
      capabilityLines[i].classList.toggle('is-companion-active', isCur);
      if (isCur) {
        capabilityLines[i].classList.remove('is-tapped');
        void capabilityLines[i].offsetWidth;
        capabilityLines[i].classList.add('is-tapped');
        clearTimeout(capTapTimers[i]);
        (function (idx, el) {
          capTapTimers[idx] = window.setTimeout(function () {
            el.classList.remove('is-tapped');
          }, 600);
        })(i, capabilityLines[i]);
      }
    }
    if (capIdx >= 0 && capabilityLines[capIdx] && state.mode === 'live') {
      hop(0.40);
      triggerWink(340, false);
      var titleSpan = capabilityLines[capIdx].querySelector('.capability-title') || capabilityLines[capIdx];
      var tr = titleSpan.getBoundingClientRect();
      if (tr.top > 40 && tr.bottom < window.innerHeight - 20) {
        emitSparks(tr.right + 16, tr.top + tr.height * 0.52, true, 5, false);
      }
    }
  }

  function syncSteppedTalkLetter(stepIdx, letters) {
    if (state.steppedTalkIdx === stepIdx) return;
    state.steppedTalkIdx = stepIdx;
    if (letters && letters.length) {
      for (var i = 0; i < letters.length; i++) {
        letters[i].classList.toggle('is-stepped', i === stepIdx);
      }
    }
    if (talkArrow) {
      talkArrow.classList.toggle('is-stepped', stepIdx === 999);
    }
  }

  function syncBerths(activeBerth) {
    var prevBerth = state.activeBerth;
    state.activeBerth = activeBerth;
    if (siteBrand) siteBrand.classList.toggle('is-berth-active', activeBerth === 'header');
    if (curtainTab) curtainTab.classList.toggle('is-berth-active', activeBerth === 'curtain');
    if (workDockTrigger) workDockTrigger.classList.toggle('is-berth-active', activeBerth === 'work');
    if (footerRunway) footerRunway.classList.toggle('is-berth-active', activeBerth === 'runway');

    if (prevBerth !== activeBerth) {
      if (activeBerth === 'header') {
        startHeaderCameo();
      } else {
        stopHeaderCameo();
      }
      if (activeBerth === 'runway') {
        triggerHappy(950, true);
        emitSparks(state.x, state.y - 6, false, 8, false);
      }
    }
  }

  function applyVisuals(now, dt) {
    if (state.hopY < 0 || state.hopVy !== 0) {
      state.hopVy += 1550 * dt;
      state.hopY += state.hopVy * dt;
      if (state.hopY >= 0) {
        state.hopY = 0;
        if (Math.abs(state.hopVy) > 90) {
          state.squashV -= Math.min(7.2, Math.abs(state.hopVy) * 0.017);
        }
        state.hopVy = 0;
      }
    }

    var springForce = -115 * state.squash - 14 * state.squashV;
    state.squashV += springForce * dt;
    state.squash += state.squashV * dt;
    if (Math.abs(state.squash) < 0.002 && Math.abs(state.squashV) < 0.01) {
      state.squash = 0;
      state.squashV = 0;
    }

    var compactKey = Math.round(state.compact * 50);
    if (shapePath && compactKey !== state.lastCompactKey) {
      state.lastCompactKey = compactKey;
      shapePath.setAttribute('d', buildContour(state.compact));
    }

    var gazeFollow = 1 - Math.exp(-15 * dt);
    state.gx += (state.targetGx - state.gx) * gazeFollow;
    state.gy += (state.targetGy - state.gy) * gazeFollow;
    if (faceEl) {
      faceEl.setAttribute('transform', 'translate(' + (state.gx * 4.1).toFixed(2) + ' ' + (state.gy * 3.1).toFixed(2) + ')');
    }

    var speed = Math.hypot(state.vx, state.vy);
    var trailScale = speed > 165 ? clamp((speed - 145) / 700, 0, 1.05) : 0;
    var trailOpacity = speed > 175 ? clamp((speed - 175) / 330, 0, 0.78) : 0;
    guide.style.setProperty('--trail-scale', trailScale.toFixed(3));
    guide.style.setProperty('--trail-opacity', trailOpacity.toFixed(3));
    if (trailOpacity > 0.02) {
      var trailDeg = Math.atan2(state.vy, state.vx) * 180 / Math.PI - state.tilt;
      guide.style.setProperty('--trail-angle', trailDeg.toFixed(1) + 'deg');
    }

    /* 静止阅读时的生命微节拍 */
    if (state.mode === 'live' && !document.hidden && now - state.lastScrollAt > 1500 && speed < 55) {
      if (now >= state.nextIdleBeatAt) {
        var r = Math.random();
        if (r < 0.36) {
          state.idleTilt = (Math.random() < 0.5 ? -1 : 1) * (5.5 + Math.random() * 3.2);
          state.idleTiltUntil = now + 1350;
          triggerBlink(false);
        } else if (r < 0.66) {
          hop(state.dockedInControl ? 0.28 : 0.38);
          triggerBlink(true);
        } else if (r < 0.86) {
          triggerWink(380, false);
          state.idleTilt = (Math.random() < 0.5 ? -4.5 : 4.5);
          state.idleTiltUntil = now + 900;
        } else {
          triggerHappy(720, false);
        }
        state.nextIdleBeatAt = now + 2800 + Math.random() * 1900;
      }
    }
    if (now > state.idleTiltUntil) {
      state.idleTilt = 0;
    }

    var isHappy = state.selfHovered || now < state.happyUntil;
    var isWink = !isHappy && now < state.winkUntil;
    guide.classList.toggle('is-happy', isHappy);
    guide.classList.toggle('is-wink', isWink);
    guide.classList.toggle('is-curious', !isHappy && !isWink && state.curious);
    guide.classList.toggle('is-pulsing', state.pulsing);
    guide.classList.toggle('is-dark-surface', state.isDark);
    guide.style.pointerEvents = (state.mode === 'live' && !state.dockedInControl && desktopMq.matches) ? 'auto' : 'none';

    var hStretch = clamp(Math.abs(state.vx) / 1150, 0, 0.14);
    var vStretch = clamp(Math.abs(state.vy) / 1150, 0, 0.16);
    var hoverBoost = state.selfHovered ? 1.09 : 1;
    var calm = state.mode === 'live' && speed < 65 && state.hopY === 0;
    var breatheY = calm ? Math.sin(now * 0.0033) * (state.dockedInControl ? 1.35 : 2.55) : 0;
    var breatheSquash = calm ? Math.sin(now * 0.0033 - 0.7) * (state.dockedInControl ? 0.02 : 0.03) : 0;

    var sx = state.scale * hoverBoost * (1 - state.squash * 0.20 + breatheSquash + hStretch - vStretch * 0.42);
    var sy = state.scale * hoverBoost * (1 + state.squash * 0.20 - breatheSquash + vStretch - hStretch * 0.42);
    var drawX = state.x - 22;
    var drawY = state.y - 20 + state.hopY + breatheY;

    guide.style.transform =
      'translate3d(' + drawX.toFixed(2) + 'px,' + drawY.toFixed(2) + 'px,0) ' +
      'rotate(' + state.tilt.toFixed(2) + 'deg) ' +
      'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';

    if (state.popoverOpen) positionPopover();
  }

  /* 2. 首屏稳定落点与各幕精确锚点工具 */
  function getHeroPerch() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    if (desktopMq.matches && heroPeriod) {
      var clip = heroPeriod.parentElement || heroPeriod;
      var r = clip.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        return {
          x: clamp(r.left + r.width * 0.56 + 10, 60, vw - 48),
          y: clamp(r.bottom - r.height * 0.265, 92, vh - 100),
          scale: 0.78,
          compact: 0
        };
      }
    }
    if (brandDot) {
      var br = brandDot.getBoundingClientRect();
      return {
        x: br.left + br.width / 2,
        y: br.top + br.height / 2,
        scale: desktopMq.matches ? 0.56 : 0.28,
        compact: 0.65
      };
    }
    return { x: vw * 0.76, y: vh * 0.36, scale: 0.78, compact: 0 };
  }

  function getHeaderAnchor() {
    if (!brandDot) return { x: 180, y: 38 };
    var br = brandDot.getBoundingClientRect();
    return { x: br.left + br.width / 2, y: br.top + br.height / 2 + 1 };
  }

  function getElCenter(el, offsetY) {
    if (!el) return null;
    var r = el.getBoundingClientRect();
    if (r.width < 2 && r.height < 2) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 + (offsetY || 0) };
  }

  /* 5 组实习专属互动锚点计算 */
  function getProofStageAnchor(stageKey, now) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var pm = window.portfolioProofMeters;
    var p = pm ? pm.getProgress(stageKey) : 1;

    if (stageKey === 'risk') {
      if (riskHighAnchor && riskDropPath && riskLowAnchor) {
        var hiR = riskHighAnchor.getBoundingClientRect();
        var loR = riskLowAnchor.getBoundingClientRect();
        if (p < 0.24) {
          /* 阶段 1：绕着 120 分钟高点优雅转一圈蓄势 */
          var orbitT = p / 0.24;
          var ang = -Math.PI * 0.75 + orbitT * Math.PI * 2;
          return {
            x: clamp(hiR.left + hiR.width * 0.5 + Math.cos(ang) * 34, 44, vw - 44),
            y: clamp(hiR.top + hiR.height * 0.45 + Math.sin(ang) * 20, 86, vh - 40),
            tilt: Math.cos(ang) * 12,
            gx: -Math.cos(ang) * 0.75,
            gy: -Math.sin(ang) * 0.75,
            isDark: false
          };
        }
        if (p < 0.99 && typeof riskDropPath.getTotalLength === 'function') {
          /* 阶段 2：顺着焦橙下降曲线俯冲坠落 120 -> 30 分钟！ */
          var dropT = clamp((p - 0.24) / 0.75, 0, 1);
          var len = riskDropPath.getTotalLength();
          var pt = riskDropPath.getPointAtLength(dropT * len);
          var svgEl = riskDropPath.ownerSVGElement;
          var svgR = svgEl ? svgEl.getBoundingClientRect() : null;
          if (svgR && svgR.width > 10) {
            var vx = svgR.left + (pt.x / 260) * svgR.width;
            var vy = svgR.top + (pt.y / 92) * svgR.height - 14;
            return {
              x: clamp(vx, 44, vw - 44),
              y: clamp(vy, 86, vh - 40),
              tilt: 14 * Math.sin(dropT * Math.PI),
              gx: 0.7,
              gy: 0.65,
              isDark: false
            };
          }
        }
        /* 阶段 3：稳稳落在 30 分钟上方微笑注视 */
        return {
          x: clamp(loR.left + loR.width * 0.5, 44, vw - 44),
          y: clamp(loR.top - 16, 86, vh - 40),
          tilt: -4,
          gx: 0,
          gy: 0.85,
          isDark: false
        };
      }
      return null;
    }

    if (stageKey === 'diva' && meterBarDiva) {
      var r = meterBarDiva.getBoundingClientRect();
      if (r.width < 10) return null;
      var ratio = pm ? pm.getRatio('diva') : 0.67;
      return {
        x: clamp(r.left + r.width * ratio, 40, vw - 36),
        y: clamp(r.top - 15, 84, vh - 36),
        tilt: 4,
        gx: -0.3,
        gy: -0.85,
        isDark: false
      };
    }

    if (stageKey === 'pricing' && skillSteps.length >= 3) {
      /* 在 3 个 Skill 节点胶囊头顶弹性跳踩（采集 → 匹配 → 缺口清单） */
      var seg = p * 2;
      var idx = Math.min(1, Math.floor(seg));
      var local = clamp(seg - idx, 0, 1);
      var aR = skillSteps[idx].getBoundingClientRect();
      var bR = skillSteps[idx + 1].getBoundingClientRect();
      var hopArc = (p > 0.02 && p < 0.98) ? Math.sin(local * Math.PI) * 20 : 0;
      return {
        x: clamp(lerp(aR.left + aR.width / 2, bR.left + bR.width / 2, easeInOut(local)), 44, vw - 40),
        y: clamp(lerp(aR.top, bR.top, local) - 16 - hopArc, 84, vh - 36),
        tilt: (p < 0.98 ? 7 : -3),
        gx: p < 0.98 ? 0.65 : -0.25,
        gy: -0.75,
        isDark: false
      };
    }

    if (stageKey === 'baidu' && baiduDimCols.length >= 7) {
      /* 掠过百度 7 根评测竖柱顶部，像指尖轻拨琴键拉起柱子 */
      var fIdx = clamp(p * (baiduDimCols.length - 1), 0, baiduDimCols.length - 1);
      var c0 = Math.floor(fIdx);
      var c1 = Math.min(baiduDimCols.length - 1, c0 + 1);
      var ft = fIdx - c0;
      var r0 = baiduDimCols[c0].getBoundingClientRect();
      var r1 = baiduDimCols[c1].getBoundingClientRect();
      var wave = (p > 0.02 && p < 0.98) ? Math.sin(fIdx * Math.PI) * 7 : 0;
      return {
        x: clamp(lerp(r0.left + r0.width / 2, r1.left + r1.width / 2, ft), 44, vw - 44),
        y: clamp(lerp(r0.top, r1.top, ft) - 14 - wave, 84, vh - 36),
        tilt: (p < 0.98 ? 6 : -3),
        gx: -0.35,
        gy: -0.82,
        isDark: false
      };
    }

    if (stageKey === 'baichuan' && baichuanStamps.length >= 3) {
      /* 深咖啡黑卡片上依次踩亮 R1 召回 → R2 排序 → R3 溯源 印记 */
      var bSeg = p * 2;
      var bIdx = Math.min(1, Math.floor(bSeg));
      var bLoc = clamp(bSeg - bIdx, 0, 1);
      var sa = baichuanStamps[bIdx].getBoundingClientRect();
      var sb = baichuanStamps[bIdx + 1].getBoundingClientRect();
      var bArc = (p > 0.02 && p < 0.98) ? Math.sin(bLoc * Math.PI) * 18 : 0;
      return {
        x: clamp(lerp(sa.left + sa.width / 2, sb.left + sb.width / 2, easeInOut(bLoc)), 44, vw - 40),
        y: clamp(lerp(sa.top, sb.top, bLoc) - 16 - bArc, 84, vh - 36),
        tilt: -4,
        gx: -0.35,
        gy: -0.82,
        isDark: true
      };
    }

    return null;
  }

  /* 经由中间枢纽组件的两段平滑路径工具（告别左右生硬直飞） */
  function twoStageWaypoint(fromPt, midPt, toPt, t) {
    if (t < 0.5) {
      var u = easeInOut(t / 0.5);
      return quadBezier(fromPt.x, fromPt.y, lerp(fromPt.x, midPt.x, 0.5), Math.min(fromPt.y, midPt.y) - 22, midPt.x, midPt.y, u);
    }
    var v = easeInOut((t - 0.5) / 0.5);
    return quadBezier(midPt.x, midPt.y, lerp(midPt.x, toPt.x, 0.5), Math.min(midPt.y, toPt.y) - 22, toPt.x, toPt.y, v);
  }

  /* 3. 全站 8 幕自然中转 S 型空间动线 + Let's talk 跳字母滑落终幕 */
  function computeLiveTarget(now) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var y = window.scrollY || 0;

    var hero = getHeroPerch();
    var tx = hero.x;
    var ty = hero.y;
    var scale = hero.scale;
    var compact = 0;
    var pulsing = y < 48;
    var isDark = false;
    var tiltTarget = 0;
    var actGazeX = null;
    var actGazeY = null;
    var activeAct = 'hero';
    var activeBerth = '';
    var activeProofStage = '';
    var activeWaypoint = '';
    var activeCapIdx = -1;
    var followLambda = 12.2;
    var steppedTalkIdx = -1;
    var talkLettersCache = null;
    var dockedInControl = false;

    if (y >= 110) {
      tx = clamp(vw * 0.5, 80, vw - 80);
      ty = clamp(128, 96, vh - 120);
      scale = 0.64;
      compact = 0.25;
      pulsing = false;
      activeAct = 'rail';
    }

    /* Act 2: 经历时间轴 01(左) -> 03(中) -> 05(右)，离开时自然落向滴滴旗舰风控 120m 高点 */
    if (pathStage && pathLine && pathCards.length) {
      var stageRect = pathStage.getBoundingClientRect();
      var enterStart = vh * 0.90;
      var sweepStart = vh * 0.68;
      var sweepEnd = vh * 0.24;
      var exitEnd = vh * 0.02;

      if (stageRect.top <= enterStart && stageRect.top >= exitEnd) {
        activeAct = 'path';
        var lineRect = pathLine.getBoundingClientRect();
        var startNodeX = pathCards[0].getBoundingClientRect().left + 24.5;
        var endNodeX = pathCards[pathCards.length - 1].getBoundingClientRect().left + 24.5;
        var railY = lineRect.top + lineRect.height / 2 - 17;

        if (stageRect.top > sweepStart) {
          var tIn = easeInOut(clamp((enterStart - stageRect.top) / (enterStart - sweepStart), 0, 1));
          tx = lerp(hero.x, startNodeX, tIn);
          ty = lerp(hero.y, railY, tIn) - Math.sin(tIn * Math.PI) * 34;
          scale = lerp(hero.scale, 0.66, tIn);
          compact = lerp(0, 0.42, tIn);
          var lit0 = tIn > 0.85;
          if (pathLineFill) pathLineFill.style.setProperty('--path-fill', lit0 ? '0.06' : '0');
          pathCards.forEach(function (c, i) {
            c.classList.toggle('is-passed', i === 0 && lit0);
            c.classList.toggle('is-current', i === 0 && lit0);
          });
          if (lit0 && state.lastPathIdx !== 0) {
            state.lastPathIdx = 0;
            hop(0.42);
          }
        } else if (stageRect.top >= sweepEnd) {
          var tSweep = clamp((sweepStart - stageRect.top) / (sweepStart - sweepEnd), 0, 1);
          tx = lerp(startNodeX, endNodeX, tSweep);
          ty = railY;
          scale = 0.68;
          compact = 0.42;
          pulsing = true;
          var fillRatio = clamp((tx - lineRect.left) / Math.max(1, lineRect.width), 0.04, 1);
          if (pathLineFill) pathLineFill.style.setProperty('--path-fill', fillRatio.toFixed(4));
          var passedIdx = Math.floor(tSweep * (pathCards.length - 1) + 0.15);
          pathCards.forEach(function (c, i) {
            c.classList.toggle('is-passed', i <= passedIdx);
            c.classList.toggle('is-current', i === passedIdx);
          });
          if (passedIdx !== state.lastPathIdx) {
            state.lastPathIdx = passedIdx;
            hop(0.48);
          }
          actGazeX = 0.12;
          actGazeY = 0.88;
        } else {
          var tOut = easeInOut(clamp((sweepEnd - stageRect.top) / (sweepEnd - exitEnd), 0, 1));
          var riskA0 = getProofStageAnchor('risk', now) || { x: vw * 0.66, y: vh * 0.56 };
          var exitPt = quadBezier(
            endNodeX, railY,
            vw * 0.72, Math.max(110, lerp(railY, riskA0.y, 0.5) - 26),
            riskA0.x, clamp(riskA0.y, 120, vh * 0.72),
            tOut
          );
          tx = exitPt.x;
          ty = exitPt.y;
          scale = lerp(0.66, 0.58, tOut);
          compact = lerp(0.42, 0.46, tOut);
          if (pathLineFill) pathLineFill.style.setProperty('--path-fill', '1');
          pathCards.forEach(function (c) {
            c.classList.add('is-passed');
            c.classList.remove('is-current');
          });
        }
      } else if (stageRect.top < exitEnd) {
        if (pathLineFill) pathLineFill.style.setProperty('--path-fill', '1');
        pathCards.forEach(function (c) {
          c.classList.add('is-passed');
          c.classList.remove('is-current');
        });
      } else {
        if (pathLineFill) pathLineFill.style.setProperty('--path-fill', '0');
        state.lastPathIdx = -1;
        pathCards.forEach(function (c) {
          c.classList.remove('is-passed');
          c.classList.remove('is-current');
        });
      }
    }

    function applyHeaderDocked(baseGazeX) {
      var head = getHeaderAnchor();
      activeBerth = 'header';
      dockedInControl = true;
      tx = head.x;
      ty = head.y;
      scale = 0.56;
      compact = 0.52;
      pulsing = false;
      isDark = false;
      tiltTarget = 0;
      var scan = Math.sin(now * 0.0013) * 0.40;
      actGazeX = clamp((typeof baseGazeX === 'number' ? baseGazeX : 0.30) + scan, -0.35, 0.88);
      actGazeY = 0.92;
    }

    /* Act 3: 实习成果区 — 5 种不同交互 + 3 处中间枢纽中转（风控降耗弧 → DiVA 进度条 → ✦枢纽 → 比价3节点 → 居中标尺桥 → 百度7维柱 → ◐枢纽 → 百川3轮印记 → 平滑弧线升入顶栏） */
    if (proofSection && activeAct !== 'path') {
      var pr = proofSection.getBoundingClientRect();
      var sigRect = signalsSection ? signalsSection.getBoundingClientRect() : null;
      var proofBandBottom = sigRect ? sigRect.bottom : pr.bottom;

      if (pr.top < vh * 0.85 && proofBandBottom > vh * 0.12) {
        activeAct = 'proof';
        var didiRect = didiFeature ? didiFeature.getBoundingClientRect() : null;
        var subRect = didiSubProjects ? didiSubProjects.getBoundingClientRect() : null;
        var pairRect = proofPair ? proofPair.getBoundingClientRect() : null;
        var archRect = proofArchive ? proofArchive.getBoundingClientRect() : null;

        var riskA = getProofStageAnchor('risk', now);
        var divaA = getProofStageAnchor('diva', now);
        var pricingA = getProofStageAnchor('pricing', now);
        var baiduA = getProofStageAnchor('baidu', now);
        var baichuanA = getProofStageAnchor('baichuan', now);

        var didiMid = getElCenter(didiBridgeNode, -2) || { x: vw * 0.5, y: vh * 0.5 };
        var bridgeMid = getElCenter(proofBridgeNode, -16) || { x: vw * 0.5, y: vh * 0.5 };
        var pairMid = getElCenter(pairPivotNode, -2) || { x: vw * 0.55, y: vh * 0.5 };

        var climbStart = vh * 0.84;
        var climbEnd = vh * 0.46;

        if (archRect && archRect.top <= climbEnd) {
          applyHeaderDocked(0.32);
        } else if (state.hoveredEl && state.hoveredKind === 'proof-stage') {
          var hStage = state.hoveredEl.dataset.proofStage;
          var hAnchor = getProofStageAnchor(hStage, now);
          if (hAnchor) {
            activeProofStage = hStage;
            tx = hAnchor.x;
            ty = hAnchor.y;
            scale = 0.58;
            compact = 0.46;
            isDark = hAnchor.isDark;
            dockedInControl = true;
            tiltTarget = hAnchor.tilt || 0;
            actGazeX = hAnchor.gx;
            actGazeY = hAnchor.gy;
          }
        } else if (archRect && archRect.top < climbStart) {
          var tClimb = easeInOut(clamp((climbStart - archRect.top) / (climbStart - climbEnd), 0, 1));
          var fromPt = baichuanA || { x: vw * 0.74, y: vh * 0.56 };
          var headPt = getHeaderAnchor();
          var ctrlX = vw * 0.44;
          var ctrlY = Math.max(54, lerp(fromPt.y, headPt.y, 0.48) - 48);
          var climbPos = quadBezier(fromPt.x, fromPt.y, ctrlX, ctrlY, headPt.x, headPt.y, tClimb);
          tx = climbPos.x;
          ty = climbPos.y;
          scale = lerp(0.58, 0.56, tClimb);
          compact = lerp(0.46, 0.52, tClimb);
          isDark = tClimb < 0.25;
          dockedInControl = true;
          actGazeX = lerp(-0.82, 0.30, tClimb);
          actGazeY = lerp(-0.68, 0.90, tClimb);
          if (tClimb > 0.92) activeBerth = 'header';
        } else if (pairRect && pairRect.top < vh * 0.76 && baiduA && baichuanA) {
          /* 滴滴右侧 → 居中过渡标尺 (#proofBridgeNode) → 百度 7 维柱 → 明暗枢纽 (#pairPivotNode) → 百川深墨 3 轮印记 */
          var pairP = clamp((vh * 0.76 - pairRect.top) / Math.max(340, pairRect.height * 1.15), 0, 1);
          dockedInControl = true;
          if (pairP < 0.24 && pricingA) {
            var tBridge = pairP / 0.24;
            var posB = twoStageWaypoint(
              { x: pricingA.x, y: clamp(pricingA.y, 92, vh * 0.44) },
              bridgeMid,
              baiduA,
              tBridge
            );
            tx = posB.x;
            ty = posB.y;
            scale = 0.58;
            compact = 0.48;
            if (tBridge > 0.28 && tBridge < 0.72) activeWaypoint = 'proof';
            activeProofStage = tBridge > 0.72 ? 'baidu' : (tBridge < 0.28 ? 'pricing' : '');
            actGazeX = tBridge < 0.5 ? -0.45 : -0.65;
            actGazeY = 0.45;
          } else if (pairP < 0.52) {
            activeProofStage = 'baidu';
            tx = baiduA.x;
            ty = baiduA.y;
            scale = 0.58;
            compact = 0.46;
            tiltTarget = baiduA.tilt;
            actGazeX = baiduA.gx;
            actGazeY = baiduA.gy;
          } else if (pairP < 0.74) {
            var tPair = (pairP - 0.52) / 0.22;
            var posP = twoStageWaypoint(baiduA, pairMid, baichuanA, tPair);
            tx = posP.x;
            ty = posP.y;
            scale = 0.58;
            compact = 0.48;
            isDark = tPair > 0.5;
            if (tPair > 0.28 && tPair < 0.72) activeWaypoint = 'pair';
            activeProofStage = tPair > 0.72 ? 'baichuan' : (tPair < 0.28 ? 'baidu' : '');
            actGazeX = 0.7;
            actGazeY = 0.1;
          } else {
            activeProofStage = 'baichuan';
            tx = baichuanA.x;
            ty = baichuanA.y;
            scale = 0.58;
            compact = 0.46;
            isDark = true;
            tiltTarget = baichuanA.tilt;
            actGazeX = baichuanA.gx;
            actGazeY = baichuanA.gy;
          }
        } else if (subRect && subRect.top < vh * 0.62 && divaA && pricingA) {
          /* 滴滴下半区：从风控落位顺滑到左栏 DiVA 进度条 → 经过中央 ✦ 枢纽 (#didiBridgeNode) → 跳上右栏比价 Skill 3 节点 */
          var subP = clamp((vh * 0.62 - subRect.top) / Math.max(240, subRect.height * 0.96), 0, 1);
          dockedInControl = true;
          if (subP < 0.14 && riskA) {
            var tR2D = easeInOut(subP / 0.14);
            var posRD = quadBezier(
              riskA.x, clamp(riskA.y, 92, vh * 0.48),
              vw * 0.52, lerp(riskA.y, divaA.y, 0.5) - 22,
              divaA.x, divaA.y,
              tR2D
            );
            tx = posRD.x;
            ty = posRD.y;
            scale = 0.58;
            compact = 0.46;
            activeProofStage = tR2D > 0.5 ? 'diva' : 'risk';
            actGazeX = -0.5;
            actGazeY = 0.45;
          } else if (subP < 0.44) {
            activeProofStage = 'diva';
            tx = divaA.x;
            ty = divaA.y;
            scale = 0.58;
            compact = 0.46;
            tiltTarget = divaA.tilt;
            actGazeX = divaA.gx;
            actGazeY = divaA.gy;
          } else if (subP < 0.68) {
            var tCross = (subP - 0.44) / 0.24;
            var posC = twoStageWaypoint(divaA, didiMid, pricingA, tCross);
            tx = posC.x;
            ty = posC.y;
            scale = 0.58;
            compact = 0.48;
            if (tCross > 0.28 && tCross < 0.72) activeWaypoint = 'didi';
            activeProofStage = tCross > 0.72 ? 'pricing' : (tCross < 0.28 ? 'diva' : '');
            actGazeX = 0.72;
            actGazeY = -0.15;
          } else {
            activeProofStage = 'pricing';
            tx = pricingA.x;
            ty = pricingA.y;
            scale = 0.58;
            compact = 0.46;
            tiltTarget = pricingA.tilt;
            actGazeX = pricingA.gx;
            actGazeY = pricingA.gy;
          }
        } else if (didiRect && riskA) {
          /* 滴滴旗舰主讲项目：租车风控工作台（120 分钟转圈 → 俯冲坠落至 30 分钟！） */
          activeProofStage = 'risk';
          dockedInControl = true;
          tx = riskA.x;
          ty = riskA.y;
          scale = 0.60;
          compact = 0.42;
          tiltTarget = riskA.tilt;
          actGazeX = riskA.gx;
          actGazeY = riskA.gy;
        }
      }
    }

    /* Act 4: 暗幕拉环接力泊位（连续滚动插值俯冲：左上角 ZACK ZHANG → 屏幕正中 #curtainBerth） */
    if (curtainTab && curtainBerth && darkAct) {
      var ctr = curtainTab.getBoundingClientRect();
      var wsProbe = workStage ? workStage.getBoundingClientRect().top : 9999;
      var diveStart = vh * 1.04;
      var diveEnd = vh * 0.74;

      if (ctr.top < diveStart && ctr.top > 92 && wsProbe > vh * 0.44) {
        var cbr = curtainBerth.getBoundingClientRect();
        if (cbr.width > 12) {
          activeAct = 'work';
          dockedInControl = true;
          var targetCx = cbr.left + cbr.width / 2;
          var targetCy = cbr.top + cbr.height / 2 + 1;

          if (ctr.top > diveEnd) {
            var tDive = easeInOut(clamp((diveStart - ctr.top) / (diveStart - diveEnd), 0, 1));
            var fromH = getHeaderAnchor();
            var divePos = quadBezier(
              fromH.x, fromH.y,
              lerp(fromH.x, targetCx, 0.36), lerp(fromH.y, targetCy, 0.62),
              targetCx, targetCy,
              tDive
            );
            tx = divePos.x;
            ty = divePos.y;
            scale = 0.56;
            compact = lerp(0.52, 0.68, tDive);
            isDark = tDive > 0.62;
            activeBerth = tDive < 0.08 ? 'header' : (tDive > 0.92 ? 'curtain' : '');
            actGazeX = 0.68;
            actGazeY = 0.76;
          } else {
            activeBerth = 'curtain';
            tx = targetCx;
            ty = targetCy;
            scale = 0.56;
            compact = 0.68;
            isDark = true;
            actGazeX = 0.3;
            actGazeY = state.hoveredKind === 'curtain' ? 0.9 : 0.25;
          }
        }
      }
    }

    /* Act 5 & 6: 暗色作品展台（切屏向上顶撞展台框 + 火花）+ 能力宣言连续平滑 S 型穿行 */
    if (darkAct && activeBerth !== 'curtain' && activeAct !== 'work') {
      var darkRect = darkAct.getBoundingClientRect();
      if (darkRect.top <= vh * 0.48 && darkRect.bottom > 96) {
        isDark = true;
        if (workStage && workFrame) {
          var wsRect = workStage.getBoundingClientRect();
          if (wsRect.top < vh * 0.46 && wsRect.bottom > vh * 0.40) {
            activeAct = 'work';
            var wbr = workBerth ? workBerth.getBoundingClientRect() : null;
            var bonking = now < state.workBonkUntil;
            if (wbr && wbr.width > 12 && wbr.top > 70 && wbr.bottom < vh - 12) {
              activeBerth = bonking ? '' : 'work';
              dockedInControl = true;
              var frB = workFrame.getBoundingClientRect();
              tx = wbr.left + wbr.width / 2;
              ty = bonking ? (frB.bottom + 8) : (wbr.top + wbr.height / 2 + 1);
              scale = bonking ? 0.70 : 0.62;
              compact = bonking ? 0.22 : 0.64;
              pulsing = false;
              actGazeX = bonking ? 0 : (state.hoveredKind === 'work-dock' ? 0.85 : -0.45);
              actGazeY = bonking ? -1.0 : (state.hoveredKind === 'work-frame' ? -0.82 : -0.25);
            } else {
              var fr = workFrame.getBoundingClientRect();
              tx = clamp(fr.right - 8, 52, vw - 26);
              ty = clamp(fr.top - 16, 86, vh - 60);
              scale = 0.68;
              compact = 0.35;
              pulsing = true;
            }
          }
        }
        if (activeAct !== 'work' && capabilitiesSection && capabilityLines.length) {
          var capR = capabilitiesSection.getBoundingClientRect();
          if (capR.top < vh * 0.74 && capR.bottom > vh * 0.14) {
            activeAct = 'capabilities';
            /* 能力区采用明显更舒缓的阻尼速度（5.4 vs 默认 12.2），杜绝匆忙乱窜 */
            followLambda = 5.4;
            if (state.hoveredEl && state.hoveredKind === 'capability') {
              var hIdx = Math.max(0, capabilityLines.indexOf(state.hoveredEl));
              var hSpan = state.hoveredEl.querySelector('.capability-title') || state.hoveredEl;
              var htr = hSpan.getBoundingClientRect();
              activeCapIdx = hIdx;
              tx = clamp(htr.right + 44, vw * 0.30, vw - 240);
              ty = clamp(htr.top + htr.height * 0.52, 108, vh - 72);
              scale = 0.70;
              compact = 0.22;
              tiltTarget = -5;
              actGazeX = -0.88;
              actGazeY = 0;
            } else {
              /* 沿 4 行大标题右侧尾端舒缓 S 形漫步 + 每行驻留平台，逐一点亮标题与战绩标签 */
              var capFirst = capabilityLines[0].getBoundingClientRect();
              var capLast = capabilityLines[capabilityLines.length - 1].getBoundingClientRect();
              var startY = capFirst.top + capFirst.height * 0.5;
              var endY = capLast.top + capLast.height * 0.5;
              var scrollSpan = Math.max(280, (endY - startY) + vh * 0.22);
              var capP = clamp((vh * 0.64 - startY) / scrollSpan, 0, 1);
              var fLine = capP * (capabilityLines.length - 1);
              var i0 = Math.min(capabilityLines.length - 2, Math.floor(fLine));
              var rawSeg = clamp(fLine - i0, 0, 1);
              /* 前 30% 与后 22% 停驻在当前标题旁细读，中间 48% 优雅轻弧过渡到下一行 */
              var segT = easeInOut(clamp((rawSeg - 0.30) / 0.48, 0, 1));
              var s0 = (capabilityLines[i0].querySelector('.capability-title') || capabilityLines[i0]).getBoundingClientRect();
              var s1 = (capabilityLines[i0 + 1].querySelector('.capability-title') || capabilityLines[i0 + 1]).getBoundingClientRect();
              var x0 = clamp(s0.right + 44, vw * 0.30, vw - 240);
              var x1 = clamp(s1.right + 44, vw * 0.30, vw - 240);
              var y0 = clamp(s0.top + s0.height * 0.52, 108, vh - 72);
              var y1 = clamp(s1.top + s1.height * 0.52, 108, vh - 72);
              activeCapIdx = clamp(Math.round(fLine), 0, capabilityLines.length - 1);
              tx = lerp(x0, x1, segT) + Math.sin(segT * Math.PI) * 14;
              ty = lerp(y0, y1, segT) - Math.sin(segT * Math.PI) * 10;
              scale = 0.68;
              compact = 0.24;
              tiltTarget = segT > 0.08 && segT < 0.92 ? (x1 >= x0 ? 4 : -4) : -5;
              actGazeX = -0.86;
              actGazeY = segT > 0.15 && segT < 0.85 ? 0.32 : 0;
            }
          }
        }
      }
    }

    /* Act 7: 方法论档案叠卡（沿卡片顶部索引眉连续平滑漫步 24% → 50% → 74% → 44%，绝不左右突兀瞬移） → 平滑弧线回左上角陪读知识手册 */
    var methodAnchor = null;
    if (!isDark && methodSection && methodCards.length) {
      var mr = methodSection.getBoundingClientRect();
      if (mr.top < vh * 0.58 && mr.bottom > vh * 0.18) {
        activeAct = 'method';
        var frontIdx = 0;
        for (var m = 0; m < methodCards.length; m++) {
          var mcr = methodCards[m].getBoundingClientRect();
          if (mcr.top <= vh * 0.56) frontIdx = m;
        }
        if (frontIdx !== state.lastMethodIdx) {
          if (state.lastMethodIdx !== -1) {
            hop(0.32);
            triggerWink(280, false);
          }
          state.lastMethodIdx = frontIdx;
        }
        var fcr = methodCards[frontIdx].getBoundingClientRect();
        var methodP = clamp((vh * 0.56 - mr.top) / Math.max(260, mr.height - vh * 0.42), 0, 1);
        /* 连续三段平缓移动：0→0.36 (24%→50%)，0.36→0.72 (50%→74%)，0.72→1 (74%→44%)，避开左侧标题与右侧标语 */
        var xFrac;
        if (methodP < 0.36) {
          xFrac = lerp(0.24, 0.50, easeInOut(methodP / 0.36));
        } else if (methodP < 0.72) {
          xFrac = lerp(0.50, 0.74, easeInOut((methodP - 0.36) / 0.36));
        } else {
          xFrac = lerp(0.74, 0.44, easeInOut((methodP - 0.72) / 0.28));
        }
        tx = clamp(fcr.left + fcr.width * xFrac, 60, vw - 60);
        ty = clamp(fcr.top - 14, 92, vh - 60);
        scale = 0.64;
        compact = 0.36;
        actGazeX = methodP < 0.72 ? 0.38 : -0.35;
        actGazeY = 0.76;
        methodAnchor = { x: tx, y: ty };
      } else {
        state.lastMethodIdx = -1;
      }
    }

    if (!isDark && knowledgeSection && knowledgeList) {
      var kr = knowledgeSection.getBoundingClientRect();
      var kClimbStart = vh * 0.92;
      var kClimbEnd = vh * 0.54;
      if (kr.top < kClimbStart && kr.bottom > vh * 0.20) {
        activeAct = 'knowledge';
        if (kr.top <= kClimbEnd) {
          applyHeaderDocked(0.35);
        } else {
          var tK = easeInOut(clamp((kClimbStart - kr.top) / (kClimbStart - kClimbEnd), 0, 1));
          var fromM = methodAnchor || { x: vw * 0.48, y: vh * 0.34 };
          var headK = getHeaderAnchor();
          var kPos = quadBezier(
            fromM.x, fromM.y,
            vw * 0.34, Math.max(54, lerp(fromM.y, headK.y, 0.45) - 34),
            headK.x, headK.y,
            tK
          );
          tx = kPos.x;
          ty = kPos.y;
          scale = lerp(0.64, 0.56, tK);
          compact = lerp(0.36, 0.52, tK);
          dockedInControl = true;
          actGazeX = lerp(-0.78, 0.35, tK);
          actGazeY = lerp(-0.55, 0.90, tK);
          if (tK > 0.92) activeBerth = 'header';
        }
      }
    }

    /* Act 8: 页尾 Let's talk 精炼终幕 — 轻跃 L → t → k 三拍，踩弯 → 打滑，并在追问带进入视口中下区时提前稳稳落座 #runwayBerth！ */
    if (footer && talkArrow) {
      var fRect = footer.getBoundingClientRect();
      var footStart = vh * 0.94;
      var maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      var fDocTop = fRect.top + y;
      var runwayRect = footerRunway ? footerRunway.getBoundingClientRect() : null;
      var runwayDocTop = runwayRect ? (runwayRect.top + y) : (fDocTop + 420);
      var enterScrollY = Math.max(0, fDocTop - footStart);
      /* 提前收尾：当 #footerRunway 来到视口 ~66% 处（无需滚到最底），动画已 100% 落座框内！ */
      var endScrollY = Math.min(maxScroll - 150, Math.max(enterScrollY + 230, runwayDocTop - vh * 0.66));

      if (fRect.top < footStart) {
        activeAct = 'footer';
        isDark = false;
        dockedInControl = true;
        var tFoot = clamp((y - enterScrollY) / Math.max(180, endScrollY - enterScrollY), 0, 1);

        var letters = talkText ? Array.from(talkText.querySelectorAll('.talk-letter')) : [];
        talkLettersCache = letters;
        /* 只取 3 个关键落脚字母（L / talk 的 t / k），节奏干净利落不拖沓 */
        var visLetters = [];
        for (var li = 0; li < letters.length; li++) {
          var ch = (letters[li].textContent || '').trim();
          if (ch && ch !== "'") visLetters.push({ el: letters[li], rawIdx: li });
        }
        var hopPeaks = visLetters.length >= 6
          ? [visLetters[0], visLetters[4], visLetters[visLetters.length - 1]]
          : visLetters;

        var headF = getHeaderAnchor();
        var rbr = runwayBerth ? runwayBerth.getBoundingClientRect() : null;
        var berthPt = (rbr && rbr.width > 12)
          ? { x: rbr.left + rbr.width / 2, y: rbr.top + rbr.height / 2 + 2 }
          : { x: vw * 0.14, y: vh * 0.72 };
        var arrowR = talkArrow.getBoundingClientRect();
        var arrowTop = { x: arrowR.left + arrowR.width * 0.45, y: arrowR.top + arrowR.height * 0.22 };

        function letterTop(entry) {
          var lr = entry.el.getBoundingClientRect();
          return { x: lr.left + lr.width * 0.5, y: lr.top + lr.height * 0.16 };
        }

        if (hopPeaks.length >= 3 && tFoot < 0.90) {
          var firstPt = letterTop(hopPeaks[0]);
          var lastPt = letterTop(hopPeaks[hopPeaks.length - 1]);

          if (tFoot < 0.16) {
            /* 1) 从左上角 ZACK ZHANG 轻跃落上 L */
            var u0 = easeInOut(tFoot / 0.16);
            var dropL = quadBezier(
              headF.x, headF.y,
              lerp(headF.x, firstPt.x, 0.45) - 14, Math.max(40, Math.min(headF.y, firstPt.y) - 24),
              firstPt.x, firstPt.y - 12,
              u0
            );
            tx = dropL.x;
            ty = dropL.y;
            scale = lerp(0.56, 0.72, u0);
            compact = lerp(0.52, 0.12, u0);
            tiltTarget = lerp(0, 8, u0);
            actGazeX = 0.35;
            actGazeY = 0.85;
            if (u0 < 0.08) activeBerth = 'header';
            if (u0 > 0.82) steppedTalkIdx = hopPeaks[0].rawIdx;
          } else if (tFoot < 0.44) {
            /* 2) 精简两记大跨步弹跳：L → t → k */
            var hopU = (tFoot - 0.16) / 0.28;
            var segF = hopU * (hopPeaks.length - 1);
            var hIdx = Math.min(hopPeaks.length - 2, Math.floor(segF));
            var hLoc = clamp(segF - hIdx, 0, 1);
            var pA = letterTop(hopPeaks[hIdx]);
            var pB = letterTop(hopPeaks[hIdx + 1]);
            tx = lerp(pA.x, pB.x, hLoc);
            ty = lerp(pA.y, pB.y, hLoc) - 12 - Math.sin(hLoc * Math.PI) * 42;
            scale = 0.72;
            compact = 0.10;
            tiltTarget = Math.cos(hLoc * Math.PI) * 11;
            actGazeX = 0.78;
            actGazeY = hLoc < 0.5 ? -0.25 : 0.72;
            if (hLoc < 0.22) steppedTalkIdx = hopPeaks[hIdx].rawIdx;
            else if (hLoc > 0.78) steppedTalkIdx = hopPeaks[hIdx + 1].rawIdx;
          } else if (tFoot < 0.62) {
            /* 3) 踩上 → 箭头并失衡打滑 */
            var slipU = easeInOut((tFoot - 0.44) / 0.18);
            var slipPt = quadBezier(
              lastPt.x, lastPt.y - 12,
              lerp(lastPt.x, arrowTop.x, 0.5), Math.min(lastPt.y, arrowTop.y) - 24,
              arrowTop.x + 10, arrowTop.y + 18,
              slipU
            );
            tx = slipPt.x;
            ty = slipPt.y;
            scale = 0.74;
            compact = 0.08;
            tiltTarget = lerp(6, 24, slipU);
            actGazeX = 0.3;
            actGazeY = 0.95;
            if (slipU > 0.40) steppedTalkIdx = 999;
          } else {
            /* 4) 提前优雅滑坠落座下方左侧 #runwayBerth！ */
            var fallU = easeInOut((tFoot - 0.62) / 0.28);
            var fallStart = { x: arrowTop.x + 10, y: arrowTop.y + 18 };
            var fallCtrl = { x: lerp(fallStart.x, berthPt.x, 0.36), y: Math.max(fallStart.y + 52, lerp(fallStart.y, berthPt.y, 0.76)) };
            var fallPos = quadBezier(fallStart.x, fallStart.y, fallCtrl.x, fallCtrl.y, berthPt.x, berthPt.y, fallU);
            tx = fallPos.x;
            ty = fallPos.y;
            scale = lerp(0.74, 0.82, fallU);
            compact = lerp(0.08, 0, fallU);
            tiltTarget = lerp(24, 0, fallU);
            actGazeX = lerp(-0.75, 0.85, fallU);
            actGazeY = lerp(0.85, 0.04, fallU);
            if (fallU > 0.86) activeBerth = 'runway';
          }
        } else {
          /* 已提前稳稳落座页尾 AI 分身追问带 */
          activeBerth = 'runway';
          tx = berthPt.x;
          ty = berthPt.y;
          scale = 0.82;
          compact = 0;
          pulsing = false;
          tiltTarget = 0;
          actGazeX = 0.88;
          actGazeY = 0.04;
        }
      }
    }

    /* 首屏活体句点无缝交接 */
    if (heroPeriod) {
      heroPeriod.classList.toggle('is-docked', activeAct === 'hero');
      heroPeriod.classList.toggle('is-departed', activeAct !== 'hero');
    }

    if (activeAct === 'hero' && state.hoveredEl && (state.hoveredKind === 'cta' || state.hoveredKind === 'nav')) {
      var hr = state.hoveredEl.getBoundingClientRect();
      var hdx = (hr.left + hr.width / 2) - tx;
      var hdy = (hr.top + hr.height / 2) - ty;
      var hdist = Math.hypot(hdx, hdy) || 1;
      tx += (hdx / hdist) * 8;
      ty += (hdy / hdist) * 6;
      tiltTarget = clamp((hdx / 460) * 9, -8, 8);
    }

    /* 视线优先级 */
    var gx = 0;
    var gy = 0;
    var scrollVel = window.portfolioScroll ? window.portfolioScroll.getVelocity() : 0;

    if ((activeProofStage || activeAct === 'footer') && actGazeY !== null) {
      gx = actGazeX;
      gy = actGazeY;
    } else if (state.hoveredEl && !state.selfHovered && state.hoveredKind !== 'runway') {
      var er = state.hoveredEl.getBoundingClientRect();
      var ecx = er.left + er.width / 2;
      var ecy = er.top + er.height / 2;
      gx = clamp((ecx - state.x) / 170, -1, 1);
      gy = clamp((ecy - state.y) / 150, -1, 1);
    } else if (now - state.pointerActiveAt < 2500 && !state.selfHovered && activeBerth !== 'runway') {
      gx = clamp((state.pointerX - state.x) / 220, -1, 1);
      gy = clamp((state.pointerY - state.y) / 180, -1, 1);
    } else if (Math.abs(scrollVel) > 160 && activeBerth !== 'header') {
      gx = 0;
      gy = clamp(scrollVel / 850, -0.88, 0.88);
    } else if (now - state.lastScrollAt > 2400 && now - state.pointerActiveAt > 2400 && !dockedInControl) {
      if (now >= state.nextIdleGlanceAt) {
        var presets = [[-0.92, -0.14], [0.92, -0.1], [-0.45, 0.65], [0.48, 0.45], [0, -0.35]];
        var pick = presets[Math.floor(Math.random() * presets.length)];
        state.idleGx = pick[0];
        state.idleGy = pick[1];
        state.nextIdleGlanceAt = now + 2000 + Math.random() * 2200;
      }
      gx = state.idleGx;
      gy = state.idleGy;
    } else if (actGazeX !== null) {
      gx = actGazeX;
      gy = actGazeY;
    }

    if (activeBerth === 'header' && state.hoveredKind !== 'brand') {
      gy = clamp(gy, 0.56, 1);
    }

    return {
      x: tx,
      y: ty,
      scale: scale,
      compact: compact,
      pulsing: pulsing,
      isDark: isDark,
      tilt: tiltTarget,
      gx: gx,
      gy: gy,
      activeAct: activeAct,
      activeBerth: activeBerth,
      activeProofStage: activeProofStage,
      activeWaypoint: activeWaypoint,
      activeCapIdx: activeCapIdx,
      followLambda: followLambda,
      steppedTalkIdx: steppedTalkIdx,
      talkLetters: talkLettersCache,
      dockedInControl: dockedInControl
    };
  }

  /* 4. 实时伴随主循环 */
  var liveLoopRunning = false;

  function stepLive() {
    var now = performance.now();
    var dt = Math.min(0.05, Math.max(0.004, (now - state.lastFrame) / 1000));
    state.lastFrame = now;

    if (state.mode !== 'live') return;

    var hiddenByDialog = !!(dialog && dialog.open);
    if (hiddenByDialog || !desktopMq.matches) {
      guide.classList.remove('is-visible');
      syncBerths('');
      syncProofStageFocus('');
      syncWaypoints('');
      syncCapabilitiesFocus(-1);
      syncSteppedTalkLetter(-1, null);
      closePopover();
      return;
    }

    var curScrollY = window.scrollY || 0;
    if (Math.abs(curScrollY - state.lastScrollY) > 3) {
      state.lastScrollY = curScrollY;
      state.lastScrollAt = now;
      state.idleTilt = 0;
      if (state.popoverOpen) closePopover();
    }

    var t = computeLiveTarget(now);
    var prevX = state.x;
    var prevY = state.y;
    var follow = 1 - Math.exp(-(t.followLambda || 12.2) * dt);
    state.x += (t.x - state.x) * follow;
    state.y += (t.y - state.y) * follow;
    state.vx = (state.x - prevX) / dt;
    state.vy = (state.y - prevY) / dt;
    state.scale += (t.scale - state.scale) * (1 - Math.exp(-10 * dt));
    state.compact += (t.compact - state.compact) * (1 - Math.exp(-10 * dt));

    var moveTilt = t.dockedInControl ? clamp(state.vx / 110, -7, 7) : clamp(state.vx / 52, -10, 10);
    var desiredTilt = t.tilt + moveTilt + state.idleTilt;
    state.tilt += (desiredTilt - state.tilt) * (1 - Math.exp(-11 * dt));

    state.targetGx = t.gx;
    state.targetGy = t.gy;
    state.pulsing = t.pulsing;
    state.isDark = t.isDark;
    state.activeAct = t.activeAct;
    state.dockedInControl = t.dockedInControl;

    var closeEnough = Math.hypot(t.x - state.x, t.y - state.y) < 42;
    syncBerths(closeEnough ? t.activeBerth : '');
    syncProofStageFocus(t.activeProofStage);
    syncWaypoints(t.activeWaypoint);
    syncCapabilitiesFocus(t.activeCapIdx);
    syncSteppedTalkLetter(t.steppedTalkIdx, t.talkLetters);

    guide.classList.add('is-visible');
    applyVisuals(now, dt);
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
        window.requestAnimationFrame(loop);
      })();
    }
  }

  function enterLiveMode(alreadyPositioned) {
    if (!desktopMq.matches) {
      state.mode = 'hidden';
      guide.classList.remove('is-visible', 'is-preloader-mode');
      document.documentElement.classList.remove('ink-guide-ready');
      syncBerths('');
      syncProofStageFocus('');
      syncWaypoints('');
      syncCapabilitiesFocus(-1);
      syncSteppedTalkLetter(-1, null);
      closePopover();
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
      state.compact = target.compact;
    }
    state.vx = 0;
    state.vy = 0;
    guide.classList.add('is-visible');
    startLiveLoop();
  }

  /* 5. 页尾 AI 分身追问显示带自动轮播 */
  function initFooterRunway() {
    if (!footerRunway || reducedMotion) return;
    var items = Array.from(footerRunway.querySelectorAll('.footer-runway-item'));
    if (items.length < 2) return;
    var idx = 0;
    var paused = false;
    var inView = false;

    footerRunway.addEventListener('pointerenter', function () { paused = true; });
    footerRunway.addEventListener('pointerleave', function () { paused = false; });
    footerRunway.addEventListener('focusin', function () { paused = true; });
    footerRunway.addEventListener('focusout', function () { paused = false; });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        inView = entries[0] && entries[0].isIntersecting;
      }, { threshold: 0.2 });
      io.observe(footerRunway);
    } else {
      inView = true;
    }

    window.setInterval(function () {
      if (paused || !inView || document.hidden) return;
      var prev = items[idx];
      idx = (idx + 1) % items.length;
      var next = items[idx];
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      window.setTimeout(function () { prev.classList.remove('is-leaving'); }, 480);
      next.classList.add('is-active');
      if (state.mode === 'live' && state.activeBerth === 'runway') {
        triggerBlink(false);
      }
    }, 3200);
  }

  /* 6. 全站组件微互动与点击快捷卡片 */
  function bindInteractions() {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      state.pointerX = e.clientX;
      state.pointerY = e.clientY;
      state.pointerActiveAt = performance.now();
    }, { passive: true });

    guide.addEventListener('pointerenter', function () {
      if (state.mode !== 'live') return;
      state.selfHovered = true;
    });
    guide.addEventListener('pointerleave', function () {
      state.selfHovered = false;
    });
    guide.addEventListener('click', function (e) {
      if (state.mode !== 'live' || state.dockedInControl) return;
      e.preventDefault();
      e.stopPropagation();
      triggerHappy(950, true);
      state.tilt += (Math.random() < 0.5 ? -14 : 14);
      if (state.popoverOpen) closePopover();
      else openPopover();
    });

    document.addEventListener('click', function (e) {
      if (!state.popoverOpen) return;
      if (popover && (popover.contains(e.target) || guide.contains(e.target))) return;
      closePopover();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.popoverOpen) closePopover();
    });

    var hoverRules = [
      { sel: '#siteBrand', kind: 'brand', happy: true },
      { sel: '#footerRunway', kind: 'runway', happy: true },
      { sel: '#talkLink, .footer-agent-cta', kind: 'footer-cta', happy: true },
      { sel: '#darkCurtainTab', kind: 'curtain' },
      { sel: '#workDockTrigger', kind: 'work-dock', happy: true },
      { sel: '.work-stage-frame', kind: 'work-frame' },
      { sel: '.work-stage-pill', kind: 'work-pill' },
      { sel: '.capability-line', kind: 'capability' },
      { sel: '[data-proof-stage]', kind: 'proof-stage' },
      { sel: '.proof-note', kind: 'proof-note' },
      { sel: '.pathCard', kind: 'path-card' },
      { sel: '.knowledge-list > a', kind: 'knowledge-item' },
      { sel: '#heroFocusStrip, .hero-actions a, #bottomUI a', kind: 'cta' },
      { sel: '.site-menu a', kind: 'nav' }
    ];

    document.addEventListener('pointerover', function (e) {
      if (state.mode !== 'live') return;
      for (var i = 0; i < hoverRules.length; i++) {
        var match = e.target.closest(hoverRules[i].sel);
        if (match) {
          var changed = state.hoveredEl !== match;
          state.hoveredEl = match;
          state.hoveredKind = hoverRules[i].kind;
          state.curious = !hoverRules[i].happy;
          if (hoverRules[i].happy) {
            state.happyUntil = performance.now() + (hoverRules[i].kind === 'brand' ? 1100 : 900);
            if (changed && hoverRules[i].kind === 'brand' && state.activeBerth === 'header') {
              hop(0.45);
            }
          } else if (changed && hoverRules[i].kind === 'proof-stage') {
            var stKey = match.dataset.proofStage;
            if (stKey && window.portfolioProofMeters) {
              window.portfolioProofMeters.replay(stKey);
            }
          } else if (changed && hoverRules[i].kind === 'knowledge-item' && state.activeBerth === 'header') {
            triggerWink(320, false);
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

    window.addEventListener('portfolio:metricdone', function (e) {
      if (state.mode !== 'live') return;
      var doneStage = e.detail && e.detail.stage;
      if (doneStage && state.activeProofStage === doneStage) {
        hop(0.42);
        triggerWink(360, false);
        if (doneStage === 'risk') {
          emitSparks(state.x, state.y, false, 8, false);
        }
      }
    });

    window.addEventListener('portfolio:workchange', function () {
      triggerWorkFrameBonk();
    });

    window.addEventListener('portfolio:methodchange', function () {
      if (state.mode !== 'live') return;
      triggerWink(320, true);
    });

    window.addEventListener('portfolio:emailcopied', function () {
      if (state.mode !== 'live') return;
      triggerHappy(1200, true);
    });

    desktopMq.addEventListener('change', function () {
      if (state.mode === 'preloader' || state.mode === 'flight') return;
      enterLiveMode(false);
    });
  }

  /* 7. 开屏加载编排：幕布揭开后精准同步触发首屏逐字大标题总谱 + A1 落位句点 */
  function runPreloader() {
    var shouldPreload = preloader && document.documentElement.classList.contains('is-preloading') && !reducedMotion;
    if (!shouldPreload) {
      if (preloader) preloader.classList.add('is-done');
      document.documentElement.classList.remove('is-preloading', 'ink-flight-active');
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
    state.compact = 0;
    guide.classList.add('is-visible', 'is-preloader-mode');

    var startAt = performance.now();
    var phase = 'load';
    var progress = 0;
    var celebrateStart = 0;
    var flightStart = 0;
    var flightFrom = { x: 0, y: 0, scale: 1.05 };
    var flightTo = { x: 0, y: 0, scale: 0.78 };
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
        state.squashV -= 4.2;
        window.setTimeout(function () { triggerWink(360, false); }, 220);
      } else {
        state.mode = 'hidden';
        guide.classList.remove('is-visible', 'is-preloader-mode');
      }
    }

    var failsafe = window.setTimeout(finishAll, 4900);

    function preloaderFrame() {
      if (finished) return;
      var now = performance.now();
      var dt = Math.min(0.05, Math.max(0.004, (now - state.lastFrame) / 1000));
      state.lastFrame = now;
      var elapsed = (now - startAt) / 1000;
      var tm = getTrackMetrics();

      if (phase === 'load') {
        var prevPx = state.x;
        var prevPy = state.y;

        if (elapsed < 0.28) {
          var pWake = easeOutCubic(clamp(elapsed / 0.28, 0, 1));
          state.scale = lerp(0.15, 1.05, pWake) + Math.sin(pWake * Math.PI) * 0.12;
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
          var tWalk = clamp((elapsed - 0.28) / 0.60, 0, 1);
          progress = lerp(0, 0.42, easeInOut(tWalk));
          var stepBounce = Math.abs(Math.sin(tWalk * Math.PI * 4.5)) * 10;
          state.scale = 1.05;
          state.x = tm.left + tm.width * progress;
          state.y = tm.y - 24 - stepBounce;
          state.tilt = 5 + Math.sin(tWalk * Math.PI * 9) * 3;
          state.targetGx = 0.92;
          state.targetGy = 0.05;
          setStatus('正在铺开作品集');
        } else if (elapsed < 1.54) {
          var tLook = clamp((elapsed - 0.88) / 0.66, 0, 1);
          progress = lerp(0.42, 0.68, tLook * 0.85 + easeInOut(tLook) * 0.15);
          state.scale = 1.05;
          state.x = tm.left + tm.width * progress;
          state.y = tm.y - 24;
          setStatus('四处看看…');
          if (tLook < 0.34) {
            state.targetGx = -1.0;
            state.targetGy = -0.15;
            state.tilt = -8;
          } else if (tLook < 0.68) {
            state.targetGx = 1.0;
            state.targetGy = -0.1;
            state.tilt = 8;
            if (!lookBlinkDone && tLook > 0.42) {
              lookBlinkDone = true;
              triggerBlink(false);
            }
          } else {
            state.targetGx = 0.28;
            state.targetGy = 0.92;
            state.tilt = 4;
          }
        } else {
          var tSprint = clamp((elapsed - 1.54) / 0.38, 0, 1);
          var cap = (fontsReady || elapsed > 2.25) ? 1 : 0.94;
          progress = Math.min(cap, lerp(0.68, 1, easeOutCubic(tSprint)));
          var sprintBounce = Math.abs(Math.sin(tSprint * Math.PI * 3)) * 11;
          state.scale = 1.05;
          state.x = tm.left + tm.width * progress;
          state.y = tm.y - 24 - sprintBounce;
          state.tilt = 7;
          state.targetGx = 0.9;
          state.targetGy = -0.05;
          setStatus('准备就绪');

          if (progress >= 0.998) {
            progress = 1;
            phase = 'celebrate';
            celebrateStart = now;
            setStatus('HELLO.');
            state.tilt = 0;
            state.vx = 0;
            state.vy = 0;
            state.targetGx = 0;
            state.targetGy = 0;
            triggerHappy(1150, true);
            hop(1.1);
          }
        }

        state.vx = (state.x - prevPx) / dt * 0.45;
        state.vy = (state.y - prevPy) / dt * 0.45;

        if (fillEl) fillEl.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
        if (pctEl) pctEl.textContent = String(Math.round(progress * 100)).padStart(2, '0') + '%';
        if (shadowEl) {
          var airHeight = Math.max(0, (tm.y - 24) - state.y - state.hopY);
          var shadowScale = clamp(1 - airHeight / 44, 0.38, 1) * clamp(state.scale / 1.05, 0, 1);
          shadowEl.style.transform = 'translate3d(' + (tm.width * progress).toFixed(1) + 'px, 0, 0) scale(' + shadowScale.toFixed(3) + ')';
        }
      } else if (phase === 'celebrate') {
        var cElapsed = (now - celebrateStart) / 1000;
        state.x = tm.left + tm.width;
        state.y = tm.y - 24;
        state.vx = 0;
        state.vy = 0;
        state.scale = 1.08;
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

          if (stageEl) stageEl.classList.add('is-fading');
          preloader.classList.add('is-lifting');
          window.setTimeout(function () {
            document.documentElement.classList.remove('is-preloading');
            if (!curtainOpened && window.initPortfolioHero) {
              curtainOpened = true;
              window.initPortfolioHero();
            }
          }, 380);
        }
      } else if (phase === 'flight') {
        var fProgress = clamp((now - flightStart) / 860, 0, 1);
        var fEase = easeInOut(fProgress);
        flightTo = (window.scrollY || 0) > 80 && desktopMq.matches
          ? computeLiveTarget(now)
          : getHeroPerch();

        var prevFx = state.x;
        var prevFy = state.y;
        var arcLift = Math.min(130, Math.max(68, Math.hypot(flightTo.x - flightFrom.x, flightTo.y - flightFrom.y) * 0.28));
        var ctrlX = (flightFrom.x + flightTo.x) * 0.5;
        var ctrlY = Math.min(flightFrom.y, flightTo.y) - arcLift;
        var inv = 1 - fEase;
        state.x = inv * inv * flightFrom.x + 2 * inv * fEase * ctrlX + fEase * fEase * flightTo.x;
        state.y = inv * inv * flightFrom.y + 2 * inv * fEase * ctrlY + fEase * fEase * flightTo.y;
        state.vx = (state.x - prevFx) / dt;
        state.vy = (state.y - prevFy) / dt;
        state.scale = lerp(flightFrom.scale, flightTo.scale, fEase);
        state.tilt = clamp(state.vx / 44, -15, 15) * (1 - fEase * 0.65);

        if (!desktopMq.matches && fProgress > 0.72) {
          guide.style.opacity = String(clamp((1 - fProgress) / 0.28, 0, 1));
        }

        if (fProgress >= 1) {
          clearTimeout(failsafe);
          guide.style.removeProperty('opacity');
          state.tilt = 0;
          state.vx = 0;
          state.vy = 0;
          finishAll();
          return;
        }
      }

      applyVisuals(now, dt);
      window.requestAnimationFrame(preloaderFrame);
    }

    window.requestAnimationFrame(preloaderFrame);
  }

  bindInteractions();
  initFooterRunway();
  scheduleNextBlink();
  runPreloader();
})();
