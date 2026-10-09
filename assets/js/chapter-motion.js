(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var media = gsap.matchMedia();

  media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', function () {
    var scenes = gsap.utils.toArray('#studio, #testimonials, .signals-section, #work, #capabilities, #method, #knowledge, #footer');
    var restoreText = [];

    // 进出场各用一个变量，避免长章节的动画跨度挤占正文阅读区。
    scenes.forEach(function (section) {
      section.classList.add('motion-scene');
      gsap.fromTo(section, { '--chapter-enter': 1 }, {
        '--chapter-enter': 0, ease: 'power1.inOut',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 38%', scrub: 0.8 }
      });
      gsap.fromTo(section, { '--chapter-exit': 0 }, {
        '--chapter-exit': 1, ease: 'power2.in',
        scrollTrigger: { trigger: section, start: 'bottom 58%', end: 'bottom top', scrub: 0.8 }
      });
    });

    // 只替换文字节点，保留原来的换行、子元素及动画引用；无重复的读屏文本。
    gsap.utils.toArray('.section-heading h2, .about-intro h2, .signals-heading h2, .capabilities-heading h2, .knowledge-group-heading h3').forEach(function (heading) {
      var label = heading.getAttribute('aria-label');
      var text = heading.textContent.trim();
      var walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      var nodes = [];
      var node;
      while ((node = walker.nextNode())) if (node.textContent.trim()) nodes.push(node);
      var glyphs = [];
      heading.setAttribute('aria-label', text);
      nodes.forEach(function (original) {
        var wrapper = document.createElement('span');
        wrapper.setAttribute('aria-hidden', 'true');
        original.textContent.match(/[A-Za-z0-9]+|\s+|./gu).forEach(function (token) {
          if (!token.trim()) return wrapper.appendChild(document.createTextNode(token));
          var frame = document.createElement('span');
          var glyph = document.createElement('span');
          frame.className = 'kinetic-window';
          glyph.className = 'kinetic-glyph';
          glyph.textContent = token;
          frame.appendChild(glyph);
          wrapper.appendChild(frame);
          glyphs.push(glyph);
        });
        original.replaceWith(wrapper);
        restoreText.push(function () { wrapper.replaceWith(original); });
      });
      restoreText.push(function () {
        if (label === null) heading.removeAttribute('aria-label');
        else heading.setAttribute('aria-label', label);
      });
      gsap.fromTo(glyphs, { yPercent: 110, rotationX: -75, opacity: 0 }, {
        yPercent: 0, rotationX: 0, opacity: 1, duration: 0.85, stagger: { amount: 0.32 }, ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 92%', end: 'bottom 6%', toggleActions: 'play reverse play reverse' }
      });
    });

    gsap.fromTo('#talkLink', { scale: 0.8, rotationX: 28, transformPerspective: 1200 }, {
      scale: 1, rotationX: 0, ease: 'power2.out',
      scrollTrigger: { trigger: '.talk-title', start: 'top 96%', end: 'top 55%', scrub: 0.9 }
    });

    return function () {
      restoreText.forEach(function (restore) { restore(); });
      scenes.forEach(function (section) { section.classList.remove('motion-scene'); });
    };
  });
})();
