# 应用介绍

基于 **Kimi 大模型** 与 **Agnes AI 图像生成服务** 的 AI 互动娱乐应用。面向主机与移动端，支持创建个性化 AI 角色、编写故事、沉浸式剧情互动，以及历史记录的导出与导入。

## 功能特性

- 广场主页：搜索栏 + 热度排行榜 + "我创建的角色和故事 / 我聊过的 / 我收藏的" 三个 Tab
- AI 角色创建：外貌描述、人物背景、角色 Prompt 自定义，Agnes AI 自动生成立绘
- 故事创建：从角色库选择 1-10 个角色出演，编写世界观与事件，指定用户身份
- 沉浸式互动：Kimi 流式对话，多角色扮演，动作描写用英文小括号、心理描写用中文中括号
- 数据存储：Apache CouchDB 存储角色、故事、会话
- 历史记录：支持导出为本地 JSON、从 JSON 导入恢复
- 无需登录：本地匿名用户标识，区分"我创建的""我聊过的""我收藏的"

## 技术栈

| 层级 | 技术选型 |
| --- | --- |
| 前端 | React 19 + Vite 6 |
| 路由 | React Router 7 |
| 后端/存储 | Apache CouchDB |
| AI 对话 | Kimi 大模型（Moonshot API） |
| AI 图像 | Agnes AI |
| 数据交换 | JSON |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 准备 API Key

- Kimi：访问 https://platform.kimi.com 注册并创建 API Key
- Agnes AI：访问 https://agnes-ai.cn 注册并获取 API Key

复制环境变量模板并填入：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
VITE_KIMI_API_KEY=sk-xxxx
VITE_AGNES_API_KEY=sk-yyyy
VITE_COUCHDB_URL=http://localhost:5984
VITE_COUCHDB_DB=ai_roleplay
```

### 3. 启动 CouchDB

本地安装 Apache CouchDB，启动后访问 http://localhost:5984/_utils/ 进入 Fauxton 管理界面。

首次使用时 CouchDB 会要求创建管理员账号。如果启用了认证，请在 `src/api/couchdb.js` 中打开 `AUTH` 注释并填入账号密码（Basic Auth）。

数据库 `ai_roleplay` 会在首次读写时由 `ensureDB()` 自动创建，也可在 Fauxton 中手动创建。

### 4. 启动开发服务器

```bash
npm run dev
```

浏览器访问 http://localhost:5173

### 5. 生产构建

```bash
npm run build
npm run preview
```

## 项目结构

```
open-cat-box/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── api/
    │   ├── kimi.js          # Kimi 调用封装（流式 + 重试）
    │   ├── agnes.js         # Agnes AI 图像生成调用
    │   └── couchdb.js       # CouchDB HTTP API 封装
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── SearchBar.jsx
    │   ├── HotRanking.jsx
    │   ├── CharacterCard.jsx
    │   ├── CharacterForm.jsx
    │   ├── StorySetup.jsx
    │   ├── ChatMessage.jsx
    │   └── ChatInput.jsx
    ├── pages/
    │   ├── Square.jsx
    │   ├── CharacterCreate.jsx
    │   ├── CharacterList.jsx
    │   ├── StoryCreate.jsx
    │   ├── Playground.jsx
    │   └── HistoryManager.jsx
    ├── hooks/
    │   └── useStreamingChat.js
    └── utils/
        ├── localUser.js
        ├── historyIO.js
        └── interactions.js
```

## 数据模型

### 角色文档（character）

```json
{
  "_id": "char-xxx",
  "type": "character",
  "name": "艾莉娅",
  "appearance": "银白色长发，红色瞳孔...",
  "portraitUrl": "https://...",
  "background": "古老的法师...",
  "systemPrompt": "你扮演「艾莉娅」...",
  "ownerId": "u_xxx",
  "ownerName": "匿名旅人",
  "hot": 0,
  "favoritedBy": [],
  "createdAt": "2026-10-02T...",
  "updatedAt": "2026-10-02T..."
}
```

### 会话 / 故事文档（session）

```json
{
  "_id": "session-xxx",
  "type": "session",
  "sessionId": "session-xxx",
  "title": "迷雾森林的清晨",
  "isStory": true,
  "characterIds": ["char-a", "char-b"],
  "storyContext": "世界观与事件描述",
  "userRole": "一位失忆的旅人",
  "messages": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "(she smiles) 你来了。[她等这一刻很久了]" }
  ],
  "ownerId": "u_xxx",
  "ownerName": "匿名旅人",
  "hot": 0,
  "favoritedBy": [],
  "createdAt": "2026-10-02T...",
  "updatedAt": "2026-10-02T..."
}
```

## 历史记录 JSON 格式

导出文件结构：

```json
{
  "version": 1,
  "exportedAt": "2026-10-02T...",
  "session": {
    "sessionId": "session-xxx",
    "title": "...",
    "characterIds": ["..."],
    "storyContext": "...",
    "userRole": "...",
    "isStory": true,
    "messages": [ ... ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

导入时自动生成新 `_id`，避免与已有记录冲突。

## 角色扮演提示词约定

- 动作 / 神态描写用英文小括号：`(she smiles)`
- 心理活动描写用中文中括号：`[他感到一阵不安]`
- 多角色故事模式：AI 扮演所有非用户角色，保持人设一致，自然推进剧情

## 安全说明

- 本项目为演示性质，API Key 通过前端环境变量注入。生产环境请将 Kimi 与 Agnes 的调用迁移到后端代理层。
- `.env` 已在 `.gitignore` 中忽略，请勿提交真实 Key。
- CouchDB 若开放到公网，务必启用管理员认证并配置防火墙。

## 作者

- 作者：Your Name
- 邮箱：you@example.com
- 源码仓库：https://github.com/your-name/open-cat-box

## 许可证

MIT