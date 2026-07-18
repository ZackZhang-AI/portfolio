(function () {
  'use strict';

  var revealHole = document.getElementById('revealHole');
  if (!revealHole) return;

  function refreshReveal() {
    revealHole.classList.add('is-decoded');
    requestAnimationFrame(function () {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  }

  if (revealHole.complete && revealHole.naturalWidth > 0) {
    refreshReveal();
    return;
  }

  revealHole.addEventListener('load', refreshReveal, { once: true });
  if (revealHole.decode) revealHole.decode().then(refreshReveal).catch(function () {});
})();
