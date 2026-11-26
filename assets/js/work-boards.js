(function () {
  'use strict';

  var VIBE_ITEMS = [
    { name: 'Thirty-Minute Brain', stack: 'TAURI', mini: '本地 30 分钟工作记忆', desc: '本地保存最近工作线索，帮助快速恢复刚刚中断的工作现场。' },
    { name: 'Read Later Regret', stack: 'PLASMO', mini: '信息债治理插件', desc: '减少稍后阅读积压与信息债的浏览器插件体验。' },
    { name: 'Downloads Butler', stack: 'TAURI', mini: '先审后移目录整理', desc: '先扫描、再建议、确认后移动的本地下载目录整理工具。' },
    { name: 'AI Resume Agent', stack: 'AGENT', mini: 'JD 拆解与模拟面试', desc: '围绕 JD 分析、简历优化、真实性校验与模拟面试构建的多 Agent 工具。' },
    { name: 'Audit Intern', stack: 'PYTHON', mini: '审计底稿标准归档', desc: '为审计资料生成标准化命名、归档路径与人工复核提示的本地工作台。' },
    { name: 'HarnessLab', stack: 'NEXT.JS', mini: '代码审计可观测轨迹', desc: '把代码变更转化为可观察审计轨迹、结构化发现与可导出报告的工作台。' },
    { name: 'IT Audit Log', stack: 'PYTHON', mini: '审计日志异常抽查', desc: '完成日志期间校验、字段检查、异常识别与审计关注点生成的抽查工具。' },
    { name: 'Resume Autofill', stack: 'CHROME', mini: '网申速填与一键撤销', desc: '支持字段扫描、匹配、填写、撤销与回退流程的 Chrome 简历速填产品。' }
  ];

  var BOARD_BUILDERS = {
    askMe: function () {
      return (
        '<div class="wb-canvas" data-board="askMe">' +
          '<div class="wb-head">' +
            '<span class="wb-kicker wb-mono"><span class="wb-pulse"></span>CAREER AGENT · CLAIM-SOURCE</span>' +
            '<span class="wb-tag wb-mono">106 TESTS · 0 违规</span>' +
          '</div>' +
          '<div class="wb-ask-body">' +
            '<div class="wb-ask-q-row">' +
              '<div class="wb-ask-q">「你在滴滴风控工作台里，怎么划分 AI、规则和人工的边界？」</div>' +
            '</div>' +
            '<div class="wb-ask-a">' +
              '模型与 OCR 负责非结构化材料提取，确定性规则负责流水逐笔对账与财报三表勾稽，人工聚焦异常复核与终审；单户人工预审由 120 分钟压到 30 分钟' +
              '<span class="wb-cite wb-mono is-lit" data-cite="1">#01</span>' +
              '<span class="wb-cite wb-mono" data-cite="2">#02</span>' +
            '</div>' +
            '<div class="wb-ask-sources">' +
              '<div class="wb-source-card is-lit" data-source="1">' +
                '<span class="wb-source-id wb-mono">#01</span>' +
                '<div class="wb-source-copy">' +
                  '<span class="wb-source-title">滴滴风控预审记录</span>' +
                  '<span class="wb-source-meta">100+ 笔试点 · 降耗约 75%</span>' +
                '</div>' +
              '</div>' +
              '<div class="wb-source-card" data-source="2">' +
                '<span class="wb-source-id wb-mono">#02</span>' +
                '<div class="wb-source-copy">' +
                  '<span class="wb-source-title">求职分身评测集</span>' +
                  '<span class="wb-source-meta">48 个面试模拟 · 未知可拒答</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="wb-foot">' +
            '<span class="wb-mono">KNOWLEDGE → CLAIM → SOURCE</span>' +
            '<span class="wb-foot-sage wb-mono">VERIFIED EVIDENCE</span>' +
          '</div>' +
        '</div>'
      );
    },

    rag: function () {
      return (
        '<div class="wb-canvas" data-board="rag">' +
          '<div class="wb-head">' +
            '<span class="wb-kicker wb-mono"><span class="wb-pulse"></span>HYBRID RAG WORKBENCH</span>' +
            '<span class="wb-tag wb-tag--muted wb-mono">MILVUS · FASTAPI · RAGAS</span>' +
          '</div>' +
          '<div class="wb-rag-body">' +
            '<div class="wb-rag-steps">' +
              '<div class="wb-rag-step"><span class="wb-rag-step-num wb-mono">01</span><span class="wb-rag-step-name">文档解析</span><span class="wb-rag-step-sub">OCR + 结构切分</span></div>' +
              '<div class="wb-rag-step"><span class="wb-rag-step-num wb-mono">02</span><span class="wb-rag-step-name">混合召回</span><span class="wb-rag-step-sub">BM25 + 向量</span></div>' +
              '<div class="wb-rag-step wb-rag-step--hot"><span class="wb-rag-step-num wb-mono">03</span><span class="wb-rag-step-name">Rerank</span><span class="wb-rag-step-sub">相关性重排</span></div>' +
              '<div class="wb-rag-step"><span class="wb-rag-step-num wb-mono">04</span><span class="wb-rag-step-name">段落溯源</span><span class="wb-rag-step-sub">防幻觉引用</span></div>' +
            '</div>' +
            '<div class="wb-rag-split">' +
              '<div class="wb-rag-eval">' +
                '<div class="wb-bar-row">' +
                  '<div class="wb-bar-meta"><span>Faithfulness 忠实度</span><em class="wb-mono">已接入</em></div>' +
                  '<div class="wb-bar-track"><div class="wb-bar-fill" style="--wb-pct:88%;--wb-delay:80ms;"></div></div>' +
                '</div>' +
                '<div class="wb-bar-row">' +
                  '<div class="wb-bar-meta"><span>Answer Relevancy 相关性</span><em class="wb-mono">已接入</em></div>' +
                  '<div class="wb-bar-track"><div class="wb-bar-fill" style="--wb-pct:82%;--wb-delay:180ms;"></div></div>' +
                '</div>' +
                '<div class="wb-bar-row">' +
                  '<div class="wb-bar-meta"><span>Context Recall 召回率</span><em class="wb-mono">归因闭环</em></div>' +
                  '<div class="wb-bar-track"><div class="wb-bar-fill" style="--wb-pct:78%;--wb-delay:280ms;"></div></div>' +
                '</div>' +
              '</div>' +
              '<div class="wb-rag-trace">' +
                '<span class="wb-trace-kicker wb-mono">CITATION TRACE</span>' +
                '<p class="wb-trace-quote">回答强制绑定召回原文段落，Bad Case 自动拆解召回、排序与生成归因。</p>' +
                '<span class="wb-trace-chip wb-mono">Chunk #14 · Rerank Top-1</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="wb-foot">' +
            '<span class="wb-mono">脱敏复刻 DEMO · 完整闭环可运行</span>' +
            '<span class="wb-foot-accent wb-mono">RAGAS EVAL</span>' +
          '</div>' +
        '</div>'
      );
    },

    agentScope: function () {
      return (
        '<div class="wb-canvas" data-board="agentScope">' +
          '<div class="wb-head">' +
            '<span class="wb-kicker wb-mono"><span class="wb-pulse"></span>HARNESS TRACE · BLACKBOX REPLAY</span>' +
            '<span class="wb-tag wb-tag--sage wb-mono">90s CLOSED LOOP</span>' +
          '</div>' +
          '<div class="wb-as-body">' +
            '<div class="wb-as-phases wb-mono">' +
              '<span class="wb-as-phase wb-as-phase--err">01 Failure</span>' +
              '<span class="wb-as-phase wb-as-phase--err">02 Root Cause</span>' +
              '<span class="wb-as-phase wb-as-phase--fork">03 Fork</span>' +
              '<span class="wb-as-phase wb-as-phase--ok">04 Verified</span>' +
            '</div>' +
            '<div class="wb-as-waterfall">' +
              '<div class="wb-span-row">' +
                '<span class="wb-span-name wb-mono">read_file</span>' +
                '<div class="wb-span-track"><span class="wb-span-bar" style="--wb-left:4%;--wb-width:15%;--wb-delay:60ms;"></span></div>' +
                '<span class="wb-span-stat wb-mono">12ms</span>' +
              '</div>' +
              '<div class="wb-span-row">' +
                '<span class="wb-span-name wb-mono">search_code</span>' +
                '<div class="wb-span-track"><span class="wb-span-bar" style="--wb-left:19%;--wb-width:14%;--wb-delay:140ms;"></span></div>' +
                '<span class="wb-span-stat wb-mono">18ms</span>' +
              '</div>' +
              '<div class="wb-span-row">' +
                '<span class="wb-span-name wb-mono" style="color:#f69d8b;">run_tests ×3</span>' +
                '<div class="wb-span-track"><span class="wb-span-bar wb-span-bar--loop" style="--wb-left:33%;--wb-width:46%;--wb-delay:220ms;"></span></div>' +
                '<span class="wb-span-stat wb-span-stat--err wb-mono">LOOP</span>' +
              '</div>' +
              '<div class="wb-fork-line wb-mono">↳ Fork from Immutable Checkpoint #4</div>' +
              '<div class="wb-span-row">' +
                '<span class="wb-span-name wb-mono" style="color:#9ad3a6;">child_run</span>' +
                '<div class="wb-span-track"><span class="wb-span-bar wb-span-bar--pass" style="--wb-left:44%;--wb-width:44%;--wb-delay:340ms;"></span></div>' +
                '<span class="wb-span-stat wb-span-stat--ok wb-mono">PASS ✓</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="wb-foot">' +
            '<span class="wb-mono">TRACE · DIAGNOSTICS · FORK · COMPARE · EVAL</span>' +
            '<span class="wb-foot-accent wb-mono">SPAN EVIDENCE</span>' +
          '</div>' +
        '</div>'
      );
    },

    deepflow: function () {
      return (
        '<div class="wb-canvas" data-board="deepflow">' +
          '<div class="wb-head">' +
            '<span class="wb-kicker wb-mono"><span class="wb-pulse"></span>ASYNCIO MULTI-AGENT STATE MACHINE</span>' +
            '<span class="wb-tag wb-tag--muted wb-mono">5 ROLES · DEEPSEEK</span>' +
          '</div>' +
          '<div class="wb-df-body">' +
            '<div class="wb-df-graph">' +
              '<div class="wb-df-node">' +
                '<span class="wb-df-node-id wb-mono">01</span>' +
                '<span class="wb-df-node-title">Coordinator</span>' +
                '<span class="wb-df-node-sub">意图路由</span>' +
              '</div>' +
              '<span class="wb-df-arrow" aria-hidden="true">→</span>' +
              '<div class="wb-df-node">' +
                '<span class="wb-df-node-id wb-mono">02</span>' +
                '<span class="wb-df-node-title">Planner</span>' +
                '<span class="wb-df-node-sub">研究拆解</span>' +
              '</div>' +
              '<span class="wb-df-arrow" aria-hidden="true">→</span>' +
              '<div class="wb-df-branch">' +
                '<div class="wb-df-node wb-df-node--hot">' +
                  '<span class="wb-df-node-id wb-mono">03</span>' +
                  '<span class="wb-df-node-title">Researcher</span>' +
                  '<span class="wb-df-node-sub">Tavily 多源检索</span>' +
                '</div>' +
                '<div class="wb-df-node">' +
                  '<span class="wb-df-node-id wb-mono">04</span>' +
                  '<span class="wb-df-node-title">Coder</span>' +
                  '<span class="wb-df-node-sub">数据与逻辑校验</span>' +
                '</div>' +
              '</div>' +
              '<span class="wb-df-arrow" aria-hidden="true">→</span>' +
              '<div class="wb-df-node">' +
                '<span class="wb-df-node-id wb-mono">05</span>' +
                '<span class="wb-df-node-title">Reporter</span>' +
                '<span class="wb-df-node-sub">带引用合成</span>' +
              '</div>' +
            '</div>' +
            '<div class="wb-df-outputs">' +
              '<div class="wb-df-out"><span>结构化带引用报告</span><span class="wb-mono">MD</span></div>' +
              '<div class="wb-df-out"><span>对话式研究播客</span><span class="wb-mono">AUDIO</span></div>' +
              '<div class="wb-df-out"><span>演示大纲与幻灯</span><span class="wb-mono">PPT</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="wb-foot">' +
            '<span class="wb-mono">FASTAPI · NEXT.JS 16 · 自研 ASYNCIO 状态机</span>' +
            '<span class="wb-foot-accent wb-mono">MULTI-OUTPUT</span>' +
          '</div>' +
        '</div>'
      );
    },

    webCoding: function () {
      var tilesHtml = VIBE_ITEMS.map(function (it, idx) {
        return (
          '<div class="wb-vc-tile' + (idx === 0 ? ' is-lit' : '') + '" data-vc-idx="' + idx + '">' +
            '<div class="wb-vc-tile-top">' +
              '<span class="wb-vc-stack wb-mono">' + it.stack + '</span>' +
              '<span class="wb-vc-num wb-mono">0' + (idx + 1) + '</span>' +
            '</div>' +
            '<div class="wb-vc-name">' + it.name + '</div>' +
            '<div class="wb-vc-mini">' + it.mini + '</div>' +
          '</div>'
        );
      }).join('');

      var first = VIBE_ITEMS[0];
      return (
        '<div class="wb-canvas" data-board="webCoding">' +
          '<div class="wb-head">' +
            '<span class="wb-kicker wb-mono"><span class="wb-pulse"></span>8 WORKING PROTOTYPES MATRIX</span>' +
            '<span class="wb-tag wb-mono">DESKTOP · EXT · PY</span>' +
          '</div>' +
          '<div class="wb-vc-grid">' + tilesHtml + '</div>' +
          '<div class="wb-foot">' +
            '<span class="wb-vc-readout"><strong>' + first.name + '</strong> · ' + first.desc + '</span>' +
            '<span class="wb-foot-accent wb-mono">8 LIVE TOOLS</span>' +
          '</div>' +
        '</div>'
      );
    }
  };

  function wireBoardInteractions(root) {
    // 01 Ask Me: 悬停引用编号联动下方证据卡片
    var askBoard = root.querySelector('[data-board="askMe"]');
    if (askBoard) {
      var cites = Array.from(askBoard.querySelectorAll('[data-cite]'));
      var sources = Array.from(askBoard.querySelectorAll('[data-source]'));
      function highlightSource(id) {
        cites.forEach(function (c) { c.classList.toggle('is-lit', c.getAttribute('data-cite') === id); });
        sources.forEach(function (s) { s.classList.toggle('is-lit', s.getAttribute('data-source') === id); });
      }
      cites.forEach(function (c) {
        c.addEventListener('pointerenter', function () { highlightSource(c.getAttribute('data-cite')); });
      });
      sources.forEach(function (s) {
        s.addEventListener('pointerenter', function () { highlightSource(s.getAttribute('data-source')); });
      });
    }

    // 05 Vibe Coding: 悬停 8 原型 Bento 块实时切换底部说明
    var vcBoard = root.querySelector('[data-board="webCoding"]');
    if (vcBoard) {
      var tiles = Array.from(vcBoard.querySelectorAll('[data-vc-idx]'));
      var readout = vcBoard.querySelector('.wb-vc-readout');
      function selectTile(idx) {
        var item = VIBE_ITEMS[idx];
        if (!item) return;
        tiles.forEach(function (t, i) { t.classList.toggle('is-lit', i === idx); });
        if (readout) {
          readout.innerHTML = '<strong>' + item.name + '</strong> · ' + item.desc;
        }
      }
      tiles.forEach(function (tile) {
        tile.addEventListener('pointerenter', function () {
          selectTile(Number(tile.getAttribute('data-vc-idx')));
        });
      });
    }
  }

  function enhanceViewportLayer(container, boardId) {
    if (!container || !BOARD_BUILDERS[boardId] || container.dataset.boardEnhanced === '1') return;
    var img = container.querySelector('img');
    var isDarkRaw = boardId === 'deepflow' || boardId === 'webCoding';

    // 将原有真机截图装裱进暗底实机层
    var rawLayer = document.createElement('span');
    rawLayer.className = 'work-slide-raw';
    var rawShell = document.createElement('span');
    rawShell.className = 'work-slide-raw-shell';
    if (isDarkRaw) rawShell.setAttribute('data-raw-tone', 'dark');
    if (img) rawShell.appendChild(img);
    var badge = document.createElement('span');
    badge.className = 'work-raw-badge';
    badge.textContent = 'REAL SCREENSHOT · 实机原图';
    rawShell.appendChild(badge);
    rawLayer.appendChild(rawShell);

    // 创建暗色活体画板层
    var boardLayer = document.createElement('span');
    boardLayer.className = 'work-slide-board';
    boardLayer.innerHTML = BOARD_BUILDERS[boardId]();

    container.textContent = '';
    container.appendChild(boardLayer);
    container.appendChild(rawLayer);
    container.dataset.boardEnhanced = '1';
    wireBoardInteractions(boardLayer);
  }

  function setFrameMode(frameEl, mode) {
    var nextMode = mode === 'raw' ? 'raw' : 'board';
    frameEl.setAttribute('data-view-mode', nextMode);
    frameEl.querySelectorAll('.work-mode-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-work-mode') === nextMode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function initDesktopStage() {
    var frame = document.getElementById('workStageFrame');
    if (!frame) return;
    frame.setAttribute('data-view-mode', 'board');

    var slides = Array.from(frame.querySelectorAll('.work-stage-slide'));
    slides.forEach(function (slide) {
      var boardId = slide.getAttribute('data-board-id');
      if (boardId) enhanceViewportLayer(slide, boardId);
    });

    // 顶栏「画板 / 实机」切换胶囊
    frame.querySelectorAll('.work-mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        setFrameMode(frame, btn.getAttribute('data-work-mode'));
      });
    });

    // 点击展台视口区域仍可流畅打开对应案例弹窗
    var viewport = frame.querySelector('.work-stage-viewport');
    var cta = document.getElementById('workFrameCta');
    if (viewport && cta) {
      viewport.addEventListener('click', function () {
        cta.click();
      });
    }
  }

  function initMobileChapters() {
    var chapters = Array.from(document.querySelectorAll('.work-chapter'));
    chapters.forEach(function (chapter) {
      var boardId = chapter.getAttribute('data-project-id');
      var card = chapter.querySelector('.work-chapter-media');
      if (!card || !boardId || !BOARD_BUILDERS[boardId]) return;

      card.setAttribute('data-view-mode', 'board');
      var media = card.querySelector('.work-frame-media');
      if (media) enhanceViewportLayer(media, boardId);

      // 给移动端卡片顶栏也注入「画板 / 实机」微切换（阻止冒泡避免误触发弹窗）
      var chrome = card.querySelector('.work-frame-chrome');
      var cta = card.querySelector('.work-frame-cta');
      if (chrome && cta && !chrome.querySelector('.work-mode-toggle')) {
        var toggle = document.createElement('span');
        toggle.className = 'work-mode-toggle';
        toggle.setAttribute('role', 'group');
        toggle.setAttribute('aria-label', '切换展示模式');
        toggle.innerHTML =
          '<button class="work-mode-btn is-active" type="button" data-work-mode="board" aria-pressed="true">画板</button>' +
          '<button class="work-mode-btn" type="button" data-work-mode="raw" aria-pressed="false">实机</button>';
        chrome.insertBefore(toggle, cta);

        toggle.querySelectorAll('.work-mode-btn').forEach(function (btn) {
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            setFrameMode(card, btn.getAttribute('data-work-mode'));
          });
        });
      }

      if (media && cta) {
        media.addEventListener('click', function () {
          cta.click();
        });
      }
    });
  }

  function init() {
    initDesktopStage();
    initMobileChapters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
