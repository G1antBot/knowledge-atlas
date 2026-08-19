export type Locale = "zh" | "en";

export type Bilingual = { zh: string; en: string };

export type SourceRef = {
  label: Bilingual;
  kind: "thesis" | "readme" | "media" | "archive" | "repository";
  note?: Bilingual;
  href?: string;
};

export type CapabilityStatus = "implemented" | "planned";

export type ArchiveCapability = {
  title: Bilingual;
  detail: Bilingual;
  status: CapabilityStatus;
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
  format?: "wide" | "square" | "sequence" | "portrait";
};

export type ArchiveSection = {
  id: string;
  title: Bilingual;
  body: Bilingual;
  points?: Bilingual[];
  capabilities?: ArchiveCapability[];
  figures?: ArchiveFigure[];
  sources: SourceRef[];
};

export type CurriculumGroup = {
  index: string;
  title: Bilingual;
  summary: Bilingual;
  courses: Bilingual[];
  source: SourceRef;
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
const imageSystemDeck: SourceRef = { label: { zh: "圖片管理系統答辯簡報 · 系統設計與實作", en: "Image management system presentation · Design and implementation" }, kind: "archive" };
const imageSystemResume: SourceRef = { label: { zh: "個人履歷 · 團隊角色與主要工作", en: "Personal resume · Team role and primary contributions" }, kind: "archive" };
const knowledgeAtlasRepository: SourceRef = {
  label: { zh: "Knowledge Atlas · 公開原始碼倉庫", en: "Knowledge Atlas · Public source repository" },
  kind: "repository",
  note: { zh: "Next.js 前端、結構化檔案與本地檢索實作", en: "Next.js front end, structured archives, and local retrieval" },
  href: "https://github.com/G1antBot/knowledge-atlas",
};
const knowledgeAtlasReadme: SourceRef = {
  label: { zh: "Knowledge Atlas README · 功能與邊界", en: "Knowledge Atlas README · Features and boundaries" },
  kind: "readme",
  note: { zh: "公開功能、技術結構與維護原則", en: "Public features, technical structure, and maintenance rules" },
  href: "https://github.com/G1antBot/knowledge-atlas#readme",
};
const curriculumPlan: SourceRef = {
  label: { zh: "計算機科學與技術專業培養方案 · 課程清單", en: "Computer Science and Technology curriculum · Course list" },
  kind: "archive",
  note: { zh: "用於說明本科培養範圍，不代表成績或能力排名", en: "Used to describe undergraduate curriculum coverage, not grades or capability ranking" },
};

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
    subtitle: { zh: "四人團隊完成的跨端圖片管理系統，這份檔案只記錄我負責的後端與工程化工作。", en: "A cross-platform image system built by a four-person team, documented here through my backend and delivery responsibilities." },
    category: { zh: "團隊專案 · Web／移動端／服務端", en: "Team project · Web / mobile / server" },
    period: "2024.11—2025.02",
    status: "secondary",
    accent: "red",
    summary: { zh: "這個課程專案由四人協作完成，涵蓋 PC 端、Android 移動端、Spring Boot 服務端、MySQL 與阿里雲 OSS。我主要負責掃碼與持久化登入、物件儲存與敏感資訊過濾、GitLab 協作流程，以及 Docker 容器化部署。", en: "This four-person course project spans a PC client, Android client, Spring Boot services, MySQL, and Alibaba Cloud OSS. My work focused on QR and persistent login, object storage and sensitive-content filtering, GitLab collaboration, and Docker deployment." },
    tags: ["4-person team", "Spring Boot", "Vue 3", "MySQL", "Alibaba Cloud OSS", "Docker"],
    sections: [
      {
        id: "plain-summary",
        title: { zh: "這個系統處理什麼", en: "What the system handles" },
        body: { zh: "系統把登入、圖片、相簿與檔案儲存整理成一條跨端流程。使用者可以從 PC 或 Android 端登入，管理圖片與相簿；服務端負責身分驗證、資料操作與檔案存取，圖片本體存入阿里雲 OSS，資料庫保留使用者、圖片、相簿與檔案位置之間的關係。", en: "The system connects authentication, images, albums, and file storage across PC and Android clients. The server handles identity, data operations, and file access; image objects live in Alibaba Cloud OSS while the database keeps user, image, album, and file-location relationships." },
        points: [
          { zh: "專案由四人共同完成；本頁不把團隊交付全部歸為個人成果。", en: "The project was completed by four people; this page does not present the entire team delivery as individual work." },
          { zh: "我的角色是後端開發，並負責部分協作與部署工作。", en: "My role was backend development, with additional collaboration and deployment responsibilities." },
        ],
        figures: [
          {
            path: "/research/image-management/mobile-library.webp",
            alt: { zh: "Android 端圖片列表與標籤模式", en: "Android image list and tag mode" },
            caption: { zh: "A｜Android 圖片列表（團隊交付介面）：記錄搜尋、標籤模式與分頁。", en: "A | Android image list (team-delivered interface): search, tag mode, and pagination." },
            format: "portrait",
          },
          {
            path: "/research/image-management/crop-editor.webp",
            alt: { zh: "Android 端圖片裁剪介面", en: "Android image cropping interface" },
            caption: { zh: "B｜Android 圖片裁剪（團隊交付介面）：選擇常用比例後提交裁剪結果。", en: "B | Android image cropper (team-delivered interface): choose a common aspect ratio and submit the crop." },
            format: "portrait",
          },
        ],
        sources: [imageSystemDeck, imageSystemResume],
      },
      {
        id: "system-structure",
        title: { zh: "跨端系統結構", en: "Cross-platform system structure" },
        body: { zh: "PC 端使用 Vue 3、Element Plus、Vuex 與 Axios；Android 端提供登入、相簿、圖片編輯與掃碼操作；Spring Boot 服務端按照 Controller、Service、Mapper 等層次組織業務，資料存入 MySQL，圖片物件存入阿里雲 OSS。", en: "The PC client uses Vue 3, Element Plus, Vuex, and Axios. Android provides login, albums, image editing, and QR scanning. Spring Boot organizes server logic through Controller, Service, and Mapper layers, with MySQL for records and Alibaba Cloud OSS for image objects." },
        figures: [
          {
            path: "/research/image-management/system-architecture.svg",
            alt: { zh: "圖片管理系統跨端架構圖", en: "Cross-platform architecture diagram for the image management system" },
            caption: { zh: "依據答辯簡報重新繪製；圖中只保留已核驗的端、服務與儲存關係。", en: "Redrawn from the presentation, retaining only verified client, service, and storage relationships." },
            format: "wide",
          },
        ],
        sources: [imageSystemDeck],
      },
      {
        id: "authentication",
        title: { zh: "掃碼登入與持久化鑑權", en: "QR login and persistent authentication" },
        body: { zh: "我實作了掃碼登入與狀態輪詢。Web 端取得隨機字串並產生二維碼；移動端掃描後提交字串與使用者資訊；服務端完成配對與身分檢查，再把登入結果交回 Web 端。登入狀態同時支援 7 天持久化鑑權。", en: "I implemented QR login and status polling. The web client requests a random string and presents it as a QR code; the mobile client submits the scanned string with user information; the server matches and validates the request before returning the login result to the web client. Authentication also supports a seven-day persistent session." },
        figures: [
          {
            path: "/research/image-management/qr-login-flow.svg",
            alt: { zh: "Web、移動端與服務端之間的掃碼登入流程", en: "QR login flow between web, mobile, and server" },
            caption: { zh: "流程圖由專案簡報與履歷中的職責描述整理，不展示金鑰、Token 值或內部位址。", en: "Reconstructed from the project presentation and role record without exposing keys, token values, or internal addresses." },
            format: "wide",
          },
        ],
        sources: [imageSystemDeck, imageSystemResume],
      },
      {
        id: "storage-review",
        title: { zh: "物件儲存與內容審核", en: "Object storage and content review" },
        body: { zh: "我接入阿里雲 OSS，處理大檔案分片上傳與靜態資源存取。資料庫不直接保存圖片內容，而是保存對應位置與業務資料；服務端另外加入圖片與文字的敏感資訊過濾與審核流程。", en: "I integrated Alibaba Cloud OSS for multipart uploads and static-resource access. The database stores locations and business records rather than image bodies, while the server adds sensitive-content filtering and review for images and text." },
        figures: [
          {
            path: "/research/image-management/batch-upload.webp",
            alt: { zh: "Android 端批次上傳進度畫面", en: "Android batch-upload progress screen" },
            caption: { zh: "上傳進度回饋（團隊交付介面）：這個畫面對應我負責的服務端檔案接收與 OSS 儲存流程。", en: "Upload progress (team-delivered interface): this screen corresponds to the server-side file intake and OSS storage flow I implemented." },
            format: "portrait",
          },
        ],
        sources: [imageSystemDeck, imageSystemResume],
      },
      {
        id: "collaboration-deployment",
        title: { zh: "協作與部署", en: "Collaboration and deployment" },
        body: { zh: "四人團隊使用 GitLab 管理程式碼，依照 Git Flow 組織分支與並行迭代。我編寫 Dockerfile，把應用與執行環境封裝為映像，使用 Docker 降低不同環境之間的設定差異。", en: "The four-person team used GitLab and a Git Flow branch model for parallel iteration. I wrote the Dockerfile and packaged the application with its runtime into an image, reducing configuration differences across environments." },
        sources: [imageSystemResume],
      },
      {
        id: "limits",
        title: { zh: "檔案邊界", en: "Archive boundaries" },
        body: { zh: "現有證據來自課程答辯簡報與個人履歷。它可以說明系統結構、功能與個人分工，但沒有提供正式上線後的使用量、可用性或效能數據；因此本頁不補寫未經驗證的營運結果。", en: "The current evidence comes from the course presentation and personal resume. It supports the system structure, functions, and individual role, but does not provide production usage, availability, or performance data, so this page does not invent operational outcomes." },
        sources: [imageSystemDeck, imageSystemResume],
      },
    ],
    sources: [imageSystemDeck, imageSystemResume],
  },
  {
    slug: "knowledge-atlas",
    index: "03",
    title: { zh: "Knowledge Atlas", en: "Knowledge Atlas" },
    subtitle: { zh: "把專案、論文、實驗與個人背景整理成可以持續閱讀的知識入口。", en: "A durable knowledge entry point for projects, papers, experiments, and personal context." },
    category: { zh: "獨立專案 · 個人知識系統", en: "Independent project · Personal knowledge system" },
    period: "2026—Present",
    status: "secondary",
    accent: "ink",
    summary: { zh: "我把這個網站當成一個持續整理資料的介面。首頁先呈現專案檔案，詳情頁再把正文、圖表、來源與相關章節放回同一條閱讀路徑；本地檢索負責在公開內容之間建立入口，後續的伺服器端檢索與模型回答則保留在產品路線圖中。", en: "I use this site as an interface for continuously organizing material. Project archives come first, while detail pages keep writing, figures, sources, and related sections in one reading path. Local retrieval creates entry points across public content; server-side retrieval and model-generated answers remain on the product roadmap." },
    tags: ["Next.js 16", "React 19", "TypeScript", "Orama", "cmdk", "Motion"],
    sections: [
      {
        id: "purpose",
        title: { zh: "持續使用的個人網站", en: "A personal site designed for continued use" },
        body: { zh: "這個網站不以履歷摘要或能力評分作為首頁，而是讓專案檔案成為主要入口。訪客可以先讀一份專案，再沿著章節、來源與相關主題繼續查找；個人背景留在獨立頁面，與專案證據分開。", en: "The homepage does not begin with a resume summary or capability scores. Project archives are the main entry points. A visitor can start with one project, then continue through sections, sources, and related topics, while personal context remains on a separate page." },
        points: [
          { zh: "首頁只保留辨識檔案所需的名稱、摘要、狀態與主題。", en: "The homepage keeps only the names, summaries, states, and topics needed to identify each archive." },
          { zh: "圖表、截圖和媒體回到它們所屬的專案章節。", en: "Figures, screenshots, and media stay inside the project sections they support." },
        ],
        sources: [knowledgeAtlasRepository, knowledgeAtlasReadme],
      },
      {
        id: "information-architecture",
        title: { zh: "檔案與章節結構", en: "Archive and section structure" },
        body: { zh: "每個專案由固定識別資訊、章節、來源、圖例與媒體組成。專案目錄在捲動時保留目前章節，來源回鏈則說明一份材料支援了哪些正文，讓內容可以從專案、章節或來源三個方向進入。", en: "Each project contains stable identity fields, sections, sources, figures, and media. The directory keeps the current section visible during reading, while source backlinks show which parts of the text each source supports. Content can be entered through projects, sections, or sources." },
        figures: [{
          path: "/research/knowledge-atlas/archive-directory.png",
          alt: { zh: "檔案詳情頁的瑞士編輯風章節目錄", en: "Swiss editorial section directory on an archive page" },
          caption: { zh: "章節目錄、閱讀進度與正文共用同一套穩定錨點。", en: "The directory, reading progress, and article body share the same stable anchors." },
          format: "wide",
        }],
        sources: [knowledgeAtlasRepository, knowledgeAtlasReadme],
      },
      {
        id: "content-model",
        title: { zh: "結構化內容與來源", en: "Structured content and sources" },
        body: { zh: "公開內容集中為 TypeScript 結構化資料。專案、章節、圖片和來源各自保留穩定欄位，中英文內容共用同一個節點；頁面只讀取已經整理進公開資料模型的內容，不直接讀取本機論文、簡報或實驗目錄。", en: "Public content is kept as structured TypeScript data. Projects, sections, figures, and sources retain stable fields, while Chinese and English share the same node. Pages read only material deliberately added to the public model, never private thesis, presentation, or experiment folders directly." },
        points: [
          { zh: "來源標籤跟隨章節，不以模糊的專案描述代替引用。", en: "Source labels stay with sections instead of being replaced by vague project descriptions." },
          { zh: "公開派生資源與原始材料分開保存。", en: "Public derivative assets remain separate from source material." },
          { zh: "限制與尚未核驗的部分同樣保留在檔案中。", en: "Limits and unverified areas remain visible inside each archive." },
        ],
        sources: [knowledgeAtlasRepository, knowledgeAtlasReadme],
      },
      {
        id: "retrieval",
        title: { zh: "本地檢索與錨點導航", en: "Local retrieval and anchor navigation" },
        body: { zh: "Orama 在瀏覽器中索引專案、章節、標籤與來源，cmdk 提供鍵盤操作的搜尋面板。搜尋結果直接指向專案或具體章節，不需要先經過另一層分類頁；中文查找另外建立字元片段，補足英文分詞器對中文內容的限制。", en: "Orama indexes projects, sections, tags, and sources in the browser, while cmdk provides a keyboard-driven search panel. Results point directly to projects or section anchors. Character fragments supplement the English tokenizer when matching Chinese content." },
        figures: [{
          path: "/research/knowledge-atlas/archive-search.png",
          alt: { zh: "Knowledge Atlas 檔案搜尋面板", en: "Knowledge Atlas archive search panel" },
          caption: { zh: "搜尋結果保留檔案名稱、章節與來源，並直接跳轉到對應錨點。", en: "Results retain the archive, section, and source context and link directly to the matching anchor." },
          format: "wide",
        }],
        sources: [knowledgeAtlasRepository, knowledgeAtlasReadme],
      },
      {
        id: "visual-system",
        title: { zh: "瑞士編輯風介面", en: "Swiss editorial interface" },
        body: { zh: "介面使用米白紙張色、黑色結構線、藍色索引與少量紅色狀態訊號。大字標題、非對稱網格和等寬標籤負責建立層級；動效集中在檔案入場、閱讀進度與狀態切換，並尊重低動態偏好。", en: "The interface uses a warm paper tone, black structural lines, blue indices, and limited red status signals. Large titles, asymmetric grids, and monospaced labels establish hierarchy. Motion is reserved for archive entry, reading progress, and state changes, with reduced-motion preferences respected." },
        figures: [{
          path: "/research/knowledge-atlas/mobile-home.png",
          alt: { zh: "Knowledge Atlas 手機端首頁", en: "Knowledge Atlas mobile homepage" },
          caption: { zh: "手機版保留檔案順序和索引層級，將多欄內容收束為單欄閱讀。", en: "The mobile layout preserves archive order and index hierarchy while collapsing multi-column content into a single reading flow." },
          format: "portrait",
        }],
        sources: [knowledgeAtlasRepository, knowledgeAtlasReadme],
      },
      {
        id: "delivery-state",
        title: { zh: "目前實作與產品路線", en: "Current implementation and product roadmap" },
        body: { zh: "目前版本先固定公開檔案的結構、檢索方式與閱讀介面。下一階段再把個人背景、實習和更多專案整理為可更新的知識來源，並在伺服器端加入向量檢索和帶來源的模型回答；兩個階段在頁面中分開標示。", en: "The current version first stabilizes public archive structure, retrieval, and reading. A later stage can turn personal context, internships, and more projects into maintainable knowledge sources, then add server-side vector retrieval and source-aware model answers. The two stages remain visibly separated." },
        capabilities: [
          { title: { zh: "結構化專案檔案", en: "Structured project archives" }, detail: { zh: "專案、章節、來源、圖表與媒體使用穩定節點。", en: "Projects, sections, sources, figures, and media use stable nodes." }, status: "implemented" },
          { title: { zh: "本地全文檢索", en: "Local full-text retrieval" }, detail: { zh: "在公開檔案中查找專案、章節、標籤和來源。", en: "Search projects, sections, tags, and sources across public archives." }, status: "implemented" },
          { title: { zh: "雙語與響應式介面", en: "Bilingual responsive interface" }, detail: { zh: "中文與英文共用內容節點，桌面和手機保留一致層級。", en: "Chinese and English share content nodes across desktop and mobile layouts." }, status: "implemented" },
          { title: { zh: "伺服器端知識檢索", en: "Server-side knowledge retrieval" }, detail: { zh: "把經過公開審核的個人資料寫入向量索引。", en: "Index publication-approved personal material in a vector store." }, status: "planned" },
          { title: { zh: "帶來源的模型回答", en: "Source-aware model answers" }, detail: { zh: "由伺服器保管模型憑證，回答同時返回檔案章節。", en: "Keep model credentials on the server and return archive sections with answers." }, status: "planned" },
        ],
        sources: [knowledgeAtlasRepository, knowledgeAtlasReadme],
      },
      {
        id: "limits",
        title: { zh: "目前邊界", en: "Current boundaries" },
        body: { zh: "目前可以核驗的是前端程式、公開檔案、本地檢索與介面行為。網站尚未接入伺服器端個人知識庫，也沒有可公開的營運資料；後續功能只有在資料來源、隱私邊界和引用方式確認後才會加入。", en: "What can currently be verified is the front-end code, public archives, local retrieval, and interface behavior. The site is not yet connected to a server-side personal knowledge base and has no public operational data. Later features will be added only after sources, privacy boundaries, and citation behavior are defined." },
        sources: [knowledgeAtlasRepository, knowledgeAtlasReadme],
      },
    ],
    sources: [knowledgeAtlasRepository, knowledgeAtlasReadme],
  },
];

export const education = [
  { period: "2022.09—2026.06", school: { zh: "中南大學", en: "Central South University" }, detail: { zh: "計算機科學與技術學士 · 已畢業並取得學位 · 長沙", en: "BSc in Computer Science and Technology · Graduated with degree · Changsha" } },
];

export const curriculumGroups: CurriculumGroup[] = [
  {
    index: "01",
    title: { zh: "程式設計與軟體工程", en: "Programming & software engineering" },
    summary: { zh: "從程式設計、資料結構與演算法延伸到軟體工程和跨端應用實作。", en: "From programming, data structures, and algorithms to software engineering and cross-platform application work." },
    courses: [
      { zh: "C 語言程式設計", en: "C programming" },
      { zh: "Java 語言與系統設計", en: "Java and system design" },
      { zh: "資料結構與演算法", en: "Data structures and algorithms" },
      { zh: "軟體工程", en: "Software engineering" },
    ],
    source: curriculumPlan,
  },
  {
    index: "02",
    title: { zh: "計算機系統與硬體", en: "Computer systems & hardware" },
    summary: { zh: "課程覆蓋計算機組成、作業系統、網路、資料庫與嵌入式系統。", en: "The curriculum covers computer organization, operating systems, networks, databases, and embedded systems." },
    courses: [
      { zh: "計算機組成原理與組合語言", en: "Computer organization and assembly" },
      { zh: "作業系統原理", en: "Operating systems" },
      { zh: "計算機網路", en: "Computer networks" },
      { zh: "嵌入式系統", en: "Embedded systems" },
    ],
    source: curriculumPlan,
  },
  {
    index: "03",
    title: { zh: "數學、資料與人工智慧", en: "Mathematics, data & AI" },
    summary: { zh: "數學基礎與資料方法支援後續的人工智慧、圖像處理和資料分析課程。", en: "Mathematical foundations and data methods support later work in AI, image processing, and data analysis." },
    courses: [
      { zh: "離散數學", en: "Discrete mathematics" },
      { zh: "機率論與數理統計", en: "Probability and statistics" },
      { zh: "人工智慧", en: "Artificial intelligence" },
      { zh: "數位影像處理", en: "Digital image processing" },
    ],
    source: curriculumPlan,
  },
  {
    index: "04",
    title: { zh: "實踐與專業發展", en: "Practice & professional development" },
    summary: { zh: "程式設計實踐、專案系統實踐、專案實習與畢業論文構成培養方案中的實踐環節。", en: "Programming practice, project-system practice, project internship, and the graduation thesis form the practical component of the program." },
    courses: [
      { zh: "程式設計實踐", en: "Programming practice" },
      { zh: "專案系統實踐", en: "Project-system practice" },
      { zh: "專案頂崗實習", en: "Project internship" },
      { zh: "畢業設計（論文）", en: "Graduation thesis" },
    ],
    source: curriculumPlan,
  },
];

export const internships = [
  {
    period: "2026.01.01—2026.05.29",
    company: { zh: "長沙空中靈鳥智能科技有限公司", en: "Changsha Kongzhong Lingniao Intelligent Technology Co., Ltd." },
    detail: { zh: "集群智能事業部 · 實習生", en: "Swarm Intelligence Division · Intern" },
    note: { zh: "實習鑑定記錄我在工作中保持勤奮，做事嚴謹；遇到不熟悉的問題時，會向有經驗的同事請教。", en: "The internship assessment records a diligent and careful working approach, including asking experienced colleagues when encountering unfamiliar problems." },
  },
];

export const topicIndex: Bilingual[] = [
  { zh: "大型語言模型與控制邊界", en: "Language models and control boundaries" },
  { zh: "感知與視覺伺服", en: "Perception and visual servoing" },
  { zh: "跨端系統與內容安全", en: "Cross-platform systems and content safety" },
  { zh: "檔案資訊架構", en: "Archive information architecture" },
  { zh: "來源追蹤與本地檢索", en: "Source tracing and local retrieval" },
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
  { zh: "圖片管理系統如何完成掃碼登入？", en: "How does the image system implement QR login?" },
  { zh: "四人團隊中我負責哪些工作？", en: "What did I own in the four-person team?" },
  { zh: "Knowledge Atlas 如何組織專案與來源？", en: "How does Knowledge Atlas organize projects and sources?" },
  { zh: "Knowledge Atlas 下一階段準備加入什麼？", en: "What is planned for the next stage of Knowledge Atlas?" },
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
  {
    text: { zh: "掃碼登入由 Web、移動端與服務端共同完成。Web 端先取得隨機字串並產生二維碼，移動端掃描後提交字串與使用者資訊，服務端完成配對與身分檢查，再把登入結果交回 Web 端；登入狀態同時支援 7 天持久化鑑權。", en: "QR login spans the web client, mobile client, and server. The web client requests a random string and presents it as a QR code; mobile submits the scanned string with user information; the server matches and validates the request before returning the login result. The session also supports seven-day persistence." },
    sources: [{ title: { zh: "掃碼登入與持久化鑑權", en: "QR login and persistent authentication" }, detail: { zh: "圖片管理系統答辯簡報／個人履歷", en: "Image management presentation / personal resume" }, type: "project" }],
  },
  {
    text: { zh: "這是四人團隊專案，我的角色是後端開發。我負責掃碼與持久化登入、阿里雲 OSS 與敏感資訊過濾，並使用 GitLab／Git Flow 協作，編寫 Dockerfile 完成容器化部署；PC 與 Android 端等團隊交付不會全部歸為我的個人成果。", en: "This was a four-person team project and my role was backend development. I owned QR and persistent login, Alibaba Cloud OSS and sensitive-content filtering, GitLab / Git Flow collaboration, and the Dockerfile-based deployment. The team's PC and Android delivery is not presented as entirely my individual work." },
    sources: [{ title: { zh: "團隊角色與主要工作", en: "Team role and primary contributions" }, detail: { zh: "個人履歷 · 圖片管理系統", en: "Personal resume · Image Management System" }, type: "archive" }],
  },
  {
    text: { zh: "Knowledge Atlas 以專案作為第一層入口。每個專案再拆成穩定章節，章節保留來源、圖表與媒體；本地搜尋同時索引專案、章節、標籤和來源，搜尋結果直接回到對應檔案或正文錨點。", en: "Knowledge Atlas uses projects as the first-level entry point. Each project is divided into stable sections that retain sources, figures, and media. Local search indexes projects, sections, tags, and sources, then returns directly to the relevant archive or text anchor." },
    sources: [{ title: { zh: "檔案與章節結構", en: "Archive and section structure" }, detail: { zh: "Knowledge Atlas · 公開原始碼與 README", en: "Knowledge Atlas · public source and README" }, type: "project" }],
  },
  {
    text: { zh: "下一階段會先整理經過公開審核的個人背景、實習與專案資料，再建立伺服器端向量檢索。模型憑證只保存在伺服器環境中，回答需要同時返回對應檔案章節；在資料來源與隱私邊界確認以前，這些功能維持規劃狀態。", en: "The next stage will first organize publication-approved personal context, internship, and project material, then add server-side vector retrieval. Model credentials will remain in the server environment, and answers must return matching archive sections. These features stay planned until sources and privacy boundaries are confirmed." },
    sources: [{ title: { zh: "目前實作與產品路線", en: "Current implementation and product roadmap" }, detail: { zh: "Knowledge Atlas · 產品路線", en: "Knowledge Atlas · product roadmap" }, type: "system" }],
  },
];
