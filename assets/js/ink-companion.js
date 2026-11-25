(function () {
  'use strict';

  var guide = document.getElementById('inkGuide');
  var preloader = document.getElementById('sitePreloader');
  if (!guide) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktopMq = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');

  var shapePath = document.getElementById('inkGuidePath');
  var faceEl = guide.querySelector('.ink-face');
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
  var proofShowcase = proofSection ? proofSection.querySelector('.proof-showcase') : null;
  var didiFeature = document.getElementById('didiFeature');
  var didiBerth = document.getElementById('didiBerth');
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
  var capabilitiesList = capabilitiesSection ? capabilitiesSection.querySelector('.capability-lines') : null;
  var methodSection = document.getElementById('method');
  var paperSteps = document.getElementById('paperSteps');
  var methodCards = paperSteps ? Array.from(paperSteps.children) : [];
  var knowledgeSection = document.getElementById('knowledge');
  var knowledgeList = knowledgeSection ? knowledgeSection.querySelector('.knowledge-list') : null;
  var footer = document.getElementById('footer');
  var talkArrow = document.getElementById('talkArrow');
  var footerRunway = document.getElementById('footerRunway');
  var runwayBerth = document.getElementById('runwayBerth');

  function clamp(v, min, max) { return v < min ? min : (v > max ? max : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

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
    mode: 'idle', /* 'preloader' | 'flight' | 'live' | 'hidden' */
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0,
    scale: 1,
    compact: 0,
    lastCompactKey: -1,
    tilt: 0,
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
    activeBerth: '', /* '' | 'curtain' | 'work' | 'runway' */
    pointerX: window.innerWidth * 0.5,
    pointerY: window.innerHeight * 0.5,
    pointerActiveAt: 0,
    lastScrollAt: 0,
    lastScrollY: window.scrollY || 0,
    nextIdleGlanceAt: performance.now() + 3400,
    idleGx: 0,
    idleGy: 0,
    hoveredEl: null,
    hoveredKind: '',
    lastPathIdx: -1,
    popoverOpen: false,
    lastFrame: performance.now()
  };

  /* 1. 表情、眨眼、弹跳与快捷卡片 */
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
    }, 125);
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
    state.hopVy = -255 * s;
    state.squashV += 4.0 * s;
  }

  function triggerHappy(durationMs, withHop) {
    state.happyUntil = Math.max(state.happyUntil, performance.now() + (durationMs || 900));
    if (withHop) hop(0.82);
    pulseOnce();
  }

  function triggerWink(durationMs, withHop) {
    state.winkUntil = Math.max(state.winkUntil, performance.now() + (durationMs || 340));
    if (withHop) hop(0.5);
  }

  var pulseTimeout = 0;
  function pulseOnce() {
    guide.classList.add('is-burst');
    clearTimeout(pulseTimeout);
    pulseTimeout = window.setTimeout(function () {
      guide.classList.remove('is-burst');
    }, 660);
  }

  var actNotes = {
    hero: '你好，我是这段作品集的活体句点。想直接了解张倬玮？',
    path: '五段经历串成同一条证据链，想直接追问细节？',
    proof: '滴滴、百度与百川智能实习成果，欢迎向 AI 分身追问。',
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
      /* 优先展开在右侧留白区（首屏绝不遮挡 IMPACT 衬线大字） */
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
    /* 刚落座 ZACK ZHANG 旁时俏皮眨眼打招呼，随后每隔 2.5s 交替微笑 ^ ^ 与 wink */
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

  function syncBerths(activeBerth) {
    var prevBerth = state.activeBerth;
    state.activeBerth = activeBerth;
    if (siteBrand) siteBrand.classList.toggle('is-berth-active', activeBerth === 'header');
    if (didiFeature) didiFeature.classList.toggle('is-berth-active', activeBerth === 'didi');
    if (curtainTab) curtainTab.classList.toggle('is-berth-active', activeBerth === 'curtain');
    if (workDockTrigger) workDockTrigger.classList.toggle('is-berth-active', activeBerth === 'work');
    if (footerRunway) footerRunway.classList.toggle('is-berth-active', activeBerth === 'runway');

    if (prevBerth !== activeBerth) {
      if (activeBerth === 'header') {
        startHeaderCameo();
      } else {
        stopHeaderCameo();
      }
      if (activeBerth === 'didi') {
        triggerWink(380, true);
      }
    }
  }

  function applyVisuals(now, dt) {
    /* 垂直弹跳与软着陆挤压 */
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

    /* 平滑更新 A1 几何尾翼形变 */
    var compactKey = Math.round(state.compact * 50);
    if (shapePath && compactKey !== state.lastCompactKey) {
      state.lastCompactKey = compactKey;
      shapePath.setAttribute('d', buildContour(state.compact));
    }

    /* 平滑负空间竖条眼追踪 */
    var gazeFollow = 1 - Math.exp(-15 * dt);
    state.gx += (state.targetGx - state.gx) * gazeFollow;
    state.gy += (state.targetGy - state.gy) * gazeFollow;
    if (faceEl) {
      faceEl.setAttribute('transform', 'translate(' + (state.gx * 4.1).toFixed(2) + ' ' + (state.gy * 3.1).toFixed(2) + ')');
    }

    /* 飞行点阵星轨（速度 > 170px/s 沿反速度矢量展开） */
    var speed = Math.hypot(state.vx, state.vy);
    var trailScale = speed > 165 ? clamp((speed - 145) / 720, 0, 1.05) : 0;
    var trailOpacity = speed > 175 ? clamp((speed - 175) / 340, 0, 0.78) : 0;
    guide.style.setProperty('--trail-scale', trailScale.toFixed(3));
    guide.style.setProperty('--trail-opacity', trailOpacity.toFixed(3));
    if (trailOpacity > 0.02) {
      var trailDeg = Math.atan2(state.vy, state.vx) * 180 / Math.PI - state.tilt;
      guide.style.setProperty('--trail-angle', trailDeg.toFixed(1) + 'deg');
    }

    /* 表情与状态类 */
    var isHappy = state.selfHovered || now < state.happyUntil;
    var isWink = !isHappy && now < state.winkUntil;
    guide.classList.toggle('is-happy', isHappy);
    guide.classList.toggle('is-wink', isWink);
    guide.classList.toggle('is-curious', !isHappy && !isWink && state.curious);
    guide.classList.toggle('is-pulsing', state.pulsing);
    guide.classList.toggle('is-dark-surface', state.isDark);
    guide.style.pointerEvents = (state.mode === 'live' && !state.dockedInControl && desktopMq.matches) ? 'auto' : 'none';

    /* 方向性体积守恒拉伸 + 轻柔呼吸浮沉 */
    var hStretch = clamp(Math.abs(state.vx) / 1150, 0, 0.14);
    var vStretch = clamp(Math.abs(state.vy) / 1150, 0, 0.16);
    var hoverBoost = state.selfHovered ? 1.09 : 1;
    var breatheY = (state.mode === 'live' && !state.dockedInControl && hStretch < 0.01 && vStretch < 0.01 && state.hopY === 0)
      ? Math.sin(now * 0.0028) * 2.0
      : 0;

    var sx = state.scale * hoverBoost * (1 - state.squash * 0.20 + hStretch - vStretch * 0.42);
    var sy = state.scale * hoverBoost * (1 + state.squash * 0.20 + vStretch - hStretch * 0.42);
    var drawX = state.x - 22;
    var drawY = state.y - 20 + state.hopY + breatheY;

    guide.style.transform =
      'translate3d(' + drawX.toFixed(2) + 'px,' + drawY.toFixed(2) + 'px,0) ' +
      'rotate(' + state.tilt.toFixed(2) + 'deg) ' +
      'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';

    if (state.popoverOpen) positionPopover();
  }

  /* 2. 首屏稳定落点（化作 TO IMPACT 末尾的活体焦橙对话块） */
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

  /* 3. 全站 8 幕深度组件融合计算 */
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
    var dockedInControl = false;

    if (y >= 110) {
      tx = clamp(vw - 44, 60, vw - 30);
      ty = clamp(120, 96, vh - 120);
      scale = 0.66;
      compact = 0.25;
      pulsing = false;
      activeAct = 'rail';
    }

    /* Act 2: 经历时间轴 01 -> 05，沿赤陶轨道涂色前行并逐张唤醒错落悬吊卡片 */
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
          var nextRailX = clamp(vw - 44, 60, vw - 30);
          var nextRailY = clamp(vh * 0.34, 110, vh - 140);
          tx = lerp(endNodeX, nextRailX, tOut);
          ty = lerp(railY, nextRailY, tOut) - Math.sin(tOut * Math.PI) * 26;
          scale = 0.66;
          compact = lerp(0.42, 0.25, tOut);
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

    /* 辅助：计算左上角 ZACK ZHANG 品牌泊位坐标 */
    function dockToHeader(baseGazeX) {
      if (!brandDot) return false;
      var br = brandDot.getBoundingClientRect();
      activeBerth = 'header';
      dockedInControl = true;
      tx = br.left + br.width / 2;
      ty = br.top + br.height / 2 + 1;
      scale = 0.56;
      compact = 0.52;
      pulsing = false;
      tiltTarget = 0;
      var scan = Math.sin(now * 0.0013) * 0.38;
      actGazeX = clamp((typeof baseGazeX === 'number' ? baseGazeX : 0.28) + scan, -0.35, 0.88);
      actGazeY = 0.92; /* 从左上角顶栏居高临下往下看页面内容 */
      return true;
    }

    /* Act 3: 实习成果区（滴滴专属泊位 → 百度/百川错落双卡 → 较早经历与数字区飞回左上角 ZACK ZHANG 旁往下看） */
    if (proofSection && activeAct !== 'path') {
      var pr = proofSection.getBoundingClientRect();
      var sigRect = signalsSection ? signalsSection.getBoundingClientRect() : null;
      var proofBandBottom = sigRect ? sigRect.bottom : pr.bottom;
      if (pr.top < vh * 0.62 && proofBandBottom > vh * 0.16) {
        activeAct = 'proof';
        var didiRect = didiFeature ? didiFeature.getBoundingClientRect() : null;
        var dbr = didiBerth ? didiBerth.getBoundingClientRect() : null;
        var canDockDidi = !!(didiRect && dbr && dbr.width > 12 && dbr.top > 76 && dbr.bottom < vh - 40 && didiRect.top < vh * 0.72 && didiRect.bottom > vh * 0.24);
        var archRect = proofArchive ? proofArchive.getBoundingClientRect() : null;

        if (archRect && archRect.top < vh * 0.72) {
          /* 客串幕 1：浏览较早经历便签与 4 组大号里程碑数字时，飞回左上角 ZACK ZHANG 旁微笑 / wink 往下看 */
          dockToHeader(0.32);
        } else if (state.hoveredEl && state.hoveredKind === 'proof-card' && state.hoveredEl !== didiFeature) {
          var cr = state.hoveredEl.getBoundingClientRect();
          tx = clamp(cr.right - 14, 52, vw - 30);
          ty = clamp(cr.top - 12, 92, vh - 48);
          scale = 0.68;
          compact = 0.35;
          tiltTarget = -6;
          if (state.hoveredEl.classList.contains('proof-secondary--ink')) {
            isDark = true;
          }
        } else if (canDockDidi) {
          activeBerth = 'didi';
          dockedInControl = false;
          tx = dbr.left + dbr.width / 2;
          ty = dbr.top + dbr.height / 2 + 1;
          scale = 0.62;
          compact = 0.56;
          actGazeX = -0.55;
          actGazeY = 0.65;
        } else if (proofShowcase) {
          var sr = proofShowcase.getBoundingClientRect();
          tx = clamp(sr.right + 22, 52, vw - 30);
          ty = clamp(Math.max(118, Math.min(vh * 0.44, sr.top + 38)), 96, vh - 120);
          scale = 0.66;
          compact = 0.25;
          actGazeX = -0.82;
          actGazeY = 0.14;
        }
      }
    }

    /* Act 4: 暗幕拉环接力泊位（#curtainBerth，从顶栏俯冲而下完成明暗转场） */
    if (curtainTab && curtainBerth && darkAct) {
      var ctr = curtainTab.getBoundingClientRect();
      var wsProbe = workStage ? workStage.getBoundingClientRect().top : 9999;
      if (ctr.top < vh * 0.84 && ctr.top > 92 && wsProbe > vh * 0.44) {
        var cbr = curtainBerth.getBoundingClientRect();
        if (cbr.width > 12) {
          activeAct = 'work';
          activeBerth = 'curtain';
          dockedInControl = true;
          tx = cbr.left + cbr.width / 2;
          ty = cbr.top + cbr.height / 2 + 1;
          scale = 0.56;
          compact = 0.68;
          isDark = true;
          actGazeX = 0.3;
          actGazeY = state.hoveredKind === 'curtain' ? 0.9 : 0.25;
        }
      }
    }

    /* Act 5 & 6: 暗色作品展台专属泊位（#workBerth）+ 能力宣言逐行跟随 */
    if (darkAct && activeBerth !== 'curtain') {
      var darkRect = darkAct.getBoundingClientRect();
      if (darkRect.top <= vh * 0.48 && darkRect.bottom > 96) {
        isDark = true;
        if (workStage && workFrame) {
          var wsRect = workStage.getBoundingClientRect();
          if (wsRect.top < vh * 0.46 && wsRect.bottom > vh * 0.32) {
            activeAct = 'work';
            var wbr = workBerth ? workBerth.getBoundingClientRect() : null;
            if (wbr && wbr.width > 12 && wbr.top > 70 && wbr.bottom < vh - 12) {
              activeBerth = 'work';
              dockedInControl = true;
              tx = wbr.left + wbr.width / 2;
              ty = wbr.top + wbr.height / 2 + 1;
              scale = 0.62;
              compact = 0.64;
              pulsing = false;
              actGazeX = state.hoveredKind === 'work-dock' ? 0.85 : -0.45;
              actGazeY = state.hoveredKind === 'work-frame' ? -0.82 : -0.25;
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
        if (activeAct !== 'work' && capabilitiesSection && capabilitiesList) {
          var capR = capabilitiesSection.getBoundingClientRect();
          if (capR.top < vh * 0.62 && capR.bottom > vh * 0.20) {
            activeAct = 'capabilities';
            var clR = capabilitiesList.getBoundingClientRect();
            tx = clamp(clR.right + 22, 52, vw - 30);
            if (state.hoveredEl && state.hoveredKind === 'capability') {
              var lr = state.hoveredEl.getBoundingClientRect();
              ty = clamp(lr.top + lr.height * 0.5, 100, vh - 60);
              scale = 0.72;
              compact = 0.2;
              tiltTarget = -7;
              actGazeX = -0.95;
              actGazeY = 0;
            } else {
              ty = clamp(vh * 0.44, 110, vh - 120);
              scale = 0.66;
              compact = 0.28;
              actGazeX = -0.82;
              actGazeY = 0.1;
            }
          }
        }
      }
    }

    /* Act 7: 方法论档案叠卡 + 知识手册（客串幕 2：回左上角 ZACK ZHANG 旁俯看知识条目） */
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
        tx = clamp(fcr.right - 22, 52, vw - 30);
        ty = clamp(fcr.top - 14, 92, vh - 60);
        scale = 0.68;
        compact = 0.35;
        actGazeX = -0.55;
        actGazeY = 0.48;
      }
    }

    if (!isDark && activeAct !== 'method' && knowledgeSection && knowledgeList) {
      var kr = knowledgeSection.getBoundingClientRect();
      if (kr.top < vh * 0.58 && kr.bottom > vh * 0.24) {
        activeAct = 'knowledge';
        dockToHeader(0.35);
      }
    }

    /* Act 8: 页尾 Let's talk 掠过 → 精准停泊进编辑风 AI 分身追问显示带（#runwayBerth） */
    if (footer && talkArrow) {
      var fRect = footer.getBoundingClientRect();
      if (fRect.top < vh * 0.78) {
        activeAct = 'footer';
        isDark = false;
        var rbr = runwayBerth ? runwayBerth.getBoundingClientRect() : null;
        if (rbr && rbr.width > 16 && rbr.top < vh * 0.88 && rbr.top > 84) {
          activeBerth = 'runway';
          dockedInControl = true;
          tx = rbr.left + rbr.width / 2;
          ty = rbr.top + rbr.height / 2 + 2;
          scale = 0.82;
          compact = 0;
          pulsing = false;
          actGazeX = 0.88;
          actGazeY = 0.04;
        } else {
          var tFoot = easeInOut(clamp((vh * 0.78 - fRect.top) / (vh * 0.34), 0, 1));
          var arrowRect = talkArrow.getBoundingClientRect();
          var footX = clamp(arrowRect.right + 28, 52, vw - 36);
          var footY = clamp(arrowRect.top + arrowRect.height * 0.52, 96, vh - 40);
          tx = lerp(tx, footX, tFoot);
          ty = lerp(ty, footY, tFoot);
          scale = lerp(scale, 0.82, tFoot);
          compact = 0;
          pulsing = tFoot > 0.62;
          actGazeX = -0.75;
          actGazeY = 0.08;
        }
      }
    }

    /* 首屏活体句点无缝交接 */
    if (heroPeriod) {
      heroPeriod.classList.toggle('is-docked', activeAct === 'hero');
      heroPeriod.classList.toggle('is-departed', activeAct !== 'hero');
    }

    /* 首屏悬停 CTA / 导航链接时轻盈倾身注视 */
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

    if (state.hoveredEl && !state.selfHovered && state.hoveredKind !== 'runway') {
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
    } else if (now - state.lastScrollAt > 3000 && now - state.pointerActiveAt > 3000 && !dockedInControl) {
      if (now >= state.nextIdleGlanceAt) {
        var presets = [[-0.95, -0.14], [0.92, -0.1], [-0.45, 0.65], [0.48, 0.45], [0, 0]];
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
      closePopover();
      return;
    }

    var curScrollY = window.scrollY || 0;
    if (Math.abs(curScrollY - state.lastScrollY) > 3) {
      state.lastScrollY = curScrollY;
      state.lastScrollAt = now;
      if (state.popoverOpen) closePopover();
    }

    var t = computeLiveTarget(now);
    var prevX = state.x;
    var prevY = state.y;
    var follow = 1 - Math.exp(-11.2 * dt);
    state.x += (t.x - state.x) * follow;
    state.y += (t.y - state.y) * follow;
    state.vx = (state.x - prevX) / dt;
    state.vy = (state.y - prevY) / dt;
    state.scale += (t.scale - state.scale) * (1 - Math.exp(-10 * dt));
    state.compact += (t.compact - state.compact) * (1 - Math.exp(-10 * dt));

    var moveTilt = t.dockedInControl ? 0 : clamp(state.vx / 52, -10, 10);
    var desiredTilt = t.tilt + moveTilt;
    state.tilt += (desiredTilt - state.tilt) * (1 - Math.exp(-12 * dt));

    state.targetGx = t.gx;
    state.targetGy = t.gy;
    state.pulsing = t.pulsing;
    state.isDark = t.isDark;
    state.activeAct = t.activeAct;
    state.dockedInControl = t.dockedInControl;

    /* 只有真正接近泊位中心（< 42px）时才点亮泊位边框，避免隔空提前亮起 */
    var closeEnough = Math.hypot(t.x - state.x, t.y - state.y) < 42;
    syncBerths(closeEnough ? t.activeBerth : '');

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

  /* 5. 页尾 AI 分身追问显示带自动轮播（悬停/聚焦/离屏暂停，切换时小墨块轻眨呼应） */
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
      { sel: '.company-feature, .proof-secondary, .proof-note', kind: 'proof-card' },
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

    window.addEventListener('portfolio:workchange', function () {
      if (state.mode !== 'live') return;
      triggerWink(360, true);
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

  /* 7. 开屏加载编排：A1 焦橙对话块苏醒 → 踏步进度条 → 东张西望 → 100% 欢呼跳跃 → 带点阵尾迹弧线飞入首屏 */
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
        state.squashV -= 4.0;
        window.setTimeout(function () { triggerBlink(false); }, 260);
      } else {
        state.mode = 'hidden';
        guide.classList.remove('is-visible', 'is-preloader-mode');
      }
    }

    var failsafe = window.setTimeout(finishAll, 4600);

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
          }, 90);
        }
      } else if (phase === 'flight') {
        var fProgress = clamp((now - flightStart) / 740, 0, 1);
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

  window.inkCompanion = {
    hop: hop,
    happy: triggerHappy,
    wink: triggerWink,
    blink: function () { triggerBlink(false); }
  };
})();
