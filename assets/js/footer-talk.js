(function () {
  'use strict';
  var link = document.getElementById('talkLink');
  var text = document.getElementById('talkText');
  if (!window.gsap || !link || !text) return;
  var gsap = window.gsap;
  var raw = text.textContent;
  var media = gsap.matchMedia();

  media.add('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
    text.textContent = '';
    var letters = Array.from(raw, function (character) {
      var element = document.createElement('span');
      element.className = 'talk-letter';
      element.textContent = character === ' ' ? '\u00a0' : character;
      text.appendChild(element);
      return {
        element: element,
        x: gsap.quickTo(element, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(element, 'y', { duration: 0.6, ease: 'power3.out' })
      };
    });
    var centers;
    var point;
    var frame;

    function move(event) {
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = null;
        // 测量未偏移的字位，避免动画过程中反复读写布局造成抖动。
        if (!centers) centers = letters.map(function (letter) {
          var rect = letter.element.getBoundingClientRect();
          return { x: rect.left + rect.width / 2 - gsap.getProperty(letter.element, 'x'), y: rect.top + rect.height / 2 - gsap.getProperty(letter.element, 'y') };
        });
        letters.forEach(function (letter, index) {
          var dx = point.x - centers[index].x;
          var dy = point.y - centers[index].y;
          var force = Math.max(0, 1 - Math.hypot(dx, dy) / 260);
          letter.x(-dx * force * 0.5);
          letter.y(-dy * force * 0.5);
          letter.element.classList.toggle('is-near', force > 0);
        });
      });
    }
    function reset() {
      if (!centers && !frame) return;
      cancelAnimationFrame(frame);
      frame = null;
      centers = null;
      letters.forEach(function (letter) {
        letter.x(0); letter.y(0);
        letter.element.classList.remove('is-near');
      });
    }
    link.addEventListener('pointermove', move);
    link.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('resize', reset);
    return function () {
      cancelAnimationFrame(frame);
      link.removeEventListener('pointermove', move);
      link.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', reset);
      window.removeEventListener('resize', reset);
      letters.forEach(function (letter) { letter.x.tween.kill(); letter.y.tween.kill(); });
      text.textContent = raw;
    };
  });
})();
