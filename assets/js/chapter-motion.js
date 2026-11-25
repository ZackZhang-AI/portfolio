(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var media = gsap.matchMedia();

  media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', function () {
    // 仅在有明确明暗/底色切换的幕布（#studio、连续暗色幕 #darkAct）上做边缘展开，避免相邻黑底章节出现米色接缝，也不裁切浅色区阴影。
    var scenes = gsap.utils.toArray('#studio, #darkAct');
    var restoreText = [];

    scenes.forEach(function (section) {
      section.classList.add('motion-scene');
      gsap.fromTo(section, { '--chapter-enter': 1 }, {
        '--chapter-enter': 0, ease: 'power1.inOut',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 42%', scrub: 0.7 }
      });
      gsap.fromTo(section, { '--chapter-exit': 0 }, {
        '--chapter-exit': 1, ease: 'power2.in',
        scrollTrigger: { trigger: section, start: 'bottom 52%', end: 'bottom top', scrub: 0.7 }
      });
    });

    // 只替换文字节点，保留原来的换行、子元素及读屏标题；采用干净的垂直裁切升起，不与阅读期透明度衰减冲突。
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
      gsap.fromTo(glyphs, { yPercent: 108, opacity: 0 }, {
        yPercent: 0,
        opacity: 1,
        duration: 0.72,
        stagger: { amount: 0.22 },
        ease: 'expo.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: heading, start: 'top 90%', once: true }
      });
    });

    gsap.fromTo('#talkLink', { scale: 0.92, y: 20, opacity: 0 }, {
      scale: 1,
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '.talk-title', start: 'top 90%', once: true }
    });

    return function () {
      restoreText.forEach(function (restore) { restore(); });
      scenes.forEach(function (section) { section.classList.remove('motion-scene'); });
    };
  });
})();
