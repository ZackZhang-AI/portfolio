(function () {
  'use strict';

  var projects = {
    rag: {
      id: 'rag',
      title: 'RAG Knowledge Base',
      category: 'RAG · EVAL · 2025',
      description: '面向文档导入、知识检索与问答的 RAG 知识库系统，覆盖解析、混合检索、智能问答与自动化评测。',
      heroImage: 'assets/img/projects/rag/evaluation.png',
      heroAlt: 'RAG Knowledge Base 自动化评测页面',
      gallery: [
        {
          src: 'assets/img/projects/rag/knowledge-base-detail.png',
          alt: 'RAG Knowledge Base 知识库详情页面'
        },
        {
          src: 'assets/img/projects/rag/chat.png',
          alt: 'RAG Knowledge Base 智能问答页面'
        },
        {
          src: 'assets/img/projects/rag/dashboard.png',
          alt: 'RAG Knowledge Base 数据看板页面'
        },
        {
          src: 'assets/img/projects/rag/monitor.png',
          alt: 'RAG Knowledge Base 运行监控页面'
        }
      ],
      links: [
        {
          label: 'VIEW GITHUB ↗',
          url: 'https://github.com/ZackZhang-AI/RAG-Knowledge-Base-System'
        }
      ]
    },
    deepflow: {
      id: 'deepflow',
      title: 'DeepFlow',
      category: 'MULTI-AGENT · 2026',
      description: 'AI 深度研究平台，由 Planner、Researcher 和 Reporter 多 Agent 协作完成资料收集、分析与报告撰写。',
      heroImage: 'assets/img/projects/deepflow/research-home-2026.png',
      heroAlt: 'DeepFlow AI 深度研究平台首页',
      gallery: [
        {
          src: 'assets/img/projects/deepflow/home.png',
          alt: 'DeepFlow 深度研究工作台首页'
        }
      ],
      links: [
        {
          label: 'VIEW GITHUB ↗',
          url: 'https://github.com/ZackZhang-AI/DeepFlow'
        }
      ]
    },
    askMe: {
      id: 'askMe',
      title: 'Ask Me',
      category: 'CAREER AI · 2026',
      description: '面向 AI 产品招聘场景的候选人数字分身，通过可追问对话与事实来源展示教育、项目、实习经历和能力优势。',
      heroImage: 'assets/img/projects/ask-me/home.png',
      heroAlt: 'Ask Me AI Career Agent 首页',
      gallery: [
        {
          src: 'assets/img/projects/ask-me/chat.png',
          alt: 'Ask Me 问答界面：流式回答、引用来源与追问推荐'
        }
      ],
      links: [
        {
          label: 'ASK ME ABOUT ME ↗',
          url: 'https://ask-me-career-agent.vercel.app'
        },
        {
          label: 'VIEW GITHUB ↗',
          url: 'https://github.com/ZackZhang-AI/ask-me-career-agent'
        }
      ]
    },
    webCoding: {
      id: 'webCoding',
      title: 'Vibe Coding',
      category: 'CREATIVE TOOLS · 2026',
      description: '一组围绕求职、审计、代码质量与个人工作流构建的可运行产品原型，用完整交互验证具体想法。',
      heroImage: '',
      heroAlt: '',
      gallery: [],
      links: [],
      items: [
        {
          title: 'Thirty-Minute Brain',
          description: '本地保存最近工作线索，帮助快速恢复刚刚中断的工作现场。',
          image: 'assets/img/projects/web-coding/thirty-minute-brain.png',
          alt: 'Thirty-Minute Brain 本地工作记忆页面',
          url: 'https://github.com/ZackZhang-AI/thirty-minute-brain'
        },
        {
          title: 'Read Later Regret',
          description: '减少稍后阅读积压与信息债的浏览器插件体验。',
          image: 'assets/img/projects/web-coding/read-later-regret.png',
          alt: 'Read Later Regret 信息债仪表盘',
          url: 'https://github.com/ZackZhang-AI/read-later-regret'
        },
        {
          title: 'Downloads Butler',
          description: '先扫描、再建议、确认后移动的本地下载目录整理工具。',
          image: 'assets/img/projects/web-coding/downloads-butler.png',
          alt: 'Downloads Butler 文件整理建议页面',
          url: 'https://github.com/ZackZhang-AI/downloads-butler'
        },
        {
          title: 'AI Resume Agent',
          description: '围绕 JD 分析、简历优化、真实性校验与模拟面试构建的多 Agent 求职工具。',
          image: 'assets/img/projects/web-coding/ai-resume-agent.png',
          alt: 'AI Resume Agent 简历优化工作台',
          url: 'https://github.com/ZackZhang-AI/ai-resume-agent'
        },
        {
          title: 'Audit Intern Assistant',
          description: '为审计资料生成标准化命名、归档路径与人工复核提示的本地工作台。',
          image: 'assets/img/projects/web-coding/audit-intern-assistant.png',
          alt: '审计资料智能归档与底稿辅助生成系统',
          url: 'https://github.com/ZackZhang-AI/audit-intern-assistant'
        },
        {
          title: 'HarnessLab',
          description: '把代码变更转化为可观察审计轨迹、结构化发现与可导出报告的工作台。',
          image: 'assets/img/projects/web-coding/harnesslab.png',
          alt: 'HarnessLab Code Agent 审计结果页面',
          url: 'https://github.com/ZackZhang-AI/HarnessLab'
        },
        {
          title: 'IT Audit Log Assistant',
          description: '完成日志期间校验、字段检查、异常识别与审计关注点生成的抽查工具。',
          image: 'assets/img/projects/web-coding/it-audit-log-assistant.png',
          alt: 'IT 审计日志抽查助手异常分析页面',
          url: 'https://github.com/ZackZhang-AI/it-audit-log-sampling-assistant'
        },
        {
          title: 'Resume Autofill AI',
          description: '支持字段扫描、匹配、填写、撤销与回退流程的 Chrome 简历速填产品。',
          image: 'assets/img/projects/web-coding/resume-autofill-ai.png',
          alt: 'Resume Autofill AI 浏览器扩展字段匹配页面',
          url: 'https://github.com/ZackZhang-AI/resume-autofill-ai'
        }
      ]
    }
  };

  var dialog;
  var content;
  var closeButton;
  var lastTrigger;
  var previousOverflow = '';

  function externalLink(link) {
    return '<a class="project-dialog-link" href="' + link.url + '" target="_blank" rel="noopener noreferrer">' + link.label + '</a>';
  }

  function imageFigure(image, className) {
    return '<figure class="' + className + '"><img src="' + image.src + '" alt="' + image.alt + '" width="1440" height="900" loading="lazy" decoding="async"></figure>';
  }

  function subprojectCard(item) {
    return '<article class="project-dialog-subproject">' +
      '<img src="' + item.image + '" alt="' + item.alt + '" width="1440" height="900" loading="lazy" decoding="async">' +
      '<h3>' + item.title + '</h3>' +
      '<p>' + item.description + '</p>' +
      '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer">VIEW GITHUB ↗</a>' +
    '</article>';
  }

  function renderProject(project) {
    var links = project.links && project.links.length
      ? '<div class="project-dialog-links">' + project.links.map(externalLink).join('') + '</div>'
      : '';
    var hero = project.heroImage
      ? imageFigure({ src: project.heroImage, alt: project.heroAlt }, 'project-dialog-hero')
      : '';
    var gallery = project.gallery && project.gallery.length
      ? '<div class="project-dialog-gallery">' + project.gallery.map(function (image) {
          return imageFigure(image, 'project-dialog-gallery-item');
        }).join('') + '</div>'
      : '';
    var items = project.items && project.items.length
      ? '<div class="project-dialog-subprojects">' + project.items.map(subprojectCard).join('') + '</div>'
      : '';

    content.innerHTML =
      '<p class="project-dialog-kicker">' + project.category + '</p>' +
      '<h2 class="project-dialog-title" id="projectDialogTitle">' + project.title + '</h2>' +
      '<p class="project-dialog-intro">' + project.description + '</p>' +
      links + hero + gallery + items;
  }

  function openProject(projectId, trigger) {
    var project = projects[projectId];
    if (!project || !dialog) return;
    lastTrigger = trigger;
    renderProject(project);
    dialog.scrollTop = 0;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
  }

  function restorePage() {
    document.documentElement.style.overflow = previousOverflow;
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  function init() {
    dialog = document.getElementById('projectDialog');
    content = document.getElementById('projectDialogContent');
    closeButton = document.getElementById('projectDialogClose');
    if (!dialog || !content || !closeButton) return;

    document.querySelectorAll('.projectTrigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        openProject(trigger.getAttribute('data-project-id'), trigger);
      });
    });

    closeButton.addEventListener('click', function () {
      dialog.close();
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', restorePage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
