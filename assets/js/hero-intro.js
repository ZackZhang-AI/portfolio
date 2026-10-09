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
          end: 'bottom 30%',
          scrub: 0.65
        }
      });

      timeline.to('.hero-copy', { y: -60, autoAlpha: 0, duration: 0.75 }, 0.25);
      timeline.to('.hero-title-mask:first-child', { xPercent: -24, rotation: -3, scale: 1.08, duration: 1 }, 0);
      timeline.to('.hero-title-mask:last-child', { xPercent: 24, rotation: 3, scale: 1.08, duration: 1 }, 0);
      timeline.to(['#sideLabels', '#bottomUI'], {
        autoAlpha: 0,
        duration: 0.5
      }, 0.25);
    });
  };
})();
