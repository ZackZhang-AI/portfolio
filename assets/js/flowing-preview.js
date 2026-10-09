(function () {
  'use strict';
  if (!window.gsap) return;
  var gsap = window.gsap;
  var media = gsap.matchMedia();

  function makeSpan(className, text) {
    var span = document.createElement('span');
    span.className = className;
    if (text) span.textContent = text;
    return span;
  }

  function makePreview(row) {
    var preview = makeSpan('flowing-preview');
    preview.setAttribute('aria-hidden', 'true');
    var viewport = makeSpan('flowing-preview-window');
    var track = makeSpan('flowing-preview-track');
    var group = makeSpan('flowing-preview-group');
    for (var index = 0; index < 2; index++) {
      var unit = makeSpan('flowing-preview-unit');
      var image = document.createElement('img');
      image.alt = '';
      image.width = 148;
      image.height = 90;
      image.dataset.src = row.dataset.previewImage;
      image.decoding = 'async';
      unit.append(image, makeSpan('flowing-preview-title', row.dataset.previewTitle), makeSpan('flowing-preview-tag', row.dataset.previewTag));
      group.append(unit);
    }
    track.append(group, group.cloneNode(true));
    viewport.append(track);
    preview.append(viewport);
    row.append(preview);
    return { mask: preview, viewport: viewport };
  }

  media.add('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
    var dispose = [];
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { entry.target.classList.toggle('is-in-view', entry.isIntersecting); });
    });
    document.querySelectorAll('.flowing-row').forEach(function (row) {
      var original = Array.from(row.children);
      var preview = makePreview(row);
      var timeline;
      var pointerInside = false;
      row.classList.add('preview-ready');
      observer.observe(row);
      function edge(event) {
        if (!event || event.clientY == null) return 101;
        var rect = row.getBoundingClientRect();
        return event.clientY - rect.top < rect.height / 2 ? -101 : 101;
      }
      function enter(event) {
        preview.mask.querySelectorAll('img[data-src]').forEach(function (image) { image.src = image.dataset.src; image.removeAttribute('data-src'); });
        if (timeline) timeline.kill();
        var from = edge(event);
        row.classList.add('is-preview-active');
        timeline = gsap.timeline({ defaults: { duration: 0.55, ease: 'expo.out', overwrite: 'auto' } })
          .set(preview.mask, { y: 0, yPercent: from }, 0).set(preview.viewport, { y: 0, yPercent: -from }, 0)
          .to([preview.mask, preview.viewport], { yPercent: 0 }, 0)
          .to(original, { opacity: 0, duration: 0.25 }, 0);
      }
      function leave(event) {
        if (timeline) timeline.kill();
        var to = edge(event);
        row.classList.remove('is-preview-active');
        timeline = gsap.timeline({ defaults: { duration: 0.5, ease: 'expo.out', overwrite: 'auto' } })
          .to(preview.mask, { yPercent: to }, 0).to(preview.viewport, { yPercent: -to }, 0)
          .to(original, { opacity: 1, duration: 0.35 }, 0.08);
      }
      function pointerEnter(event) { pointerInside = true; enter(event); }
      function pointerLeave(event) { pointerInside = false; if (document.activeElement !== row) leave(event); }
      function focus() { if (!pointerInside) enter(); }
      function blur() { if (!pointerInside) leave(); }
      row.addEventListener('pointerenter', pointerEnter);
      row.addEventListener('pointerleave', pointerLeave);
      row.addEventListener('focus', focus);
      row.addEventListener('blur', blur);
      dispose.push(function () {
        if (timeline) timeline.kill();
        row.removeEventListener('pointerenter', pointerEnter); row.removeEventListener('pointerleave', pointerLeave);
        row.removeEventListener('focus', focus); row.removeEventListener('blur', blur);
        row.classList.remove('preview-ready', 'is-preview-active', 'is-in-view');
        original.forEach(function (element) { element.style.removeProperty('opacity'); });
        preview.mask.remove();
      });
    });
    function visibility() { document.documentElement.classList.toggle('page-hidden', document.hidden); }
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return function () {
      observer.disconnect(); dispose.forEach(function (cleanup) { cleanup(); });
      document.removeEventListener('visibilitychange', visibility);
      document.documentElement.classList.remove('page-hidden');
    };
  });
})();
