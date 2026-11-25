(function () {
  'use strict';
  if (!window.gsap) return;
  var gsap = window.gsap;
  var media = gsap.matchMedia();

  media.add('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
    var disposers = [];
    var resets = [];

    // 每帧只测量一次命中的组件，离开或失焦立即结束；不运行全页鼠标循环。
    function track(element, update, reset) {
      var frame = 0;
      var point;
      function move(event) {
        if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
        point = { x: event.clientX, y: event.clientY };
        element.classList.add('pointer-active');
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          var rect = element.getBoundingClientRect();
          update(point.x - rect.left, point.y - rect.top, rect);
        });
      }
      function leave() {
        cancelAnimationFrame(frame);
        frame = 0;
        element.classList.remove('pointer-active');
        reset();
      }
      element.addEventListener('pointerenter', move);
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', leave);
      resets.push(leave);
      disposers.push(function () {
        cancelAnimationFrame(frame);
        element.classList.remove('pointer-active');
        element.removeEventListener('pointerenter', move);
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', leave);
      });
    }

    // 仅箭头跟随，文字与点击区域保持原位；避免与滚动变换争用元素。
    document.querySelectorAll('.button > span[aria-hidden], .text-link > span[aria-hidden], .nav-resume > span[aria-hidden], .proof-agent-link > span[aria-hidden], .hero-scroll > span[aria-hidden], .signal-source > span, .capability-caption > span').forEach(function (arrow) {
      var control = arrow.closest('a, button');
      if (!control) return;
      arrow.classList.add('pointer-arrow');
      gsap.set(arrow, { x: 0, y: 0 });
      var xTo = gsap.quickTo(arrow, 'x', { duration: 0.45, ease: 'power3.out' });
      var yTo = gsap.quickTo(arrow, 'y', { duration: 0.45, ease: 'power3.out' });
      track(control, function (x, y, rect) {
        xTo(3 + gsap.utils.clamp(-5, 5, (x / rect.width - 0.5) * 10));
        yTo(-2 + gsap.utils.clamp(-3, 3, (y / rect.height - 0.5) * 6));
      }, function () { xTo(0); yTo(0); });
      disposers.push(function () { arrow.classList.remove('pointer-arrow'); });
    });

    document.querySelectorAll('.flowing-row').forEach(function (row) {
      gsap.set(row, { '--preview-drift': 0 });
      var driftTo = gsap.quickTo(row, '--preview-drift', { duration: 0.65, ease: 'power3.out' });
      track(row, function (x, y, rect) {
        driftTo((0.5 - x / rect.width) * 48);
      }, function () { driftTo(0); });
    });

    function resetAll() { resets.forEach(function (reset) { reset(); }); }
    function visibility() { if (document.hidden) resetAll(); }
    window.addEventListener('blur', resetAll);
    document.addEventListener('visibilitychange', visibility);
    return function () {
      disposers.forEach(function (dispose) { dispose(); });
      window.removeEventListener('blur', resetAll);
      document.removeEventListener('visibilitychange', visibility);
    };
  });
})();
