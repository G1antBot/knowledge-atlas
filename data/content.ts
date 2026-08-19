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
  { href: "/", label: { zh: "首頁", en: "Home" } },
  { href: "/projects", label: { zh: "檔案", en: "Archive" } },
  { href: "/about", label: { zh: "關於", en: "About" } },
  { href: "/ask", label: { zh: "提問", en: "Ask" } },
] as const;

const thesisChapter3: SourceRef = { label: { zh: "論文第 3 章 · 系統設計與實作", en: "Thesis chapter 3 · System design and implementation" }, kind: "thesis" };
const thesisChapter4: SourceRef = { label: { zh: "論文第 4 章 · 實驗與分析", en: "Thesis chapter 4 · Experiments and analysis" }, kind: "thesis" };
const thesisChapter5: SourceRef = { label: { zh: "論文第 5 章 · 總結與展望", en: "Thesis chapter 5 · Conclusion and outlook" }, kind: "thesis" };
const silReadme: SourceRef = { label: { zh: "SIL README · 系統概述與執行機制", en: "SIL README · System overview and runtime mechanisms" }, kind: "readme" };
const silReadmeLlm: SourceRef = { label: { zh: "SIL README.LLM · 評測與安全說明", en: "SIL README.LLM · Evaluation and safety notes" }, kind: "readme" };

export const mediaAssets: MediaAsset[] = [
  {
    id: "takeoff",
    stage: { zh: "階段 01", en: "Stage 01" },
    title: { zh: "自主起飛", en: "Autonomous takeoff" },
    caption: { zh: "從任務意圖進入飛行狀態。", en: "From mission intent into flight state." },
    alt: { zh: "無人機自主起飛模擬畫面", en: "Simulation frame of an autonomous UAV takeoff" },
    posterPath: "/media/uav/takeoff-poster.webp",
    fallbackPath: "/media/uav/takeoff.gif",
    source: { label: { zh: "論文影片 · 自主起飛", en: "Thesis media · Autonomous takeoff" }, kind: "media" },
  },
  {
    id: "yaw-align",
    stage: { zh: "階段 02", en: "Stage 02" },
    title: { zh: "視覺對準", en: "Visual alignment" },
    caption: { zh: "依據目標在畫面中的位置修正偏航。", en: "Correcting yaw from the target's image position." },
    alt: { zh: "無人機以視覺對準目標的模擬畫面", en: "Simulation frame of visual target alignment" },
    posterPath: "/media/uav/yaw-align-poster.webp",
    fallbackPath: "/media/uav/yaw-align.gif",
    source: { label: { zh: "論文影片 · 視覺對準", en: "Thesis media · Visual alignment" }, kind: "media" },
  },
  {
    id: "approach",
    stage: { zh: "階段 03", en: "Stage 03" },
    title: { zh: "平順逼近", en: "Smooth approach" },
    caption: { zh: "低通濾波、死區與階段狀態共同維持軌跡。", en: "Filtering, dead zones, and staged control keep the trajectory steady." },
    alt: { zh: "無人機平順逼近目標的模擬畫面", en: "Simulation frame of a smooth UAV approach" },
    posterPath: "/media/uav/approach-poster.webp",
    fallbackPath: "/media/uav/approach.gif",
    source: { label: { zh: "論文影片 · 平順逼近", en: "Thesis media · Smooth approach" }, kind: "media" },
  },
  {
    id: "terminal-traverse",
    stage: { zh: "階段 04", en: "Stage 04" },
    title: { zh: "終端穿越", en: "Terminal traverse" },
    caption: { zh: "以模擬目標控制／終端穿越完成 strike 任務。", en: "Completing the strike task as a simulated target-control / terminal-traverse action." },
    alt: { zh: "無人機終端穿越的模擬畫面", en: "Simulation frame of terminal target traversal" },
    posterPath: "/media/uav/terminal-traverse-poster.webp",
    fallbackPath: "/media/uav/terminal-traverse.gif",
    source: { label: { zh: "論文影片 · 終端穿越", en: "Thesis media · Terminal traverse" }, kind: "media" },
  },
];

export const uavArchive: ProjectArchive = {
  slug: "uav-recognition-strike-control",
  index: "01",
  title: { zh: "基於大模型的無人機識別打擊控制演算法", en: "LLM-Based UAV Recognition and Strike Control Algorithm" },
  subtitle: { zh: "把自然語言任務放進可檢查飛行鏈路的研究檔案。", en: "A research archive for placing natural-language missions inside an inspectable flight chain." },
  category: { zh: "論文主檔案 · UAV / AI 控制", en: "Thesis primary archive · UAV / AI control" },
  period: "2025—2026",
  status: "primary",
  accent: "blue",
  summary: { zh: "在這個系統裡，我沒有讓大型語言模型直接接管飛行，而是把它放在高層意圖與策略的位置，再透過規則、視覺伺服、飛控與安全防護，把動作收束在可驗證的邊界內。這裡的 strike 指軟體在環（SIL）模擬場景中的目標控制／終端穿越任務，不描述現實傷害。", en: "The system does not hand flight directly to a language model. It places the model at the intent and strategy layer, then bounds execution through rules, visual servoing, the flight stack, and safety guards. Here, strike means a simulated target-control / terminal-traverse task in a software-in-the-loop scene." },
  tags: ["LLM", "YOLOE", "MAVLink / PX4", "RflySim", "SIL", "Visual servo"],
  sources: [thesisChapter3, thesisChapter4, thesisChapter5, silReadme, silReadmeLlm],
  media: mediaAssets,
  sections: [
    {
      id: "abstract",
      title: { zh: "研究問題與白話說明", en: "In plain language" },
      body: { zh: "人可以用一句話描述複合任務，無人機卻需要明確的動作、目標與安全邊界。我把問題拆成兩個部分：讓語言模型處理帶有模糊性的任務，同時讓急停、限幅、圍籬與逾時等關鍵保護不依賴模型當下的判斷。", en: "A person can describe a compound mission in one sentence, while a UAV needs explicit actions, targets, and safety boundaries. The central question is how a language model can handle ambiguity while emergency stop, limits, fences, and timeouts do not depend on its immediate judgment." },
      points: [
        { zh: "模型負責理解任務並產生候選策略。", en: "The model handles interpretation and candidate strategies." },
        { zh: "本地規則負責確定性動作與快速分流。", en: "Local rules handle deterministic actions and fast routing." },
        { zh: "視覺、控制與安全層負責執行前後的檢查。", en: "Perception, control, and safety layers check the action before and after execution." },
      ],
      sources: [thesisChapter3, silReadme],
    },
    {
      id: "architecture",
      title: { zh: "四層系統架構", en: "Four-layer architecture" },
      body: { zh: "設計上，我把系統分成感知、決策、控制與安全四層。四層之間並非只能向下傳遞：看門狗可以從輸入側中斷任務，安全層則包住所有最後送出的動作，讓每一層都有清楚的責任範圍。", en: "The system is organized into perception, decision, control, and safety layers. It is not only a one-way downward pipeline: the watchdog can short-circuit a task from the input side, while the safety layer wraps every final command." },
      points: [
        { zh: "感知層：目標偵測、狀態讀取與姿態橋接。", en: "Perception: object detection, state reading, and pose bridging." },
        { zh: "決策層：意圖攔截、子句拆分、路由與模型備援。", en: "Decision: intent interception, clause splitting, routing, and model fallback." },
        { zh: "控制層：分階段逼近、原地對準、終端穿越與固定位移。", en: "Control: staged approach, in-place alignment, terminal traverse, and fixed displacement." },
        { zh: "安全層：速度限幅、高度牆、空間圍籬與逾時降級。", en: "Safety: velocity limits, altitude wall, space fence, and timeout fallback." },
      ],
      figures: [{
        path: "/research/uav/system-architecture.png",
        alt: { zh: "無人機語言控制系統總體架構圖", en: "Overall architecture of the language-controlled UAV system" },
        caption: { zh: "圖 3-1｜系統總架構：感知、決策、控制與安全防護構成閉環。", en: "Fig. 3-1 | System architecture: perception, decision, control, and safety form a closed loop." },
        format: "wide",
      }],
      sources: [thesisChapter3, silReadme],
    },
    {
      id: "hybrid-routing",
      title: { zh: "混合路由", en: "Hybrid routing" },
      body: { zh: "我沒有把所有問題都交給模型，而是先判斷哪些動作已經足夠明確。急停與常見位移等確定性指令走本地硬規則；連接詞會把複合句拆成子句；只有規則無法解釋的複雜語義才進入模型備援。兩條路徑最後都要通過同一套安全檢查。", en: "Routing is not about sending every problem to the model. It first asks which actions are already explicit. Emergency stop and common displacement use local hard rules; conjunctions split compound instructions into clauses; only semantics that rules cannot explain reach model fallback. Both paths share the final safety checks." },
      points: [
        { zh: "急停／退出：最高優先級，繞過任務佇列。", en: "Emergency stop / exit: highest priority, bypassing the task queue." },
        { zh: "條件、位移、轉向、搜尋、靠近、朝向與返航：本地範本。", en: "Conditions, displacement, turns, search, approach, aim, and return: local templates." },
        { zh: "複雜或未命中的語義：由模型產生候選動作，再進入受限執行邊界。", en: "Complex or unmatched semantics: model-generated candidate actions enter a constrained execution boundary." },
      ],
      sources: [thesisChapter3, silReadmeLlm],
    },
    {
      id: "watchdog",
      title: { zh: "雙執行緒看門狗", en: "Dual-thread watchdog" },
      body: { zh: "我讓看門狗輸入執行緒持續監聽終端，急停不會先進入工作佇列。偵測到急停後，它直接送出零速度煞停、設定中斷狀態並清空既有任務；工作執行緒則在每個子句之間檢查狀態，避免後續動作繼續執行。", en: "The watchdog input thread keeps listening at the terminal and never queues an emergency stop. It sends a zero-velocity brake, marks the task interrupted, and clears queued work; the worker checks that state between clauses so later actions do not continue." },
      points: [
        { zh: "輸入監聽與任務執行解耦。", en: "Input listening is decoupled from task execution." },
        { zh: "急停路徑不依賴模型回應或任務佇列。", en: "The emergency path does not depend on model response or queue order." },
        { zh: "工作執行緒擁有可觀察的中斷邊界。", en: "The worker has an explicit, observable interruption boundary." },
      ],
      sources: [thesisChapter3, silReadme, silReadmeLlm],
    },
    {
      id: "perception",
      title: { zh: "視覺感知", en: "Perception" },
      body: { zh: "視覺前端使用 YOLOE 提供目標偵測與觀察介面：前者回傳類別、信心度與邊界框位置，後者把目前視野中的目標整理成結構化狀態，供路由與策略理解。在模擬環境中，畫面來自 RflySim／UE4；執行模式也支援相機與動態捕捉鏈路。", en: "The visual front end uses YOLOE for detection and observation interfaces. Detection returns class, confidence, and box position; observation turns visible targets into structured state for routing and strategy. In simulation, frames come from RflySim / UE4, while camera and motion-capture paths are supported by the runtime modes." },
      points: [
        { zh: "detect：回答畫面裡有什麼。", en: "detect: what is in the frame?" },
        { zh: "look：把觀察結果放進任務上下文。", en: "look: place observations into task context." },
        { zh: "狀態回饋：把前一步的目標資訊帶入下一個子句。", en: "State feedback: carry target information into the next clause." },
      ],
      figures: [
        {
          path: "/research/uav/simulation-environment.png",
          alt: { zh: "RflySim 軟體在環實驗環境", en: "RflySim software-in-the-loop environment" },
          caption: { zh: "圖 3-2｜軟體在環場景與視覺目標配置。", en: "Fig. 3-2 | Software-in-the-loop scene and visual targets." },
          format: "wide",
        },
        {
          path: "/research/uav/detection-preview.png",
          alt: { zh: "YOLOE 多目標偵測預覽", en: "YOLOE multi-object detection preview" },
          caption: { zh: "圖 3-3｜偵測結果以類別、信心度與邊界框進入任務上下文。", en: "Fig. 3-3 | Class, confidence, and bounding boxes enter the task context." },
          format: "square",
        },
      ],
      sources: [thesisChapter3, silReadme],
    },
    {
      id: "servo-strike",
      title: { zh: "視覺伺服與 strike 控制", en: "Visual servoing & strike control" },
      body: { zh: "我先讓視覺伺服進入 YAW_ALIGN，把目標帶回畫面中心，再進入 APPROACH，依據目標位置與尺度調整前進、垂向與偏航。當目標靠近到視覺難以穩定觀察時，系統切換到終端盲飛：依估算的剩餘距離與速度進行短暫衝刺，接著急煞並懸停。這裡的 strike 指模擬目標控制／終端穿越任務，不描述現實傷害。", en: "Visual servoing begins with YAW_ALIGN, bringing the target toward the image center, then moves to APPROACH, adjusting forward, vertical, and yaw motion from target position and scale. When the target becomes too close for stable visual tracking, the system switches to terminal blind flight: a short burst based on estimated distance and velocity, followed by braking and hover. Here, strike is a simulated target-control / terminal-traverse task, not a description of real-world harm." },
      points: [
        { zh: "低通濾波與死區抑制畫面抖動。", en: "Low-pass filtering and dead zones suppress visual jitter." },
        { zh: "短暫遺失目標時保留末態趨勢，避免立即失敗。", en: "A brief target loss preserves the last motion trend instead of failing immediately." },
        { zh: "終端階段透過模擬穿越驗證閉環銜接。", en: "The terminal stage verifies the handoff through simulated traversal." },
      ],
      figures: [
        {
          path: "/research/uav/servo-align.png",
          alt: { zh: "視覺伺服對準階段", en: "Visual-servo alignment stage" },
          caption: { zh: "A｜對準：目標向畫面中心收斂。", en: "A | Align: the target converges toward the image center." },
          format: "sequence",
        },
        {
          path: "/research/uav/servo-approach.png",
          alt: { zh: "視覺伺服逼近階段", en: "Visual-servo approach stage" },
          caption: { zh: "B｜逼近：依據目標位置與尺度持續修正。", en: "B | Approach: corrections follow target position and scale." },
          format: "sequence",
        },
        {
          path: "/research/uav/servo-terminal.png",
          alt: { zh: "終端穿越階段", en: "Terminal traverse stage" },
          caption: { zh: "C｜終端：短暫穿越後煞停懸停。", en: "C | Terminal: a short traverse followed by braking and hover." },
          format: "sequence",
        },
      ],
      sources: [thesisChapter3, silReadmeLlm],
    },
    {
      id: "safety",
      title: { zh: "安全防護", en: "Safety guards" },
      body: { zh: "安全層以非侵入式方式包住飛控指令介面。它不預設上游永遠正確，而是重新檢查每個動作的速度、空間、高度與時間邊界；遇到越界或逾時，動作就會被拒絕，或降級為懸停。", en: "The safety layer wraps flight-command interfaces non-intrusively. It does not assume upstream correctness; every action is checked again against velocity, space, altitude, and time boundaries. A violation or timeout is rejected or downgraded to hover." },
      points: [
        { zh: "動態速度限幅：依據搜尋、靠近與 strike 階段收緊動作範圍。", en: "Dynamic velocity limits: tighten the action range by search, approach, and strike stage." },
        { zh: "高度牆：拒絕貼地或超出上限的高風險指令。", en: "Altitude wall: reject near-ground or over-ceiling risk." },
        { zh: "空間圍籬：攔截可能離開起飛點允許區域的移動。", en: "Space fence: intercept motion that would leave the allowed area around home." },
        { zh: "逾時降級：任務逾時後停止動作並進入懸停。", en: "Timeout fallback: stop the action and hover when a task expires." },
      ],
      sources: [thesisChapter3, thesisChapter5, silReadmeLlm],
    },
    {
      id: "methods",
      title: { zh: "實驗方法", en: "Experiment methods" },
      body: { zh: "我把論文中的驗證拆成安全性消融、語義理解、視覺靠近、終端穿越與實體樣機聯調幾個方向。網站保留方法、證據類型與限制；實驗數值仍放在原本的論文脈絡裡，不抽成首頁指標。", en: "The thesis validates the system through safety ablation, semantic understanding, visual approach, terminal traversal, and physical-prototype integration. The site keeps methods, evidence types, and limits together, while experiment values remain in their original thesis context instead of becoming homepage metrics." },
      points: [
        { zh: "SIL：在 RflySim 軟體在環環境驗證閉環。", en: "SIL: validate the loop in the RflySim software-in-the-loop environment." },
        { zh: "安全消融：比較硬規則與純模型路徑的急停行為。", en: "Safety ablation: compare emergency behavior across hard-rule and model-only paths." },
        { zh: "語義評測：以 SFS 觀察目標、參數、動作與效果的保真度。", en: "Semantic evaluation: use SFS to inspect fidelity of target, parameter, action, and effect." },
        { zh: "視覺與部署：觀察靠近、終端穿越與實體鏈路遷移。", en: "Visual and deployment checks: observe approach, terminal traversal, and physical-link transfer." },
      ],
      figures: [
        {
          path: "/research/uav/deviation-polar.png",
          alt: { zh: "不同任務條件下的終端偏差極座標分布", en: "Polar distribution of terminal deviation across task conditions" },
          caption: { zh: "圖 4-a｜終端偏差的方向與距離分布，用來觀察閉環落點。", en: "Fig. 4-a | Direction and distance of terminal deviation, used to inspect closed-loop endpoints." },
          format: "square",
        },
        {
          path: "/research/uav/deviation-boxplot.png",
          alt: { zh: "不同距離與任務條件下的終端偏差箱型圖", en: "Box plots of terminal deviation by distance and task condition" },
          caption: { zh: "圖 4-c｜不同距離與任務條件下的偏差分布；網頁只陳列論文證據，不另行推導結論。", en: "Fig. 4-c | Deviation by distance and task condition; the site presents thesis evidence without deriving new claims." },
          format: "wide",
        },
      ],
      sources: [thesisChapter4, silReadme],
    },
    {
      id: "limitations",
      title: { zh: "目前限制與後續驗證", en: "Limitations & outlook" },
      body: { zh: "目前能確認的證據主要來自室內模擬與有限的實體樣機聯調。開放式長鏈路指令、網路波動、複雜戶外遮蔽、感測器雜訊與多機協同仍需要更多驗證；後續可以再檢視邊緣側模型、主動視覺反思與多機任務協調。", en: "Current evidence is mainly from indoor simulation and limited physical-prototype integration. Open-ended long-horizon instructions, network variation, outdoor occlusion, sensor noise, and multi-agent coordination need more validation. Future work can explore edge-side models, active visual reflection, and multi-agent task coordination." },
      sources: [thesisChapter5],
    },
  ],
};

export const archiveProjects: ProjectArchive[] = [
  uavArchive,
  {
    slug: "image-management-system",
    index: "02",
    title: { zh: "圖片管理系統", en: "Image Management System" },
    subtitle: { zh: "資料待補檔：先保留索引位置，不擴寫本輪尚未核驗的專案細節。", en: "Archive pending: keep the index position without expanding details not re-verified in this iteration." },
    category: { zh: "專案檔案 · 待補檔", en: "Project archive · pending" },
    period: "Archive pending",
    status: "pending",
    accent: "red",
    summary: { zh: "圖片資產流程的專案入口，等待後續補入可公開、可引用的專案檔案。", en: "An entry for an image-asset flow, awaiting a public, citable project record." },
    tags: ["Pending archive", "Asset flow"],
    sections: [],
    sources: [{ label: { zh: "後續資料補檔", en: "Future archive intake" }, kind: "archive" }],
  },
  {
    slug: "team-blog-platform",
    index: "03",
    title: { zh: "個人／團隊部落格平台", en: "Personal / Team Blog Platform" },
    subtitle: { zh: "次級內容系統入口，等待更完整的公開檔案。", en: "A secondary content-system entry, awaiting a fuller public archive." },
    category: { zh: "專案檔案 · 次級", en: "Project archive · secondary" },
    period: "Secondary archive",
    status: "secondary",
    accent: "ink",
    summary: { zh: "保留作為內容、權限與發布系統的次級索引，不擴寫尚未經資料核驗的事實。", en: "Kept as a secondary index for content, permissions, and publishing systems without inventing unverified facts." },
    tags: ["Secondary", "Content system"],
    sections: [],
    sources: [{ label: { zh: "現有專案索引 · 待補檔", en: "Existing project index · archive pending" }, kind: "archive" }],
  },
];

export const education = [
  { period: "2022.09—2026.06", school: { zh: "中南大學", en: "Central South University" }, detail: { zh: "計算機科學與技術學士 · 長沙", en: "BSc in Computer Science and Technology · Changsha" } },
];

export const topicIndex: Bilingual[] = [
  { zh: "四層系統架構", en: "Four-layer system architecture" },
  { zh: "混合路由與看門狗", en: "Hybrid routing and watchdog" },
  { zh: "感知與視覺伺服", en: "Perception and visual servoing" },
  { zh: "安全防護邊界", en: "Safety boundaries" },
  { zh: "實驗方法與限制", en: "Methods and limitations" },
];

export const recommendedQuestions: Bilingual[] = [
  { zh: "為什麼要把大型語言模型放在高層決策？", en: "Why place the language model at the high-level decision layer?" },
  { zh: "混合路由如何決定走規則或模型？", en: "How does hybrid routing choose rules versus the model?" },
  { zh: "雙執行緒看門狗如何處理急停？", en: "How does the dual-thread watchdog handle emergency stop?" },
  { zh: "安全防護的幾道邊界各自做什麼？", en: "What does each safety boundary protect?" },
  { zh: "YOLOE 的感知結果如何進入任務上下文？", en: "How do YOLOE observations enter task context?" },
  { zh: "視覺伺服為什麼分成對準與逼近？", en: "Why split visual servoing into alignment and approach?" },
  { zh: "這裡的 strike 任務具體指什麼？", en: "What does the strike task mean here?" },
  { zh: "這份檔案的限制與下一步是什麼？", en: "What are the archive's limits and next steps?" },
];

export type ChatSource = { title: Bilingual; detail: Bilingual; type: "project" | "archive" | "system" };
export type ChatAnswer = { text: Bilingual; sources: ChatSource[] };

export const chatAnswers: ChatAnswer[] = [
  {
    text: { zh: "大型語言模型適合處理自然語言任務、目標解釋與策略候選，但不宜直接擁有飛行執行權。我把它放在高層決策，再讓規則、感知、控制與安全層一起檢查動作；模型保有彈性，執行邊界也不會只靠一次生成結果。", en: "A language model is useful for natural-language missions, target interpretation, and strategy candidates, but it should not own flight execution directly. This system places it at high-level decision, then lets rules, perception, control, and safety jointly check the action. Flexibility remains, while execution does not depend on a single generation." },
    sources: [{ title: { zh: "四層系統架構", en: "Four-layer architecture" }, detail: { zh: "論文第 3 章 · 感知／決策／控制／安全", en: "Thesis chapter 3 · perception / decision / control / safety" }, type: "project" }],
  },
  {
    text: { zh: "混合路由先處理確定性：急停與常見動作繞過模型，複合指令先依連接詞拆分，再逐條嘗試本地範本。只有規則無法解釋的複雜語義才進入模型備援，兩條路徑最後都會通過共同的安全檢查。", en: "Hybrid routing handles determinism first: emergency and common actions bypass the model, compound instructions are split by conjunctions, and local templates are tried clause by clause. Only semantics that rules cannot explain reach model fallback, and both paths pass through shared safety checks." },
    sources: [{ title: { zh: "混合路由", en: "Hybrid routing" }, detail: { zh: "論文第 3 章 · 雙層路由決策機制", en: "Thesis chapter 3 · two-path routing mechanism" }, type: "project" }],
  },
  {
    text: { zh: "看門狗輸入執行緒持續監聽終端。偵測到急停後，指令不會進入任務佇列，而是直接煞停、設定中斷狀態並清空既有任務；工作執行緒在每個子句之間檢查這個狀態，讓安全關鍵的打斷路徑與模型推論、一般任務排程分開。", en: "The watchdog input thread keeps listening at the terminal. When it detects an emergency stop, it brakes directly, marks the task interrupted, and clears queued work instead of enqueuing the command. The worker checks that state between clauses. The key is isolating safety-critical interruption from model inference and ordinary scheduling." },
    sources: [{ title: { zh: "雙執行緒看門狗", en: "Dual-thread watchdog" }, detail: { zh: "論文第 3 章／SIL README", en: "Thesis chapter 3 / SIL README" }, type: "project" }],
  },
  {
    text: { zh: "安全防護是一條包在飛控指令介面外的複查鏈。動態速度限幅控制動作強度，高度牆與空間圍籬限制可飛區域，逾時保護負責降級；看門狗急停則提供輸入側的最後打斷。", en: "Safety is not a notice sitting beside the system; it is a re-check chain around flight-command interfaces. Dynamic velocity limits constrain motion, altitude and space guards bound the flight area, timeout protection degrades execution, and the watchdog provides the final input-side interruption." },
    sources: [{ title: { zh: "安全防護", en: "Safety guards" }, detail: { zh: "論文第 3 章／README.LLM", en: "Thesis chapter 3 / README.LLM" }, type: "project" }],
  },
  {
    text: { zh: "YOLOE 的偵測介面提供目標類別、信心度與邊界框位置；觀察介面把目前畫面裡的目標整理成結構化上下文。前一步辨識出的目標資訊也可以帶到下一個子句，協助處理「找到它，然後靠近」這類帶有指代的任務。", en: "YOLOE's detection interface provides class, confidence, and box position; its observation interface turns visible targets into structured context. Information from the previous clause can carry into the next one, helping with referential missions such as “find it, then approach it.”" },
    sources: [{ title: { zh: "視覺感知", en: "Perception" }, detail: { zh: "論文第 3 章 · 偵測與觀察介面", en: "Thesis chapter 3 · detection and observation interfaces" }, type: "project" }],
  },
  {
    text: { zh: "視覺伺服分成對準與逼近，讓偏航修正和前向運動各自處理。先把目標帶回畫面中心，再依據目標尺度與位置推進；接近到視覺不再穩定時，進入終端盲飛，短暫穿越後急煞懸停。", en: "Visual servoing is split into alignment and approach so yaw correction and forward motion do not fight each other. The target is centered first, then motion advances from scale and position. When vision becomes unstable at close range, terminal blind flight takes over briefly before braking to hover." },
    sources: [{ title: { zh: "視覺伺服與 strike 控制", en: "Visual servoing & strike control" }, detail: { zh: "論文第 3 章／論文影片四階段", en: "Thesis chapter 3 / four-stage thesis media" }, type: "project" }],
  },
  {
    text: { zh: "這裡的 strike 只指軟體在環裡的模擬目標控制／終端穿越任務：先透過視覺伺服靠近並對準，再於目標過近、偵測可能失效的階段進行短暫終端穿越，最後急煞。這是控制演算法的實驗命名，不描述現實傷害。", en: "Here, strike means a simulated target-control / terminal-traverse task in software-in-the-loop: visual servoing approaches and aligns first, then a short terminal traverse handles the range where detection may fail, followed by braking. It names a control-algorithm experiment, not real-world harm." },
    sources: [{ title: { zh: "終端穿越", en: "Terminal traverse" }, detail: { zh: "論文第 3 章／SIL README", en: "Thesis chapter 3 / SIL README" }, type: "project" }],
  },
  {
    text: { zh: "目前頁面是前端 Mock：回答來自靜態檔案與本地範例，逐字輸出由瀏覽器計時器模擬，不連線到任何後端服務。檔案後續會補入可公開引用的專案資料，並繼續驗證從模擬到真實環境、複雜戶外場景與多機協同的遷移邊界。", en: "This page is a front-end mock: answers come from static records and local samples, with token streaming simulated by a browser timer. It does not connect to a back-end service. Next steps are to add public, citable project records and further validate transfer from simulation to real environments, complex outdoor scenes, and multi-agent coordination." },
    sources: [{ title: { zh: "目前限制與後續驗證", en: "Limitations & outlook" }, detail: { zh: "論文第 5 章 · 從模擬到真實與邊緣部署", en: "Thesis chapter 5 · simulation-to-real and edge deployment" }, type: "system" }],
  },
];
