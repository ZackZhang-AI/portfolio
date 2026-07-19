(function () {
  'use strict';

  var frames = document.getElementById('frames');
  if (!frames || !window.IntersectionObserver) return;

  var observer = new IntersectionObserver(function (entries) {
    if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
    observer.disconnect();
    requestAnimationFrame(function () {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  }, { rootMargin: '80% 0px', threshold: 0 });

  observer.observe(frames);
})();

(function () {
  'use strict';

  var studio = document.getElementById('studio');
  if (!studio) return;

  var refreshTimer;
  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, 80);
  }

  studio.querySelectorAll('img').forEach(function (image) {
    if (!image.complete) image.addEventListener('load', scheduleRefresh, { once: true });
  });

  if (window.ResizeObserver) {
    var previousHeight = studio.getBoundingClientRect().height;
    new ResizeObserver(function () {
      var currentHeight = studio.getBoundingClientRect().height;
      if (Math.abs(currentHeight - previousHeight) < 1) return;
      previousHeight = currentHeight;
      scheduleRefresh();
    }).observe(studio);
  }
})();
