(function () {
  'use strict';

  var mq = window.matchMedia('(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  var dialog = document.getElementById('projectDialog');
  var enabled = false;
  var currentY = window.scrollY || 0;
  var targetY = currentY;
  var lastAppliedY = currentY;
  var velocity = 0;
  var animating = false;
  var anchorGlide = false;
  var lastTime = 0;
  var rafId = 0;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function clamp(v, min, max) {
    return v < min ? min : (v > max ? max : v);
  }

  function isDialogOpen() {
    return !!(dialog && dialog.open);
  }

  function hasScrollableParent(node) {
    var el = node;
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.nodeType === 1) {
        var style = window.getComputedStyle(el);
        var oy = style.overflowY;
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 2) {
          return true;
        }
      }
      el = el.parentNode;
    }
    return false;
  }

  function tick() {
    if (!enabled || isDialogOpen()) {
      velocity = 0;
      animating = false;
      anchorGlide = false;
      lastTime = 0;
      return;
    }
    if (!animating) return;

    var now = performance.now();
    var dt = lastTime ? Math.min(0.1, Math.max(0.004, (now - lastTime) / 1000)) : 1 / 60;
    lastTime = now;

    var max = maxScroll();
    targetY = clamp(targetY, 0, max);

    var diff = targetY - currentY;
    /* 滚轮使用干脆阻尼（13.5）保证跟手轻快；锚点跳转使用 10.5 形成轻盈跨幕滑行。 */
    var lambda = anchorGlide ? 10.5 : 13.5;
    var factor = 1 - Math.exp(-lambda * dt);
    var prevY = currentY;

    if (Math.abs(diff) < 0.5) {
      currentY = targetY;
      velocity *= Math.exp(-18 * dt);
      if (Math.abs(velocity) < 8) velocity = 0;
    } else {
      currentY += diff * factor;
      var instantVel = (currentY - prevY) / dt;
      velocity += (instantVel - velocity) * (1 - Math.exp(-18 * dt));
    }

    if (Math.abs(currentY - prevY) > 0.01) {
      window.scrollTo(0, currentY);
      /* 写入后立即读取浏览器实际落盘的 scrollY（含缩放与子像素取整），避免异步 scroll 事件误判。 */
      lastAppliedY = window.scrollY || 0;
      if (window.ScrollTrigger) {
        window.ScrollTrigger.update();
      }
    }

    document.documentElement.style.setProperty('--scroll-vel', clamp(velocity / 1800, -1, 1).toFixed(3));

    if (Math.abs(targetY - currentY) < 0.5 && Math.abs(velocity) < 8) {
      currentY = targetY;
      lastAppliedY = window.scrollY || 0;
      velocity = 0;
      animating = false;
      anchorGlide = false;
      lastTime = 0;
      document.documentElement.style.setProperty('--scroll-vel', '0');
    }
  }

  function rafLoop() {
    if (!enabled) {
      rafId = 0;
      return;
    }
    tick();
    rafId = window.requestAnimationFrame(rafLoop);
  }

  function onWheel(event) {
    if (!enabled || event.ctrlKey || isDialogOpen() || hasScrollableParent(event.target)) return;
    if (!event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    if (!animating || anchorGlide) {
      currentY = window.scrollY || 0;
      targetY = currentY;
      lastAppliedY = currentY;
      lastTime = performance.now();
    }
    anchorGlide = false;

    var delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 34;
    else if (event.deltaMode === 2) delta *= window.innerHeight * 0.85;

    /* 反向滚动时立即消掉前向残余惯性，换向零延迟 */
    if ((delta < 0 && targetY > currentY) || (delta > 0 && targetY < currentY)) {
      targetY = currentY;
    }

    /* 鼠标滚轮给足轻快行程（1.25×），触控板微幅滑动保持 1.08× 细腻跟手 */
    var multiplier = Math.abs(delta) >= 48 ? 1.25 : 1.08;
    targetY = clamp(targetY + delta * multiplier, 0, maxScroll());
    animating = true;
  }

  function onNativeScroll() {
    var actualY = window.scrollY || 0;
    /* 浏览器异步派发 window.scrollTo 对应的 scroll 事件：若与刚写入位置偏差在 3px 内则视为内部滚动，不截断剩余惯性。 */
    if (animating && Math.abs(actualY - lastAppliedY) <= 3) return;
    currentY = actualY;
    targetY = actualY;
    lastAppliedY = actualY;
    velocity = 0;
    animating = false;
    anchorGlide = false;
    lastTime = 0;
  }

  function onPointerDown(event) {
    /* 点击原生滚动条轨道或滑块时立即交还控制权 */
    if (event.clientX >= document.documentElement.clientWidth) {
      animating = false;
      anchorGlide = false;
      velocity = 0;
      lastTime = 0;
    }
  }

  function onKeydown(event) {
    if (!enabled || isDialogOpen()) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].indexOf(event.key) !== -1) {
      currentY = window.scrollY || 0;
      targetY = currentY;
      lastAppliedY = currentY;
      animating = false;
      anchorGlide = false;
      velocity = 0;
    }
  }

  function scrollToTarget(target, offset) {
    var top;
    var extraOffset = typeof offset === 'number' ? offset : 88;
    if (typeof target === 'number') {
      top = target;
    } else {
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;
      top = el.getBoundingClientRect().top + (window.scrollY || 0) - extraOffset;
    }
    top = clamp(top, 0, maxScroll());
    if (!enabled) {
      window.scrollTo({ top: top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      return;
    }
    currentY = window.scrollY || 0;
    lastAppliedY = currentY;
    targetY = top;
    anchorGlide = true;
    lastTime = performance.now();
    animating = true;
  }

  function onClick(event) {
    var trigger = event.target.closest('a[href^="#"], [data-scroll-target]');
    if (!trigger) return;
    var sel = trigger.getAttribute('data-scroll-target') || trigger.getAttribute('href');
    if (!sel || sel === '#') return;
    var el = document.querySelector(sel);
    if (!el) return;
    if (enabled) {
      event.preventDefault();
      var pad = sel === '#heroWrap' ? 0 : (sel === '#work' ? 28 : 88);
      scrollToTarget(el, pad);
      if (trigger.tagName === 'A' && window.history && window.history.pushState) {
        window.history.pushState(null, '', sel);
      }
    }
  }

  function enable() {
    if (enabled) return;
    enabled = true;
    currentY = window.scrollY || 0;
    targetY = currentY;
    lastAppliedY = currentY;
    document.documentElement.classList.add('smooth-scroll-active');
    document.documentElement.style.scrollBehavior = 'auto';
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('keydown', onKeydown, { passive: true });
    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.add(tick);
    } else {
      rafId = window.requestAnimationFrame(rafLoop);
    }
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    animating = false;
    anchorGlide = false;
    velocity = 0;
    document.documentElement.classList.remove('smooth-scroll-active');
    document.documentElement.style.removeProperty('scroll-behavior');
    document.documentElement.style.removeProperty('--scroll-vel');
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onNativeScroll);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('keydown', onKeydown);
    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.remove(tick);
    }
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function syncMode() {
    if (mq.matches) enable();
    else disable();
  }

  document.addEventListener('click', onClick);
  mq.addEventListener('change', syncMode);
  syncMode();

  window.portfolioScroll = {
    scrollTo: scrollToTarget,
    getVelocity: function () { return velocity; },
    sync: function () {
      currentY = window.scrollY || 0;
      targetY = currentY;
      lastAppliedY = currentY;
      velocity = 0;
      animating = false;
      anchorGlide = false;
    }
  };
})();
