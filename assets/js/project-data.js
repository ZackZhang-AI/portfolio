(function () {
  'use strict';

  window.PORTFOLIO_PROJECTS = {
    didiRisk: {
      id: 'didiRisk',
      title: '租车商家准入 AI 预审工作台',
      category: '滴滴 · ABC 智能一组 · 2026.09 — 至今',
      description: '从 0 到 1 搭建面向业务、财务、法务三方的 AI 风控预审工作台，以“材料建档—AI 解析—规则核验—三方审核”分层协同，把人工从跨文件检索与对账中解放出来。',
      metrics: [
        { value: '120 → 30 分钟', label: '单户人工预审耗时（约降 75%）' },
        { value: '100+ 笔', label: '内部试点商家预审' },
        { value: '150+ 小时', label: '累计节省人工预审耗时' }
      ],
      sections: [
        { title: '业务问题与一期取舍', text: '下游租车商家准入需提交营业执照、征信、银行流水、财报等十类材料（单户 30–100+ 份文件），业务、财务、法务三方人工核对约需 120 分钟。深聊后拒绝“黑盒自动放行”，将一期聚焦于租前材料辅助预审闭环，让 AI 与规则替人做脏活累活、人工聚焦异常与最终担责。' },
        { title: '工作流分工与架构破局', text: '明确三者边界：模型与 OCR 负责非结构化材料提取，程序规则负责银行流水逐笔对账、财报三表勾稽与负债率计算，人工负责异常复核与终审。针对真实脏材料（歪拍执照、红章压字、手写合同、71 行车表截断与假冲突），通过 38 题 × 3 模型对照选型 + 40 份难例四家线上 OCR 盲测，拆分“看图”与“理解”，并从业务需求重构大表提取规则、为每条字段挂上原件定位。' },
        { title: '验证与落地结果', text: '118 份重度复杂材料重跑识别通过率 100%、0 截断、假冲突清零、整案速度提升 3–11 倍且输入 Token 减半。一期投入内部使用，完成 100+ 笔商家试点预审，单户人工预审耗时由约 120 分钟降至 30 分钟（减少约 75%），累计节省 150+ 小时。' }
      ],
      evidence: '来源：2026-11-26 滴滴实习最新口径。120 → 30 分钟及 100+ 笔对应一期内部业务使用反馈口径，38×3 脱敏审核题对照与 118 份重度材料重跑分属不同验证层，不混为一谈。',
      links: [{ label: '向 AI 分身追问风控项目细节 ↗', url: 'https://ask-me-career-agent.vercel.app/' }]
    },
    didiDiva: {
      id: 'didiDiva',
      title: 'DiVA 营销素材工作台',
      category: '滴滴 · ABC 智能一组 · 2026.09 — 至今',
      description: '面向内部营销运营团队，采用“模板约束 + AI 局部生成 + 人工审核”思路，把一次活动需求转化为可复用、多规格、符合品牌规范的素材交付工作流。',
      metrics: [
        { value: '2 小时 → 40 分钟', label: '单批素材交付耗时' },
        { value: '60+ 份', label: '业务采用素材（11 个点位）' },
        { value: '80%', label: '首次验收通过率' }
      ],
      sections: [
        { title: '业务问题与方案取舍', text: '大促期间同一活动需适配十余个不同投放点位，运营反复提需求改尺寸、改文案。前期放弃“AI 全自动生整张成品海报”（品牌规范与优惠金额出错成本高），改用模板固定品牌与核心信息、AI 负责创意视觉与文案、人工终审把关的分工。' },
        { title: '需求判断与迭代', text: '梳理交付 SOP 并搭建“主视觉生成—元素复用—多广告位适配—校样导出”流程。面对试用期涌入的 37 条运营反馈，先拆分“业务目标”与“用户建议做法”，按认知引导、交互体验、技术约束三层归因排期，优先解决阻断当期交付的瓶颈。' },
        { title: '落地结果', text: '落地机酒国庆营销活动，覆盖 11 个已验收广告位，累计交付 60+ 份业务采用素材；单批交付耗时由 2 小时降至 40 分钟（人工制作耗时降 60%+），首次验收通过率达 80%。' }
      ],
      evidence: '来源：个人简历与滴滴实习记录。上述指标对应机酒国庆营销活动交付与验收场景，37 条为业务试用反馈记录（非前期访谈次数）。',
      links: [{ label: '向 AI 分身了解这段经历 ↗', url: 'https://ask-me-career-agent.vercel.app/' }]
    },
    didiPricing: {
      id: 'didiPricing',
      title: '机票竞品比价 Skill',
      category: '滴滴 · ABC 智能一组 · 2026.09 — 至今',
      description: '将跨平台查价、同航班匹配、异常恢复与报告导出封装为可复用 Skill，让业务快速定位供给缺口与高价航班排查优先级。',
      metrics: [
        { value: '90%+', label: '人工耗时降低' },
        { value: '约 2,500 条', label: '累计航线比价任务' },
        { value: '10 万+', label: '累计原始抓取数据' }
      ],
      sections: [
        { title: '业务问题与指标口径', text: '人工跨平台查价、对航班和汇总报告成本高，且时点、舱位或来源混用易导致数据不可比。先固定任务输入契约、同航班匹配规则（日期/航班号/起降机场/共享经停）及覆盖率、价差、低价率口径，交付可回溯原查询记录的异常排查清单。' },
        { title: 'Skill 三层结构与批处理提效', text: '按入口层（触发与目标）、主体层（六步流程与状态机）、引用层（字段映射与回归样本）封装。针对实测中页面准备与登录恢复占大头的问题，设计检查点局部补采与人工登录接管恢复机制，避免整批重跑。' },
        { title: '业务应用规模', text: '累计完成约 2,500 条航线比价任务、抓取超 10 万条原始报价记录，人工耗时降低 90% 以上，直接输出供给待核查与高价候选清单支持业务定优化优先级。' }
      ],
      evidence: '来源：2026-11-26 滴滴实习最新口径。约 2,500 条为累计航线比价任务，10 万+ 为原始抓取数据量，分析时按可比航班对与业务确认异常分层核验。',
      links: [{ label: '向 AI 分身了解这段经历 ↗', url: 'https://ask-me-career-agent.vercel.app/' }]
    },
    webdevBench: {
      id: 'webdevBench',
      title: 'WebDev E2E Bench',
      category: '百度 · 文心一言 · 2026.06 — 2026.09',
      description: '把代码能否通过检查，扩展为网页是否完成真实产品任务；通过任务集合、质量维度与可视化控制台支持模型比较和问题定位。',
      metrics: [
        { value: '71.4%', label: '人工操作时间减少 · 离线测算' },
        { value: '73.3%', label: '报告整理时间减少 · 离线测算' }
      ],
      sections: [
        { title: '业务问题', text: '传统代码评测偏重通过率，难以反映真实网页的功能、视觉和交互体验。' },
        { title: '我的贡献', text: '调研 Web-Bench、SWE-bench 等 13 项 Benchmark；设计覆盖 6 类 Web 开发任务、6 个产品领域和 3 档难度的任务集合，从 7 个维度评价交付质量。推动任务提交、模型生成、自动检查的端到端流程与可视化控制台落地，呈现进度、得分和失败证据。' },
        { title: '验证与优化', text: '完成 6 个旗舰模型的实测与横向比较。通过优化任务执行和文件写入协议，复杂样本任务得分由 16.04 提升至 69.07，输入 Token 降低 70.8%。' }
      ],
      evidence: '来源：个人简历。71.4% 和 73.3% 为离线测算；16.04 → 69.07 与 70.8% 对应复杂样本优化，不代表全任务集或所有模型的整体提升。',
      links: [{ label: '向 AI 分身了解这段经历 ↗', url: 'https://ask-me-career-agent.vercel.app/' }]
    },
    baiduEval: {
      id: 'baiduEval',
      title: '业务场景评测与策略迭代',
      category: '百度 · 文心一言 · 2026.06 — 2026.09',
      description: '通过多模型、多版本评测与 Bad Case 归因，让模型选型和策略迭代有可比较、可复测的依据。',
      sections: [
        { title: '业务问题', text: '业务场景中需要识别模型能力差异和高频失败问题，支持模型选型与版本验收。' },
        { title: '我的贡献', text: '开展多模型、多版本批量评测，从模型能力、Prompt、检索和运行环境等层面分类归因；结合评测结论提出 Prompt、检索策略和调用流程的优化建议。' },
        { title: '如何验证', text: '协同算法与研发团队完成版本复测，持续跟踪优化前后的质量、Token 消耗和响应效率。' }
      ],
      evidence: '来源：个人简历。评测按模型和版本对比质量、Token 消耗与响应效率，结论用于模型选型、策略迭代和版本验收。',
      links: [{ label: '向 AI 分身了解这段经历 ↗', url: 'https://ask-me-career-agent.vercel.app/' }]
    },
    baichuanRag: {
      id: 'baichuanRag',
      title: '医疗 RAG 知识助手',
      category: '百川智能 · AI 产品经理实习 · 2026.04 — 2026.06',
      description: '面向医院、卫健委和药企等医疗客户，参与企业知识助手的需求梳理、功能设计与检索问答评测。',
      metrics: [
        { value: '十余家', label: '潜在客户需求调研' },
        { value: '3 轮 / 30 条', label: '累计内部 QA 评测' }
      ],
      sections: [
        { title: '业务问题', text: '医疗客户需要管理专业知识，并解决模型幻觉与答案无法溯源的问题；不同客户还需要针对性配置。' },
        { title: '我的贡献', text: '调研并梳理十余家潜在客户的工作现状，协助转化产品功能；参与文档解析、知识库管理、检索问答和引用溯源设计，推动向量召回、Rerank、短期记忆与多助手配置方案落地。' },
        { title: '如何验证', text: '搭建 RAG 自动化评测，完成 3 轮、累计 30 条内部 QA 评测；利用 Bad Case 定位召回、排序和生成问题，为 Rerank 与 Prompt 优化提供依据。' }
      ],
      evidence: '来源：个人简历。30 条为累计内部 QA 评测范围。下方公开仓库为个人脱敏复刻 Demo，不是企业内部代码，也不代表生产环境的全部实现。',
      links: [{ label: '查看个人脱敏复刻 DEMO ↗', url: 'https://github.com/ZackZhang-AI/RAG-Knowledge-Base-System' }]
    },
    rag: {
      id: 'rag',
      title: 'RAG Knowledge Base',
      category: '个人项目 · 脱敏复刻 DEMO · 2026',
      description: '将百川智能实习中的医疗 RAG 实践整理为可公开查看的脱敏复刻 Demo，呈现从文档入库、检索问答到引用溯源和自动化评测的完整流程。',
      sections: [
        { title: '解决什么问题', text: '围绕医疗知识查找、模型幻觉与答案溯源，把检索过程和回答依据呈现在同一条工作流中。' },
        { title: '实现了什么', text: '覆盖多格式文档解析（OCR + 结构分析）、BM25 与向量混合检索、Rerank、段落级引用，以及参考 RAGAS 思路的忠实度、相关性与召回率评测。' }
      ],
      evidence: '这里展示的是个人脱敏复刻 Demo 和公开仓库，不是百川智能内部产品截图；实习中的贡献与内部评测数据在「百川智能 · 医疗 RAG」案例中单独说明。',
      stack: 'FASTAPI · VUE 3 · MILVUS · MINIO · CELERY · RABBITMQ · RAGAS',
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
      description: '输入一个研究主题，由多个 Agent 协作完成规划、检索、分析与报告撰写，形成带引用的结构化研究产物。',
      sections: [
        { title: '解决什么问题', text: '将研究任务中分散的信息检索、资料整理与报告撰写串成可运行的工作流。' },
        { title: '实现了什么', text: '由 Coordinator、Planner、Researcher、Coder、Reporter 分工协作，支持不同报告风格，以及播客、PPT 等衍生产物。' }
      ],
      evidence: '公开仓库与界面展示研究流程、角色分工和报告产物，可用于核验实现范围。',
      stack: 'DEEPSEEK · FASTAPI · NEXT.JS 16 · TAVILY · 自研 asyncio 状态机',
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
      description: '面向 AI 产品招聘场景的候选人数字分身：回答只使用已审核公开知识并保留 Claim-Source 事实对应，可以追问、会拒答；请求预算、跨实例限流与紧急开关控制线上风险。',
      metrics: [
        { value: '106 项', label: '自动化测试' },
        { value: '48 个', label: '面试模拟检验' }
      ],
      sections: [
        { title: '解决什么问题', text: '简历信息有限，无法继续追问，也难以核验个人贡献。设计并上线求职数字分身，支持多轮问答与面试深挖。' },
        { title: '我的贡献', text: '定义招聘场景的产品能力，设计 Knowledge-Claim-Source 证据模型，管理 AI 辅助范围，并加入未知问题拒答与幻觉处理。' },
        { title: '如何验证', text: '质量评测集覆盖 20 个核心问题、20 个安全攻击及多轮追问；完成 106 项自动化测试和 48 个面试模拟检验。简历记录该评测范围内核心证据覆盖率 100%、硬事实 0 违规。' }
      ],
      evidence: '来源：个人简历。评测结论对应 20 个核心问题、20 个安全攻击、多轮追问，以及上述测试与检验范围。公开代码和引用来源可进一步核验。',
      stack: 'NEXT.JS · DEEPSEEK · UPSTASH · NEON · VERCEL BLOB',
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
      stack: 'TAURI · PLASMO · REACT · PYTHON · CHROME EXTENSION',
      heroImage: '',
      heroAlt: '',
      gallery: [],
      links: [],
      items: [
        {
          title: 'Thirty-Minute Brain',
          description: '本地保存最近工作线索，帮助快速恢复刚刚中断的工作现场。',
          stack: 'TAURI · REACT · TYPESCRIPT',
          image: 'assets/img/projects/web-coding/thirty-minute-brain.png',
          alt: 'Thirty-Minute Brain 本地工作记忆页面',
          url: 'https://github.com/ZackZhang-AI/thirty-minute-brain'
        },
        {
          title: 'Read Later Regret',
          description: '减少稍后阅读积压与信息债的浏览器插件体验。',
          stack: 'PLASMO · REACT · TYPESCRIPT',
          image: 'assets/img/projects/web-coding/read-later-regret.png',
          alt: 'Read Later Regret 信息债仪表盘',
          url: 'https://github.com/ZackZhang-AI/read-later-regret'
        },
        {
          title: 'Downloads Butler',
          description: '先扫描、再建议、确认后移动的本地下载目录整理工具。',
          stack: 'TAURI · REACT · TYPESCRIPT',
          image: 'assets/img/projects/web-coding/downloads-butler.png',
          alt: 'Downloads Butler 文件整理建议页面',
          url: 'https://github.com/ZackZhang-AI/downloads-butler'
        },
        {
          title: 'AI Resume Agent',
          description: '围绕 JD 分析、简历优化、真实性校验与模拟面试构建的多 Agent 求职工具。',
          stack: 'PYTHON · MULTI-AGENT',
          image: 'assets/img/projects/web-coding/ai-resume-agent.png',
          alt: 'AI Resume Agent 简历优化工作台',
          url: 'https://github.com/ZackZhang-AI/ai-resume-agent'
        },
        {
          title: 'Audit Intern Assistant',
          description: '为审计资料生成标准化命名、归档路径与人工复核提示的本地工作台。',
          stack: 'PYTHON · DOCUMENT PROCESSING',
          image: 'assets/img/projects/web-coding/audit-intern-assistant.png',
          alt: '审计资料智能归档与底稿辅助生成系统',
          url: 'https://github.com/ZackZhang-AI/audit-intern-assistant'
        },
        {
          title: 'HarnessLab',
          description: '把代码变更转化为可观察审计轨迹、结构化发现与可导出报告的工作台。',
          stack: 'NEXT.JS · CODE AUDIT',
          image: 'assets/img/projects/web-coding/harnesslab.png',
          alt: 'HarnessLab Code Agent 审计结果页面',
          url: 'https://github.com/ZackZhang-AI/AgentScope'
        },
        {
          title: 'IT Audit Log Assistant',
          description: '完成日志期间校验、字段检查、异常识别与审计关注点生成的抽查工具。',
          stack: 'PYTHON · DATA ANALYSIS',
          image: 'assets/img/projects/web-coding/it-audit-log-assistant.png',
          alt: 'IT 审计日志抽查助手异常分析页面',
          url: 'https://github.com/ZackZhang-AI/it-audit-log-sampling-assistant'
        },
        {
          title: 'Resume Autofill AI',
          description: '支持字段扫描、匹配、填写、撤销与回退流程的 Chrome 简历速填产品。',
          stack: 'CHROME EXTENSION · HONO · TYPESCRIPT',
          image: 'assets/img/projects/web-coding/resume-autofill-ai.png',
          alt: 'Resume Autofill AI 浏览器扩展字段匹配页面',
          url: '',
          note: 'PRIVATE REPO · 面试现场可演示'
        }
      ]
    },
    agentScope: {
      id: 'agentScope',
      title: 'AgentScope',
      category: 'AGENT OBSERVABILITY · 2026',
      description: 'AI Agent 黑匣子回放器：追踪计划、模型决策、工具调用、延迟、Token 与错误，定位无进展循环，从不可变 Checkpoint 创建 Child Run，并用 Span 证据验证修复。公开演示无需 API Key 或 Docker，90 秒走完失败 → 定位 → 分叉 → 验证闭环。',
      sections: [
        { title: '解决什么问题', text: '当 Agent 没有完成任务时，需要追溯失败发生在哪里、为什么发生，以及修复是否生效。' },
        { title: '实现了什么', text: '将运行轨迹、诊断、分叉重跑和对比评测放入同一工作台，用 Span 证据串联「失败 → 定位 → 分叉 → 验证」。' }
      ],
      evidence: '公开演示提供预设失败案例，可体验 Trace、Diagnostics、Fork、Compare 和 Eval 流程；实现范围见公开仓库。',
      stack: 'NEXT.JS 16 · POSTGRESQL · PLAYWRIGHT · DOCKER · V0.3.4',
      heroImage: 'assets/img/projects/agentscope/home.png',
      heroAlt: 'AgentScope 首页：Failure → Root cause → Fork → Verified fix',
      gallery: [
        {
          src: 'assets/img/projects/agentscope/case-study.png',
          alt: 'AgentScope Case Study：Trace、Diagnostics、Compare 与 Eval'
        }
      ],
      links: [
        {
          label: 'LIVE DEMO ↗',
          url: 'https://agentscope-harnesslab.vercel.app'
        },
        {
          label: 'VIEW GITHUB ↗',
          url: 'https://github.com/ZackZhang-AI/AgentScope'
        }
      ]
    }
  };
})();
