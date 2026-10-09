(function () {
  'use strict';

  var projects = window.PORTFOLIO_PROJECTS || {};

  var dialog;
  var content;
  var closeButton;
  var lastTrigger;
  var activeProjectId;
  var returnContext;
  var previousOverflow = '';
  var pageUrl = window.location.pathname + window.location.search + window.location.hash;
  var pagePosition = { x: window.scrollX, y: window.scrollY };

  function externalLink(link) {
    return '<a class="project-dialog-link" href="' + link.url + '" target="_blank" rel="noopener noreferrer">' + link.label + '</a>';
  }

  function imageFigure(image, className) {
    return '<figure class="' + className + '"><img src="' + image.src + '" alt="' + image.alt + '" width="1440" height="900" loading="lazy" decoding="async"></figure>';
  }

  function subprojectCard(item) {
    var stack = item.stack
      ? '<p class="project-dialog-subproject-stack">' + item.stack + '</p>'
      : '';
    var action = item.url
      ? '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer">VIEW GITHUB ↗</a>'
      : '<span class="project-dialog-subproject-note">' + (item.note || 'PRIVATE REPO') + '</span>';
    return '<article class="project-dialog-subproject">' +
      '<img src="' + item.image + '" alt="' + item.alt + '" width="1440" height="900" loading="lazy" decoding="async">' +
      '<h3>' + item.title + '</h3>' +
      stack +
      '<p>' + item.description + '</p>' +
      action +
    '</article>';
  }

  function renderProject(project) {
    var links = '<div class="project-dialog-links">' + (project.links || []).map(externalLink).join('') +
      '<button class="project-dialog-link project-dialog-share" type="button" id="projectShare">复制案例链接</button></div>' +
      '<p class="project-dialog-feedback" id="projectShareFeedback" role="status" aria-live="polite"></p>' +
      '<label class="project-dialog-copy-fallback" id="projectShareFallback" hidden>案例链接<input id="projectShareUrl" type="text" readonly></label>';
    var hero = project.heroImage
      ? imageFigure({ src: project.heroImage, alt: project.heroAlt }, 'project-dialog-hero')
      : '';
    var gallery = project.gallery && project.gallery.length
      ? '<div class="project-dialog-gallery">' + project.gallery.map(function (image) {
          return imageFigure(image, 'project-dialog-gallery-item');
        }).join('') + '</div>'
      : '';
    var items = project.items && project.items.length
      ? '<h3 class="project-dialog-section-heading">8 个可运行原型</h3><div class="project-dialog-subprojects">' + project.items.map(subprojectCard).join('') + '</div>'
      : '';
    var stack = project.stack
      ? '<p class="project-dialog-stack">' + project.stack + '</p>'
      : '';
    var metrics = project.metrics && project.metrics.length
      ? '<dl class="case-metrics">' + project.metrics.map(function (metric) {
          return '<div><dt>' + metric.label + '</dt><dd>' + metric.value + '</dd></div>';
        }).join('') + '</dl>'
      : '';
    var sections = project.sections && project.sections.length
      ? '<div class="case-sections">' + project.sections.map(function (section, index) {
          return '<section class="case-section"><h3><span aria-hidden="true">0' + (index + 1) + '</span>' + section.title + '</h3><p>' + section.text + '</p></section>';
        }).join('') + '</div>'
      : '';
    var evidence = project.evidence
      ? '<aside class="case-evidence"><h3>证据与口径</h3><p>' + project.evidence + '</p></aside>'
      : '';
    var mediaHeading = hero || gallery ? '<h3 class="project-dialog-section-heading">项目界面</h3>' : '';

    content.innerHTML =
      '<p class="project-dialog-kicker">' + project.category + '</p>' +
      '<h2 class="project-dialog-title" id="projectDialogTitle">' + project.title + '</h2>' +
      '<p class="project-dialog-intro">' + project.description + '</p>' +
      links + metrics + sections + evidence + stack + mediaHeading + hero + gallery + items;
    document.getElementById('projectShare').addEventListener('click', copyProjectLink);
  }

  function copyProjectLink() {
    var url = new URL(window.location.href);
    url.hash = 'project-' + activeProjectId;
    var feedback = document.getElementById('projectShareFeedback');
    function showManualCopy() {
      var fallback = document.getElementById('projectShareFallback');
      var input = document.getElementById('projectShareUrl');
      if (!fallback || !input) return;
      feedback.textContent = '浏览器未允许自动复制，请复制下方链接。';
      fallback.hidden = false;
      input.value = url.href;
      input.focus({ preventScroll: true });
      input.select();
    }
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      showManualCopy();
      return;
    }
    navigator.clipboard.writeText(url.href).then(function () {
      feedback.textContent = '链接已复制，可直接打开本案例。';
    }, showManualCopy);
  }

  function projectFromHash() {
    var id = window.location.hash.slice('#project-'.length);
    return window.location.hash.indexOf('#project-') === 0 &&
      Object.prototype.hasOwnProperty.call(projects, id) ? id : null;
  }

  function showProject(projectId, trigger, context) {
    if (!dialog.open) {
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    }
    returnContext = context;
    lastTrigger = trigger || document.querySelector('.projectTrigger[data-project-id="' + projectId + '"]');
    activeProjectId = projectId;
    renderProject(projects[projectId]);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
  }

  function openProject(projectId, trigger) {
    if (!Object.prototype.hasOwnProperty.call(projects, projectId) || dialog.open) return;
    var context = {
      url: window.location.pathname + window.location.search + window.location.hash,
      x: window.scrollX,
      y: window.scrollY
    };
    window.history.pushState({ portfolioProject: context }, '', '#project-' + projectId);
    showProject(projectId, trigger, context);
  }

  function syncLocation() {
    var projectId = projectFromHash();
    if (projectId) {
      if (dialog.open && activeProjectId === projectId) return;
      var context = window.history.state && window.history.state.portfolioProject;
      if (!context) {
        context = { url: pageUrl, x: pagePosition.x, y: pagePosition.y };
        window.history.replaceState({ portfolioProject: context }, '', window.location.href);
      }
      showProject(projectId, null, context);
    } else {
      pageUrl = window.location.pathname + window.location.search + window.location.hash;
      if (dialog.open) dialog.close();
    }
  }

  function requestClose() {
    if (dialog.open) window.history.back();
  }

  function restorePage() {
    document.documentElement.style.overflow = previousOverflow;
    activeProjectId = null;
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus({ preventScroll: true });
    var position = returnContext;
    window.requestAnimationFrame(function () {
      if (!dialog.open && position) {
        window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
        pagePosition = { x: position.x, y: position.y };
      }
    });
  }

  function init() {
    dialog = document.getElementById('projectDialog');
    content = document.getElementById('projectDialogContent');
    closeButton = document.getElementById('projectDialogClose');
    if (!dialog || !content || !closeButton) return;

    document.querySelectorAll('.projectTrigger').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openProject(trigger.getAttribute('data-project-id'), trigger);
      });
    });

    closeButton.addEventListener('click', requestClose);
    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      requestClose();
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) requestClose();
    });
    dialog.addEventListener('close', restorePage);
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);
    window.addEventListener('scroll', function () {
      if (!dialog.open) pagePosition = { x: window.scrollX, y: window.scrollY };
    }, { passive: true });

    // 直达链接也保留一个页面历史项，返回键关闭详情，刷新不重复插入。
    var initialProject = projectFromHash();
    if (initialProject && !(window.history.state && window.history.state.portfolioProject)) {
      pageUrl = window.location.pathname + window.location.search;
      var context = { url: pageUrl, x: window.scrollX, y: window.scrollY };
      window.history.replaceState(window.history.state, '', pageUrl);
      window.history.pushState({ portfolioProject: context }, '', '#project-' + initialProject);
    }
    syncLocation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
