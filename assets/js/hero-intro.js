(function () {
  'use strict';

  var media;

  window.initPortfolioHero = function () {
    if (media) media.revert();
    var gsap = window.gsap;
    media = gsap.matchMedia();

    media.add('(min-width: 768px) and (min-height: 601px) and (prefers-reduced-motion: no-preference)', function () {
      // Animate the wrapper so scrolling cannot interrupt the line entrance.
      var timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'heroIntro',
          trigger: '#heroWrap',
          start: 'top top',
          end: 'bottom 35%',
          scrub: 0.55
        }
      });

      timeline.to('.hero-copy', { y: -36, autoAlpha: 0, duration: 0.65 }, 0.22);
      timeline.to('.hero-title-mask:first-child', { xPercent: -10, rotation: -0.8, duration: 1 }, 0);
      timeline.to('.hero-title-mask:last-child', { xPercent: 10, rotation: 0.8, duration: 1 }, 0);
      timeline.to(['#sideLabels', '#bottomUI'], {
        autoAlpha: 0,
        duration: 0.45
      }, 0.14);
    });
  };
})();
