(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var links = document.querySelectorAll('.footer-primary-links a');

  if (!window.gsap || reduceMotion || !links.length) return;

  links.forEach(function (link) {
    var text = link.querySelector('.footer-magnetic-text');
    if (!text || text.dataset.split === 'true') return;

    var raw = text.textContent;
    text.textContent = '';
    text.dataset.split = 'true';

    var characters = raw.split('').map(function (character) {
      var span = document.createElement('span');
      span.className = 'footer-magnetic-character';
      span.textContent = character === ' ' ? '\u00A0' : character;
      text.appendChild(span);
      return span;
    });

    var setters = characters.map(function (character) {
      return {
        element: character,
        x: window.gsap.quickTo(character, 'x', { duration: 0.6, ease: 'power3' }),
        y: window.gsap.quickTo(character, 'y', { duration: 0.6, ease: 'power3' })
      };
    });

    link.addEventListener('pointermove', function (event) {
      setters.forEach(function (setter) {
        var rect = setter.element.getBoundingClientRect();
        var deltaX = event.clientX - (rect.left + rect.width / 2);
        var deltaY = event.clientY - (rect.top + rect.height / 2);
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        var radius = 180;

        if (distance < radius) {
          var force = 1 - distance / radius;
          setter.x(-deltaX * force * 0.5);
          setter.y(-deltaY * force * 0.5);
          setter.element.style.color = '#F97316';
        } else {
          setter.x(0);
          setter.y(0);
          setter.element.style.color = '#17140F';
        }
      });
    });

    link.addEventListener('pointerleave', function () {
      setters.forEach(function (setter) {
        setter.x(0);
        setter.y(0);
        setter.element.style.color = '#17140F';
      });
    });
  });
})();
