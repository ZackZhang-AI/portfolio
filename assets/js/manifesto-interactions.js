(function () {
  'use strict';

  function initManifesto() {
    if (!window.gsap || !window.ScrollTrigger) return;

    var statements = window.gsap.utils.toArray('.manifesto-statement');
    if (!statements.length) return;

    var previous = window.ScrollTrigger.getById('manifestoEditorial');
    if (previous) previous.kill(true);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.gsap.set('.manifesto-line, .manifesto-index, .manifesto-note, .manifesto-rule', {
        clearProps: 'all'
      });
      return;
    }

    var timeline = window.gsap.timeline({
      scrollTrigger: {
        id: 'manifestoEditorial',
        trigger: '#manifesto',
        start: 'top 72%',
        end: 'bottom 72%',
        scrub: 0.85,
        invalidateOnRefresh: true
      }
    });

    statements.forEach(function (statement, index) {
      var line = statement.querySelector('.manifesto-line');
      var number = statement.querySelector('.manifesto-index');
      var note = statement.querySelector('.manifesto-note');
      var rule = statement.querySelector('.manifesto-rule');
      var at = index * 0.9;

      timeline
        .fromTo(number,
          { opacity: 0, x: -22 },
          { opacity: 0.62, x: 0, duration: 0.55, ease: 'power3.out' },
          at)
        .fromTo(line,
          { yPercent: 112, rotation: index % 2 ? -2.2 : 2.2 },
          { yPercent: 0, rotation: 0, duration: 0.9, ease: 'power4.out' },
          at)
        .fromTo(rule,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: 'power3.inOut' },
          at + 0.12)
        .fromTo(note,
          { opacity: 0, y: 18 },
          { opacity: 0.55, y: 0, duration: 0.62, ease: 'power3.out' },
          at + 0.24);
    });

    requestAnimationFrame(function () { window.ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(initManifesto, 360);
    }, { once: true });
  } else {
    setTimeout(initManifesto, 360);
  }
})();
