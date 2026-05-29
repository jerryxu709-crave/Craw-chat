# 乌鸦 · 写作伴侣

一个 iOS PWA，用来陪你把话说透。乌鸦不是写作助手，不是老师——是你自己内心更清醒的那个声音。

---

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

```bash
cp .env.example .env.local
```

打开 `.env.local`，填入你的 Anthropic API Key：

```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
```

`.env.local` 已被 `.gitignore` 排除，**永远不会提交到 Git**。

### 3. 启动开发服务器

```bash
npm run dev
```

Vite 会显示两个地址：
- `Local: http://localhost:5173`（在电脑浏览器打开）
- `Network: http://192.168.x.x:5173`（在同一 WiFi 下用手机打开）

### 4. 在 iPhone 上添加到主屏幕

1. 用 Safari 打开 `http://192.168.x.x:5173`
2. 点击底部分享按钮（方框+箭头）
3. 选择「添加到主屏幕」
4. 名称填「乌鸦」，点「添加」
5. 从主屏幕打开，全屏运行，无浏览器地址栏

---

## 代理 / VPN 说明（中国大陆用户）

本 App 直接在浏览器里调用 Anthropic API。浏览器的网络请求**自动走系统级代理**（包括 VPN、Clash、Surge 等），无需在代码里额外配置。

只需确保：
- 手机或电脑上的 VPN/代理已开启
- 代理能正常访问 `api.anthropic.com`

---

## 构建生产版本

```bash
npm run build
npm run preview  # 预览构建结果
```

> 生产版本会把 API Key 打包进 JS Bundle。这个 App 仅供个人本地使用，**不要部署到公开可访问的服务器**。如需公开部署，请换用 Cloudflare Workers 代理层（见 `ARCHITECTURE.md`）。

---

## 导出到 Obsidian

1. 打开某段对话
2. 点击右上角下载图标（↓）
3. 浏览器下载一个 `.md` 文件
4. 将文件移入 Obsidian Vault（如 `Imports/` 文件夹）
5. 文件包含 YAML front matter（标题、日期、主题标签、情绪标签）

---

## 技术栈

- **Vite + React + TypeScript** — 构建工具与 UI 框架
- **Tailwind CSS v4** — 样式（CSS-first 配置）
- **Dexie v4** — IndexedDB 封装，本地存储对话历史
- **@anthropic-ai/sdk** — Claude API 流式调用
- **vite-plugin-pwa** — Service Worker 与 PWA manifest 生成

详细架构说明见 `ARCHITECTURE.md`。
