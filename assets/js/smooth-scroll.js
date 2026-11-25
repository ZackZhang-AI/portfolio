(function () {
  'use strict';

  var mq = window.matchMedia('(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  var dialog = document.getElementById('projectDialog');
  var enabled = false;
  var currentY = window.scrollY || 0;
  var targetY = currentY;
  var velocity = 0;
  var animating = false;
  var internalScroll = false;
  var lastTime = 0;

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
      velocity *= 0.85;
      animating = false;
      return;
    }
    var now = performance.now();
    var dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;

    var max = maxScroll();
    targetY = clamp(targetY, 0, max);

    var diff = targetY - currentY;
    var factor = 1 - Math.exp(-10.5 * dt);
    var prevY = currentY;

    if (Math.abs(diff) < 0.35) {
      currentY = targetY;
      velocity *= 0.8;
      if (Math.abs(velocity) < 0.02) velocity = 0;
    } else {
      currentY += diff * factor;
      var instantVel = (currentY - prevY) / Math.max(dt, 0.008);
      velocity += (instantVel - velocity) * 0.25;
    }

    if (Math.abs(currentY - (window.scrollY || 0)) >= 0.2) {
      internalScroll = true;
      window.scrollTo(0, currentY);
      internalScroll = false;
    }

    if (window.ScrollTrigger && Math.abs(currentY - prevY) > 0.05) {
      window.ScrollTrigger.update();
    }

    document.documentElement.style.setProperty('--scroll-vel', clamp(velocity / 1800, -1, 1).toFixed(3));

    if (Math.abs(targetY - currentY) < 0.35 && Math.abs(velocity) < 0.02) {
      animating = false;
      lastTime = 0;
    }
  }

  function onWheel(event) {
    if (!enabled || event.ctrlKey || isDialogOpen() || hasScrollableParent(event.target)) return;
    event.preventDefault();
    if (!animating) {
      currentY = window.scrollY || 0;
      targetY = currentY;
      lastTime = performance.now();
    }
    var delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 30;
    else if (event.deltaMode === 2) delta *= window.innerHeight * 0.85;

    targetY = clamp(targetY + delta, 0, maxScroll());
    animating = true;
  }

  function onNativeScroll() {
    if (internalScroll) return;
    currentY = window.scrollY || 0;
    targetY = currentY;
    velocity = 0;
    animating = false;
    lastTime = 0;
  }

  function onKeydown(event) {
    if (!enabled || isDialogOpen()) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].indexOf(event.key) !== -1) {
      currentY = window.scrollY || 0;
      targetY = currentY;
      animating = false;
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
    targetY = top;
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
    document.documentElement.classList.add('smooth-scroll-active');
    document.documentElement.style.scrollBehavior = 'auto';
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    window.addEventListener('keydown', onKeydown, { passive: true });
    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.add(tick);
    }
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    animating = false;
    velocity = 0;
    document.documentElement.classList.remove('smooth-scroll-active');
    document.documentElement.style.removeProperty('scroll-behavior');
    document.documentElement.style.removeProperty('--scroll-vel');
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onNativeScroll);
    window.removeEventListener('keydown', onKeydown);
    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.remove(tick);
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
      velocity = 0;
      animating = false;
    }
  };
})();
