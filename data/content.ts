export type Locale = "zh" | "en";

export type Bilingual = { zh: string; en: string };

export type SourceRef = {
  label: Bilingual;
  kind: "thesis" | "readme" | "media" | "archive";
  note?: Bilingual;
};

export type MediaAsset = {
  id: string;
  stage: Bilingual;
  title: Bilingual;
  caption: Bilingual;
  alt: Bilingual;
  posterPath: string;
  fallbackPath: string;
  videoPath?: string;
  source: SourceRef;
};

export type ArchiveFigure = {
  path: string;
  alt: Bilingual;
  caption: Bilingual;
  format?: "wide" | "square" | "sequence";
};

export type ArchiveSection = {
  id: string;
  title: Bilingual;
  body: Bilingual;
  points?: Bilingual[];
  figures?: ArchiveFigure[];
  sources: SourceRef[];
};

export type ProjectArchive = {
  slug: string;
  index: string;
  title: Bilingual;
  subtitle: Bilingual;
  category: Bilingual;
  period: string;
  status: "primary" | "secondary" | "pending";
  accent: "blue" | "red" | "ink";
  summary: Bilingual;
  tags: string[];
  sections: ArchiveSection[];
  sources: SourceRef[];
  media?: MediaAsset[];
};

export const navItems = [
  { href: "/", label: { zh: "首页", en: "Home" } },
  { href: "/projects", label: { zh: "档案", en: "Archive" } },
  { href: "/about", label: { zh: "关于", en: "About" } },
  { href: "/ask", label: { zh: "提问", en: "Ask" } },
] as const;

const thesisChapter3: SourceRef = { label: { zh: "论文第3章 · 系统设计与实现", en: "Thesis chapter 3 · System design and implementation" }, kind: "thesis" };
const thesisChapter4: SourceRef = { label: { zh: "论文第4章 · 实验与分析", en: "Thesis chapter 4 · Experiments and analysis" }, kind: "thesis" };
const thesisChapter5: SourceRef = { label: { zh: "论文第5章 · 总结与展望", en: "Thesis chapter 5 · Conclusion and outlook" }, kind: "thesis" };
const silReadme: SourceRef = { label: { zh: "SIL README · 系统概述与运行机制", en: "SIL README · System overview and runtime mechanisms" }, kind: "readme" };
const silReadmeLlm: SourceRef = { label: { zh: "SIL README.LLM · 评测与安全说明", en: "SIL README.LLM · Evaluation and safety notes" }, kind: "readme" };

export const mediaAssets: MediaAsset[] = [
  {
    id: "takeoff",
    stage: { zh: "阶段 01", en: "Stage 01" },
    title: { zh: "自主起飞", en: "Autonomous takeoff" },
    caption: { zh: "从任务意图进入飞行状态。", en: "From mission intent into flight state." },
    alt: { zh: "无人机自主起飞仿真画面", en: "Simulation frame of an autonomous UAV takeoff" },
    posterPath: "/media/uav/takeoff-poster.webp",
    fallbackPath: "/media/uav/takeoff.gif",
    source: { label: { zh: "论文视频 · 自主起飞", en: "Thesis media · Autonomous takeoff" }, kind: "media" },
  },
  {
    id: "yaw-align",
    stage: { zh: "阶段 02", en: "Stage 02" },
    title: { zh: "视觉对准", en: "Visual alignment" },
    caption: { zh: "以目标在画面中的位置修正偏航。", en: "Correcting yaw from the target's image position." },
    alt: { zh: "无人机视觉对准目标仿真画面", en: "Simulation frame of visual target alignment" },
    posterPath: "/media/uav/yaw-align-poster.webp",
    fallbackPath: "/media/uav/yaw-align.gif",
    source: { label: { zh: "论文视频 · 视觉对准", en: "Thesis media · Visual alignment" }, kind: "media" },
  },
  {
    id: "approach",
    stage: { zh: "阶段 03", en: "Stage 03" },
    title: { zh: "平滑逼近", en: "Smooth approach" },
    caption: { zh: "低通滤波、死区与阶段状态共同保持轨迹。", en: "Filtering, dead zones, and staged control keep the trajectory steady." },
    alt: { zh: "无人机平滑逼近目标仿真画面", en: "Simulation frame of a smooth UAV approach" },
    posterPath: "/media/uav/approach-poster.webp",
    fallbackPath: "/media/uav/approach.gif",
    source: { label: { zh: "论文视频 · 平滑逼近", en: "Thesis media · Smooth approach" }, kind: "media" },
  },
  {
    id: "terminal-traverse",
    stage: { zh: "阶段 04", en: "Stage 04" },
    title: { zh: "终端穿越", en: "Terminal traverse" },
    caption: { zh: "以模拟目标控制 / 终端穿越完成 strike 任务。", en: "Completing the strike task as a simulated target-control / terminal-traverse action." },
    alt: { zh: "无人机终端穿越仿真画面", en: "Simulation frame of terminal target traversal" },
    posterPath: "/media/uav/terminal-traverse-poster.webp",
    fallbackPath: "/media/uav/terminal-traverse.gif",
    source: { label: { zh: "论文视频 · 终端穿越", en: "Thesis media · Terminal traverse" }, kind: "media" },
  },
];

export const uavArchive: ProjectArchive = {
  slug: "uav-recognition-strike-control",
  index: "01",
  title: { zh: "基于大模型的无人机识别打击控制算法", en: "LLM-Based UAV Recognition and Strike Control Algorithm" },
  subtitle: { zh: "一个把自然语言任务放进可检查飞行链路的研究档案。", en: "A research archive for placing natural-language missions inside an inspectable flight chain." },
  category: { zh: "论文主档案 · UAV / AI 控制", en: "Thesis primary archive · UAV / AI control" },
  period: "2025—2026",
  status: "primary",
  accent: "blue",
  summary: { zh: "本系统不让大模型直接接管飞行。它把模型放在高层意图与策略位置，再通过规则、视觉伺服、飞控和安全防护把动作收束到可验证边界内。这里的 strike 指软件在环场景中的模拟目标控制 / 终端穿越任务。", en: "The system does not hand flight directly to a language model. It places the model at the intent and strategy layer, then bounds execution through rules, visual servoing, the flight stack, and safety guards. Here, strike means a simulated target-control / terminal-traverse task in a software-in-the-loop scene." },
  tags: ["LLM", "YOLOE", "MAVLink / PX4", "RflySim", "SIL", "Visual servo"],
  sources: [thesisChapter3, thesisChapter4, thesisChapter5, silReadme, silReadmeLlm],
  media: mediaAssets,
  sections: [
    {
      id: "abstract",
      title: { zh: "用白话说", en: "In plain language" },
      body: { zh: "人可以用一句话描述一个复合任务，但无人机需要明确的动作、目标和安全边界。档案中的核心问题是：如何让语言模型处理模糊任务，同时让急停、限幅、围栏和超时等关键保护不依赖模型的即时判断。", en: "A person can describe a compound mission in one sentence, while a UAV needs explicit actions, targets, and safety boundaries. The central question is how a language model can handle ambiguity while emergency stop, limits, fences, and timeouts do not depend on its immediate judgment." },
      points: [
        { zh: "模型负责理解与生成候选策略。", en: "The model handles interpretation and candidate strategies." },
        { zh: "本地规则负责确定性动作与快速分流。", en: "Local rules handle deterministic actions and fast routing." },
        { zh: "视觉、控制与安全层负责执行前后的检查。", en: "Perception, control, and safety layers check the action before and after execution." },
      ],
      sources: [thesisChapter3, silReadme],
    },
    {
      id: "architecture",
      title: { zh: "四层架构", en: "Four-layer architecture" },
      body: { zh: "系统按感知、决策、控制和安全四层组织。它们不是一条只能向下流动的管线：看门狗可以从输入侧短路任务，安全层则包住所有最终下发动作。", en: "The system is organized into perception, decision, control, and safety layers. It is not only a one-way downward pipeline: the watchdog can short-circuit a task from the input side, while the safety layer wraps every final command." },
      points: [
        { zh: "感知层：目标检测、状态读取与位姿桥接。", en: "Perception: object detection, state reading, and pose bridging." },
        { zh: "决策层：意图拦截、子句拆分、路由与模型兜底。", en: "Decision: intent interception, clause splitting, routing, and model fallback." },
        { zh: "控制层：阶段式逼近、原地对准、终端穿越与固定位移。", en: "Control: staged approach, in-place alignment, terminal traverse, and fixed displacement." },
        { zh: "安全层：速度限幅、高度墙、空间围栏与超时降级。", en: "Safety: velocity limits, altitude wall, space fence, and timeout fallback." },
      ],
      figures: [{
        path: "/research/uav/system-architecture.png",
        alt: { zh: "无人机语言控制系统总体架构图", en: "Overall architecture of the language-controlled UAV system" },
        caption: { zh: "图 3-1｜系统总架构：感知、决策、控制与安全防护构成闭环。", en: "Fig. 3-1 | System architecture: perception, decision, control, and safety form a closed loop." },
        format: "wide",
      }],
      sources: [thesisChapter3, silReadme],
    },
    {
      id: "hybrid-routing",
      title: { zh: "混合路由", en: "Hybrid routing" },
      body: { zh: "路由的目标不是把所有问题都交给模型，而是先判断哪些动作已经足够明确。急停和常见位移等确定性指令走本地硬规则；连接词会把复合句拆成子句；只有规则无法解释的复杂语义才进入模型兜底。两条路径最终共享安全校验。", en: "Routing is not about sending every problem to the model. It first asks which actions are already explicit. Emergency stop and common displacement use local hard rules; conjunctions split compound instructions into clauses; only semantics that rules cannot explain reach model fallback. Both paths share the final safety checks." },
      points: [
        { zh: "急停 / 退出：最高优先级，绕过任务队列。", en: "Emergency stop / exit: highest priority, bypassing the task queue." },
        { zh: "条件、位移、转向、搜索、靠近、朝向与返航：本地模板。", en: "Conditions, displacement, turns, search, approach, aim, and return: local templates." },
        { zh: "复杂或未命中语义：模型生成候选动作，再进入受限执行边界。", en: "Complex or unmatched semantics: model-generated candidate actions enter a constrained execution boundary." },
      ],
      sources: [thesisChapter3, silReadmeLlm],
    },
    {
      id: "watchdog",
      title: { zh: "双线程看门狗", en: "Dual-thread watchdog" },
      body: { zh: "看门狗输入线程始终监听终端，不把急停放进工作队列。它直接发送零速度制动、设置中断状态并清空历史任务；工作线程在子句之间检查中断状态，避免后续动作继续执行。", en: "The watchdog input thread keeps listening at the terminal and never queues an emergency stop. It sends a zero-velocity brake, marks the task interrupted, and clears queued work; the worker checks that state between clauses so later actions do not continue." },
      points: [
        { zh: "输入监听与任务执行解耦。", en: "Input listening is decoupled from task execution." },
        { zh: "急停路径不依赖模型响应或任务队列。", en: "The emergency path does not depend on model response or queue order." },
        { zh: "工作线程拥有可观察的中断边界。", en: "The worker has an explicit, observable interruption boundary." },
      ],
      sources: [thesisChapter3, silReadme, silReadmeLlm],
    },
    {
      id: "perception",
      title: { zh: "视觉感知", en: "Perception" },
      body: { zh: "视觉前端用 YOLOE 提供目标检测接口和观察接口：前者返回类别、置信度与包围框位置，后者把当前视野中的目标整理成结构化状态，供路由与策略理解。仿真从 RflySim / UE4 获取画面，运行模式也支持相机与动捕链路。", en: "The visual front end uses YOLOE for detection and observation interfaces. Detection returns class, confidence, and box position; observation turns visible targets into structured state for routing and strategy. In simulation, frames come from RflySim / UE4, while camera and motion-capture paths are supported by the runtime modes." },
      points: [
        { zh: "detect：回答画面里有什么。", en: "detect: what is in the frame?" },
        { zh: "look：把观察结果放进任务上下文。", en: "look: place observations into task context." },
        { zh: "状态反馈：把前一步的目标信息带入下一条子句。", en: "State feedback: carry target information into the next clause." },
      ],
      figures: [
        {
          path: "/research/uav/simulation-environment.png",
          alt: { zh: "RflySim 软件在环实验环境", en: "RflySim software-in-the-loop environment" },
          caption: { zh: "图 3-2｜软件在环场景与视觉目标布置。", en: "Fig. 3-2 | Software-in-the-loop scene and visual targets." },
          format: "wide",
        },
        {
          path: "/research/uav/detection-preview.png",
          alt: { zh: "YOLOE 多目标检测预览", en: "YOLOE multi-object detection preview" },
          caption: { zh: "图 3-3｜检测结果以类别、置信度和包围框进入任务上下文。", en: "Fig. 3-3 | Class, confidence, and bounding boxes enter the task context." },
          format: "square",
        },
      ],
      sources: [thesisChapter3, silReadme],
    },
    {
      id: "servo-strike",
      title: { zh: "视觉伺服与 strike 控制", en: "Visual servoing & strike control" },
      body: { zh: "视觉伺服先进入 YAW_ALIGN，让目标收敛到画面中心；再进入 APPROACH，根据目标位置和尺度调整前进、垂向与偏航。目标接近到视觉难以稳定观察的阶段后，系统切换到终端盲飞：以估算的剩余距离和速度形成短暂冲刺，随后急刹悬停。这里的 strike 是模拟目标控制 / 终端穿越任务，不描述现实伤害。", en: "Visual servoing begins with YAW_ALIGN, bringing the target toward the image center, then moves to APPROACH, adjusting forward, vertical, and yaw motion from target position and scale. When the target becomes too close for stable visual tracking, the system switches to terminal blind flight: a short burst based on estimated distance and velocity, followed by braking and hover. Here, strike is a simulated target-control / terminal-traverse task, not a description of real-world harm." },
      points: [
        { zh: "低通滤波与死区抑制画面抖动。", en: "Low-pass filtering and dead zones suppress visual jitter." },
        { zh: "短暂丢失目标时保持末态趋势，避免立刻失败。", en: "A brief target loss preserves the last motion trend instead of failing immediately." },
        { zh: "终端阶段以穿越模拟验证闭环衔接。", en: "The terminal stage verifies the handoff through simulated traversal." },
      ],
      figures: [
        {
          path: "/research/uav/servo-align.png",
          alt: { zh: "视觉伺服对准阶段", en: "Visual-servo alignment stage" },
          caption: { zh: "A｜对准：目标向画面中心收敛。", en: "A | Align: the target converges toward the image center." },
          format: "sequence",
        },
        {
          path: "/research/uav/servo-approach.png",
          alt: { zh: "视觉伺服逼近阶段", en: "Visual-servo approach stage" },
          caption: { zh: "B｜逼近：依据目标位置与尺度持续修正。", en: "B | Approach: corrections follow target position and scale." },
          format: "sequence",
        },
        {
          path: "/research/uav/servo-terminal.png",
          alt: { zh: "终端穿越阶段", en: "Terminal traverse stage" },
          caption: { zh: "C｜终端：短暂穿越后制动悬停。", en: "C | Terminal: a short traverse followed by braking and hover." },
          format: "sequence",
        },
      ],
      sources: [thesisChapter3, silReadmeLlm],
    },
    {
      id: "safety",
      title: { zh: "安全防护", en: "Safety guards" },
      body: { zh: "安全层以非侵入式方式包裹飞控下发接口。它不假设上游永远正确，而是对每个动作重新检查速度、空间、高度和时间边界；遇到越界或超时，动作被拒绝或降级到悬停。", en: "The safety layer wraps flight-command interfaces non-intrusively. It does not assume upstream correctness; every action is checked again against velocity, space, altitude, and time boundaries. A violation or timeout is rejected or downgraded to hover." },
      points: [
        { zh: "动态速度限幅：根据搜索、靠近与 strike 阶段收紧动作范围。", en: "Dynamic velocity limits: tighten the action range by search, approach, and strike stage." },
        { zh: "高度墙：拒绝贴地或超高风险指令。", en: "Altitude wall: reject near-ground or over-ceiling risk." },
        { zh: "空间围栏：拦截将离开起飞点允许区域的移动。", en: "Space fence: intercept motion that would leave the allowed area around home." },
        { zh: "超时降级：任务超时后停止动作并进入悬停。", en: "Timeout fallback: stop the action and hover when a task expires." },
      ],
      sources: [thesisChapter3, thesisChapter5, silReadmeLlm],
    },
    {
      id: "methods",
      title: { zh: "实验方法", en: "Experiment methods" },
      body: { zh: "论文将验证拆成安全性消融、语义理解、视觉靠近、终端穿越和物理样机联调等方向。这个网站只呈现方法、证据类型和限制，不把实验数值做成首页指标或个人能力评分。", en: "The thesis validates the system through safety ablation, semantic understanding, visual approach, terminal traversal, and physical-prototype integration. This site presents methods, evidence types, and limits without turning experiment values into homepage metrics or personal capability scores." },
      points: [
        { zh: "SIL：在 RflySim 软件在环环境验证闭环。", en: "SIL: validate the loop in the RflySim software-in-the-loop environment." },
        { zh: "安全消融：比较硬规则与纯模型路径的急停行为。", en: "Safety ablation: compare emergency behavior across hard-rule and model-only paths." },
        { zh: "语义评测：以 SFS 观察目标、参数、动作和效果的保真度。", en: "Semantic evaluation: use SFS to inspect fidelity of target, parameter, action, and effect." },
        { zh: "视觉与部署：观察靠近、终端穿越与物理链路迁移。", en: "Visual and deployment checks: observe approach, terminal traversal, and physical-link transfer." },
      ],
      figures: [
        {
          path: "/research/uav/deviation-polar.png",
          alt: { zh: "不同任务条件下的终端偏差极坐标分布", en: "Polar distribution of terminal deviation across task conditions" },
          caption: { zh: "图 4-a｜终端偏差的方向与距离分布，用于观察闭环落点而非生成个人能力评分。", en: "Fig. 4-a | Direction and distance of terminal deviation, used to inspect closed-loop endpoints rather than score personal ability." },
          format: "square",
        },
        {
          path: "/research/uav/deviation-boxplot.png",
          alt: { zh: "不同距离与任务条件下的终端偏差箱线图", en: "Box plots of terminal deviation by distance and task condition" },
          caption: { zh: "图 4-c｜不同距离和任务条件下的偏差分布；网页仅陈列论文证据，不二次推导结论。", en: "Fig. 4-c | Deviation by distance and task condition; the site presents thesis evidence without deriving new claims." },
          format: "wide",
        },
      ],
      sources: [thesisChapter4, silReadme],
    },
    {
      id: "limitations",
      title: { zh: "限制与展望", en: "Limitations & outlook" },
      body: { zh: "当前证据主要来自室内仿真与有限的物理样机联调。开放式长链路指令、网络波动、复杂户外遮挡、传感器噪声和多机协同仍需要更多验证；下一步可以探索边缘侧模型、主动视觉反思和多机任务协调。", en: "Current evidence is mainly from indoor simulation and limited physical-prototype integration. Open-ended long-horizon instructions, network variation, outdoor occlusion, sensor noise, and multi-agent coordination need more validation. Future work can explore edge-side models, active visual reflection, and multi-agent task coordination." },
      sources: [thesisChapter5],
    },
  ],
};

export const archiveProjects: ProjectArchive[] = [
  uavArchive,
  {
    slug: "image-management-system",
    index: "02",
    title: { zh: "图片管理系统", en: "Image Management System" },
    subtitle: { zh: "资料待补档：先保留索引位置，不扩写未经本轮核验的项目细节。", en: "Archive pending: keep the index position without expanding details not re-verified in this iteration." },
    category: { zh: "项目档案 · 待补档", en: "Project archive · pending" },
    period: "Archive pending",
    status: "pending",
    accent: "red",
    summary: { zh: "图片资产链路的项目入口，等待后续补入可公开、可引用的项目档案。", en: "An entry for an image-asset flow, awaiting a public, citable project record." },
    tags: ["Pending archive", "Asset flow"],
    sections: [],
    sources: [{ label: { zh: "后续资料补档", en: "Future archive intake" }, kind: "archive" }],
  },
  {
    slug: "team-blog-platform",
    index: "03",
    title: { zh: "个人 / 团队博客平台", en: "Personal / Team Blog Platform" },
    subtitle: { zh: "一个次级内容系统入口，等待更完整的公开档案。", en: "A secondary content-system entry, awaiting a fuller public archive." },
    category: { zh: "项目档案 · 次级", en: "Project archive · secondary" },
    period: "Secondary archive",
    status: "secondary",
    accent: "ink",
    summary: { zh: "作为内容、权限与发布系统的次级索引保留，不扩写未经资料核验的事实。", en: "Kept as a secondary index for content, permissions, and publishing systems without inventing unverified facts." },
    tags: ["Secondary", "Content system"],
    sections: [],
    sources: [{ label: { zh: "现有项目索引 · 待补档", en: "Existing project index · archive pending" }, kind: "archive" }],
  },
];

export const education = [
  { period: "2022.09—2026.06", school: { zh: "中南大学", en: "Central South University" }, detail: { zh: "计算机科学与技术本科 · 长沙", en: "BSc in Computer Science and Technology · Changsha" } },
];

export const topicIndex: Bilingual[] = [
  { zh: "四层系统架构", en: "Four-layer system architecture" },
  { zh: "混合路由与看门狗", en: "Hybrid routing and watchdog" },
  { zh: "感知与视觉伺服", en: "Perception and visual servoing" },
  { zh: "安全防护边界", en: "Safety boundaries" },
  { zh: "实验方法与限制", en: "Methods and limitations" },
];

export const recommendedQuestions: Bilingual[] = [
  { zh: "为什么要把大模型放在高层决策？", en: "Why place the language model at the high-level decision layer?" },
  { zh: "混合路由如何决定走规则还是模型？", en: "How does hybrid routing choose rules versus the model?" },
  { zh: "双线程看门狗如何处理急停？", en: "How does the dual-thread watchdog handle emergency stop?" },
  { zh: "安全防护的几道边界分别做什么？", en: "What does each safety boundary protect?" },
  { zh: "YOLOE 感知结果如何进入任务上下文？", en: "How do YOLOE observations enter task context?" },
  { zh: "视觉伺服为什么分成对准和逼近？", en: "Why split visual servoing into alignment and approach?" },
  { zh: "这里的 strike 任务具体指什么？", en: "What does the strike task mean here?" },
  { zh: "这个档案的限制和下一步是什么？", en: "What are the archive's limits and next steps?" },
];

export type ChatSource = { title: Bilingual; detail: Bilingual; type: "project" | "archive" | "system" };
export type ChatAnswer = { text: Bilingual; sources: ChatSource[] };

export const chatAnswers: ChatAnswer[] = [
  {
    text: { zh: "大模型更适合处理自然语言任务、目标解释和策略候选，但不应该直接拥有飞行执行权。这个系统把它放在高层决策，再让规则、感知、控制和安全层共同检查动作。这样模型的灵活性保留了，执行边界也不会只靠一次生成结果。", en: "A language model is useful for natural-language missions, target interpretation, and strategy candidates, but it should not own flight execution directly. This system places it at high-level decision, then lets rules, perception, control, and safety jointly check the action. Flexibility remains, while execution does not depend on a single generation." },
    sources: [{ title: { zh: "四层架构", en: "Four-layer architecture" }, detail: { zh: "论文第3章 · 感知 / 决策 / 控制 / 安全", en: "Thesis chapter 3 · perception / decision / control / safety" }, type: "project" }],
  },
  {
    text: { zh: "混合路由先处理确定性：急停和常见动作绕过模型，复合指令先按连接词拆分，再逐条尝试本地模板。只有规则无法解释的复杂语义才进入模型兜底，而两条路径都会经过共同的安全校验。", en: "Hybrid routing handles determinism first: emergency and common actions bypass the model, compound instructions are split by conjunctions, and local templates are tried clause by clause. Only semantics that rules cannot explain reach model fallback, and both paths pass through shared safety checks." },
    sources: [{ title: { zh: "混合路由", en: "Hybrid routing" }, detail: { zh: "论文第3章 · 双层路由决策机制", en: "Thesis chapter 3 · two-path routing mechanism" }, type: "project" }],
  },
  {
    text: { zh: "看门狗输入线程一直监听终端。它识别到急停后，不把指令放进任务队列，而是直接制动、设置中断状态并清空历史任务；工作线程在每个子句之间检查这个状态。核心思想是把安全关键的打断路径从模型和普通任务调度中隔离出来。", en: "The watchdog input thread keeps listening at the terminal. When it detects an emergency stop, it brakes directly, marks the task interrupted, and clears queued work instead of enqueuing the command. The worker checks that state between clauses. The key is isolating safety-critical interruption from model inference and ordinary scheduling." },
    sources: [{ title: { zh: "双线程看门狗", en: "Dual-thread watchdog" }, detail: { zh: "论文第3章 / SIL README", en: "Thesis chapter 3 / SIL README" }, type: "project" }],
  },
  {
    text: { zh: "安全防护不是一张单独的告示，而是包在飞控下发接口外的复查链。动态速度限幅控制动作强度，高度墙和空间围栏限制可飞区域，超时保护负责降级，另有看门狗急停作为输入侧的最终打断。", en: "Safety is not a notice sitting beside the system; it is a re-check chain around flight-command interfaces. Dynamic velocity limits constrain motion, altitude and space guards bound the flight area, timeout protection degrades execution, and the watchdog provides the final input-side interruption." },
    sources: [{ title: { zh: "安全防护", en: "Safety guards" }, detail: { zh: "论文第3章 / README.LLM", en: "Thesis chapter 3 / README.LLM" }, type: "project" }],
  },
  {
    text: { zh: "YOLOE 的检测接口提供目标类别、置信度和包围框位置；观察接口把当前画面里的目标整理成结构化上下文。前一步识别出的目标信息还可以带到下一条子句，帮助处理“找到它然后靠近”这类带指代的任务。", en: "YOLOE's detection interface provides class, confidence, and box position; its observation interface turns visible targets into structured context. Information from the previous clause can carry into the next one, helping with referential missions such as “find it, then approach it.”" },
    sources: [{ title: { zh: "视觉感知", en: "Perception" }, detail: { zh: "论文第3章 · 检测与观察接口", en: "Thesis chapter 3 · detection and observation interfaces" }, type: "project" }],
  },
  {
    text: { zh: "视觉伺服拆成对准和逼近，是为了避免偏航修正与前向运动互相干扰。先让目标回到画面中心，再根据目标尺度与位置推进；接近到视觉不再稳定时，进入终端盲飞并在短暂穿越后急刹悬停。", en: "Visual servoing is split into alignment and approach so yaw correction and forward motion do not fight each other. The target is centered first, then motion advances from scale and position. When vision becomes unstable at close range, terminal blind flight takes over briefly before braking to hover." },
    sources: [{ title: { zh: "视觉伺服与 strike 控制", en: "Visual servoing & strike control" }, detail: { zh: "论文第3章 / 论文视频四阶段", en: "Thesis chapter 3 / four-stage thesis media" }, type: "project" }],
  },
  {
    text: { zh: "这里的 strike 只指软件在环里的模拟目标控制 / 终端穿越任务：先通过视觉伺服靠近和对准，再在目标过近、检测可能失效的阶段做短暂的终端穿越，最后急刹。它是控制算法的实验命名，不描述现实伤害。", en: "Here, strike means a simulated target-control / terminal-traverse task in software-in-the-loop: visual servoing approaches and aligns first, then a short terminal traverse handles the range where detection may fail, followed by braking. It names a control-algorithm experiment, not real-world harm." },
    sources: [{ title: { zh: "终端穿越", en: "Terminal traverse" }, detail: { zh: "论文第3章 / SIL README", en: "Thesis chapter 3 / SIL README" }, type: "project" }],
  },
  {
    text: { zh: "当前页面是前端 Mock：回答来自静态档案和本地样例，逐字效果由浏览器定时器模拟，不连接任何后端服务。档案的下一步是补充可公开引用的项目资料，并继续验证从仿真到真实环境、复杂户外场景和多机协同的迁移边界。", en: "This page is a front-end mock: answers come from static records and local samples, with token streaming simulated by a browser timer. It does not connect to a back-end service. Next steps are to add public, citable project records and further validate transfer from simulation to real environments, complex outdoor scenes, and multi-agent coordination." },
    sources: [{ title: { zh: "限制与展望", en: "Limitations & outlook" }, detail: { zh: "论文第5章 · 仿真到真实与边缘部署", en: "Thesis chapter 5 · simulation-to-real and edge deployment" }, type: "system" }],
  },
];
