# 乌鸦 Architecture

Answers to the 8 questions from the project spec.

---

## 1. 技术栈

**Vite + React 19 + TypeScript + Tailwind CSS v4**

- **React**: 最成熟的组件模型，适合 Sidebar + Chat 这种分区布局；学习资源最多
- **Vite**: 零配置启动，`host: true` 让手机通过局域网 IP 直接访问开发服务器；`vite-plugin-pwa` 自动生成 Service Worker
- **TypeScript**: 强类型保障 Dexie schema 和组件 props 的一致性
- **Tailwind v4**: CSS-first 配置（无需 `tailwind.config.ts`），自定义 token 写在 `src/index.css` 的 `@theme {}` 块里

---

## 2. 状态与本地持久化

| 数据 | 存储 | 原因 |
|------|------|------|
| 对话历史、消息 | IndexedDB（Dexie v4） | 数据量大、需要索引查询、支持事务 |
| 应用设置（语言模式、熟悉度） | localStorage | 小且频繁读取，同步 API 更方便 |
| 标签词表 | localStorage | 同上，体积可控 |

**Dexie Schema（`src/lib/db.ts`）**

```
conversations: id, updatedAt, languageMode
messages: id, conversationId, timestamp
```

对话对象携带 `themes[]` 和 `emotions[]`（标签数组），同时存一份全局标签词表（`src/lib/settings.ts: TagVocabulary`），每次自动打标时合并新标签进词表，下次打标时把词表一并传给模型，让标签自然生长而不随意发散。

---

## 3. API Key 与代理

**MVP 方案（本地个人使用）**

- Key 存在 `.env.local`，通过 `import.meta.env.VITE_ANTHROPIC_API_KEY` 注入
- 使用 `@anthropic-ai/sdk` + `dangerouslyAllowBrowser: true`
- `.env.local` 在 `.gitignore` 里，**永远不进 Git**
- 中国大陆：浏览器自动走系统级 VPN/代理，无需应用层配置

**安全边界**：此设置 Key 会进入 JS Bundle，仅适合本地开发机运行，**不可部署到公开服务器**。

**未来生产方案（一文件切换）**

把 `src/lib/claude.ts` 里的 `anthropic` 实例换成：

```ts
// 改为指向 Cloudflare Worker
const BASE_URL = 'https://your-worker.your-subdomain.workers.dev'
// Worker 保管 Key，前端只传消息体
```

全部调用逻辑集中在 `src/lib/claude.ts`，换一处即可。

---

## 4. 乌鸦人格注入

**`src/prompts/crow.ts`** 导出 `buildSystemPrompt(mode, familiarityLevel): string`

```
BASE_SYSTEM_PROMPT
  + FAMILIARITY_HINTS[level]   // "Level 1：多听少评"…
  + MODE_HINTS[mode]           // "生活模式：温暖、松弛、偏中文"…
  + buildLanguageHint(text)    // 每条消息的语言检测附言
```

**熟悉度等级**（当前 MVP 固定为 Level 1）：
- Level 1：新认识——多听，轻评，措辞建议要轻
- Level 2：熟悉——可以更直接，第一步剖析可以深一点
- Level 3：亲密——了解你的模式，偶尔可以反问、挑战表面阅读

熟悉度存在 `AppSettings.familiarityLevel`（localStorage），将来可根据对话轮数自动升级。

---

## 5. 双语逻辑

**`src/lib/language.ts`**

- 统计 CJK 字符（`[㐀-鿿豈-﫿]`）占非空格字符的比例
- >50% → 中文，>15% → 混合，否则 → 英文
- 每条消息发送前生成语言提示，附加到 system prompt 末尾
- 模式切换（生活/工作）是手动的，存 localStorage，不影响语言检测

---

## 6. 导出管线

**`src/lib/export.ts`** → `buildMarkdownExport(conv, messages)` → Blob → `URL.createObjectURL` → click 下载

Obsidian 兼容的 YAML front matter：

```yaml
---
title: "对话标题"
date: 2026-05-29
source: crow-writing-pwa
themes: [工作压力, 自我认知]
emotions: [焦虑]
mode: life
---
```

对话正文用 `**Jerry**` / `**乌鸦**` 分隔，`---` 分割轮次。

---

## 7. 项目结构与 Git 工作流

```
src/
  components/
    Sidebar/       # Sidebar, ConversationList, TagTree
    ChatView/      # ChatView, MessageBubble, EmptyState
    Input/         # MessageInput
  lib/
    db.ts          # Dexie CRUD
    claude.ts      # Anthropic SDK（唯一接触 API 的文件）
    language.ts    # CJK 检测
    tagging.ts     # 自动打标 + 标题生成
    export.ts      # Markdown 导出
    settings.ts    # localStorage 读写
  prompts/
    crow.ts        # System prompt 构建（乌鸦的灵魂）
  hooks/
    useConversation.ts  # 核心状态机
    useSettings.ts      # 设置状态
  types.ts
  App.tsx
  main.tsx
  index.css        # Tailwind @theme 自定义 token
```

**Git 分支策略**：
- `main`：稳定版本
- `claude/crow-writing-pwa-b5ofB`：当前开发分支
- 按功能模块提交（脚手架、DB 层、Claude 集成、UI、文档……）

**.gitignore 关键项**：`node_modules/`, `dist/`, `.env.local`, `*.local`

---

## 8. 进阶功能预留口子

| 功能 | 当前状态 | 扩展方式 |
|------|----------|----------|
| 熟悉度成长 | MVP 固定 Level 1 | 对话轮数达阈值后更新 `AppSettings.familiarityLevel` |
| 每日话题钩 | 未做 | 在 `EmptyState` 加一个随机提示，从提示库 fetch |
| 翻出旧随想 | 未做 | Dexie 支持按标签/日期查询，加一个"随机回顾"入口 |
| 生产部署 | 本地 | 换 `claude.ts` 的 base URL 指向 Cloudflare Worker |
| 后端同步 | 无 | Dexie 支持云同步（Dexie Cloud），可按需开启 |
