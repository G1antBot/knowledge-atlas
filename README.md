# Knowledge Atlas / V5

一个以论文与实验媒体为核心的个人 AI 知识系统前端原型。视觉保持瑞士国际主义编辑风，并在不更换现有 Next.js 架构的前提下加入可检索档案、克制动效、章节追踪和来源回链。

## 本地运行

在 `personal-site` 目录执行：

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run check
npm.cmd run build
npm.cmd start
```

当前不连接后端服务；Ask 页面使用本地静态档案和浏览器定时器模拟回答流。

## 路由

- `/`：档案卡优先的知识索引、滚动进度与分段入场、共享 AskInterface 和主题索引；不展示跨项目媒体条
- `/ask`：完整 AskInterface、推荐问题、引用来源卡、停止/清空/复制/反馈与演示错误状态
- `/projects`：档案索引与标签筛选
- `/projects/uav-recognition-strike-control`：UAV 主档案，包含瑞士编辑式阅读目录、当前章节追踪、白话摘要、系统架构、混合路由、双线程看门狗、感知、视觉伺服 / strike、安全防护、实验方法、论文图例与图表、限制、来源回链与档案网络
- `/projects/image-management-system`：待补档入口
- `/projects/team-blog-platform`：次级档案入口
- `/about`：系统背景、教育和资料待补充说明
- `/profile`：兼容旧入口，重定向到 `/about`
- `/metrics`：兼容旧入口，重定向到 `/projects`

## 允许的内容来源

网站内容只依据以下公开范围整理：

- 论文 `info.tex`、第三章、第四章、第五章
- SIL `README.md` 与 `README.LLM.md`
- 论文视频的四个阶段媒体：起飞、对准、逼近、终端穿越
- 论文 `image/` 中与软件在环架构、感知、视觉伺服和偏差分析直接相关的图例与图表

站内引用使用“论文第3章”“论文第4章”“SIL README”等来源标签，不渲染本地绝对路径。

## 媒体策略

`public/media/uav/` 中的四个 GIF 是供 UAV 档案展示的派生 fallback，并各自配有轻量 WebP poster。首页不加载这些媒体；进入对应档案后也默认只加载 poster，访客点击才加载 GIF。`public/research/uav/` 保存从论文复制出的网页展示图，原论文文件保持不变。

## 功能融合

- Motion：只用于首页档案卡入场与索引滚动进度，并尊重 `prefers-reduced-motion`。
- Orama：在浏览器内为公开项目、章节、标签和来源建立本地全文索引；中文额外提供精确子串回退。
- cmdk：提供 `Ctrl / Cmd + K` 全局档案搜索和键盘导航。
- Fumadocs：借鉴稳定内容节点与章节来源分层；本轮不安装其主题或迁移路由。
- Quartz：借鉴 backlinks，将档案来源自动映射回引用它的章节，并提供档案网络入口。

## 原型边界

- 仍是纯前端原型，不连接实时 AI、外部向量数据库或其他后端；当前 Orama 只检索公开静态档案，不调用 Kimi。
- 首页不展示实验指标或能力评级；UAV 详情只陈列论文原有图表并给出来源语境，不重新包装成个人能力分数。
- “strike”仅指软件在环中的模拟目标控制 / 终端穿越任务，不描述现实伤害。
- 图片管理系统与博客平台在 V4 中保持待补档 / 次级索引状态，不扩写未经本轮来源核验的事实。
- `prefers-reduced-motion`、键盘 focus、语义标签和移动端导航已保留。
