# MD Viewer 项目计划

## 项目概述

一个轻量级的 Markdown 文档托管与管理系统。前台用户通过域名访问渲染后的文档页面；后台管理员可对文档进行增删改查，文档 URL 创建后永不改变。

---

## 技术选型

| 层级 | 选择 | 理由 |
|------|------|------|
| 后端 | Node.js + Express | 轻量，部署简单 |
| 数据库 | SQLite (better-sqlite3) | 零配置，单文件，够用 |
| Markdown 渲染 | marked.js + DOMPurify | 成熟，支持 GFM，防 XSS |
| 代码高亮 | highlight.js | 代码块语法高亮 |
| 管理员认证 | JWT + bcrypt | 无状态，安全 |
| 代理层 | Nginx | 反代 + HTTPS |

---

## URL 设计

```
# 公开访问
GET /docs/:slug              渲染 Markdown → HTML 页面

# 管理后台
GET  /admin                  管理后台入口（登录页）

# API（均需 JWT 鉴权，除登录外）
POST   /api/auth/login       管理员登录，返回 JWT
GET    /api/docs             列出所有文档
POST   /api/docs             新建文档
GET    /api/docs/:id         获取单篇文档原始内容
PUT    /api/docs/:id         修改文档
DELETE /api/docs/:id         删除文档
```

---

## 数据库结构

```sql
CREATE TABLE documents (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT UNIQUE NOT NULL,    -- URL 路径，创建后永不改变
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,           -- 原始 Markdown 内容
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
  id            INTEGER PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
```

### 预设管理员账号

| 字段 | 值 |
|------|----|
| username | `admin` |
| password | `admin1234` |

初始化脚本（`scripts/init-admin.js`）在首次启动时自动写入，若账号已存在则跳过。密码通过 bcrypt hash 后存储，原文不落库。

### Slug 生成规则

- 创建时由标题自动生成，例如 `我的第一篇文章` → `wo-de-di-yi-pian-wen-zhang`（中文转拼音）或直接用英文标题转 kebab-case
- 若 slug 冲突，自动追加数字后缀：`my-doc-2`、`my-doc-3`
- **修改文档时 slug 永不更新**，保证 URL 稳定

---

## 项目目录结构

```
md-viewer/
├── server.js                 应用入口
├── db.js                     数据库初始化与连接
├── routes/
│   ├── public.js             GET /docs/:slug 公开访问路由
│   ├── auth.js               POST /api/auth/login
│   └── admin.js              文档 CRUD API
├── middleware/
│   └── auth.js               JWT 验证中间件
├── public/
│   ├── admin/
│   │   └── index.html        管理后台（Vanilla JS，仅 PC）
│   └── doc.css               文档展示页样式（响应式）
├── views/
│   └── document.html         文档渲染 HTML 模板
├── data/
│   └── db.sqlite             数据库文件
├── package.json
└── .env                      JWT_SECRET、PORT 等敏感配置
```

---

## 核心业务逻辑

### 公开访问文档

```
GET /docs/:slug
  1. 查询数据库 slug = :slug
  2. 404 if not found
  3. marked.js 将 content 渲染为 HTML
  4. DOMPurify sanitize，防 XSS
  5. 注入 document.html 模板，返回完整页面
```

### 新建文档

```
POST /api/docs  { title, content }
  1. JWT 鉴权
  2. 由 title 生成 slug
  3. 检查 slug 唯一性，冲突则追加数字
  4. 写入数据库
  5. 返回 { id, slug }  ← URL 从此固定
```

### 修改文档

```
PUT /api/docs/:id  { title, content }
  1. JWT 鉴权
  2. 更新 title、content、updated_at
  3. slug 字段不做任何修改
```

---

## 前台文档展示页（响应式）

面向所有用户，需适配手机和 PC。

```css
/* 核心响应式策略 */
.document-body {
  max-width: 780px;       /* PC 上居中，限制行宽，提升可读性 */
  margin: 0 auto;
  padding: 1rem 1.5rem;   /* 手机两侧留边距 */
}

pre  { overflow-x: auto; }   /* 代码块手机横向滚动 */
img  { max-width: 100%; }    /* 图片不溢出 */
.table-wrapper { overflow-x: auto; }  /* 表格手机横向滚动 */
```

```html
<!-- HTML head 中必须包含 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 后台管理页（仅 PC，无需响应式）

三栏布局，Vanilla JS 实现，无需引入框架：

```
+----------------+------------------------+----------------------+
|   文档列表      |      Markdown 编辑器   |     实时预览          |
|                |                        |                      |
|  [+ 新建]      |  textarea / CodeMirror |  渲染后的 HTML        |
|  搜索框        |                        |                      |
|  doc-1        |                        |                      |
|  doc-2  ✕     |   [保存]  [删除]        |                      |
|  ...          |   访问链接: /docs/slug  |                      |
+----------------+------------------------+----------------------+
```

功能点：
- 点击文档列表项，右侧加载其 Markdown 原文
- 编辑器实时同步预览（防抖 300ms）
- 保存后显示该文档的访问 URL，支持一键复制
- 删除前弹出确认对话框

---

## 安全措施

- Markdown 渲染输出通过 **DOMPurify** sanitize，防止 XSS 注入
- 管理 API 全部经过 **JWT 中间件**验证，token 有效期 8 小时
- 密码存储使用 **bcrypt**（salt rounds = 12）
- 登录接口添加 **rate limit**（每 IP 每分钟最多 10 次）
- `.env` 文件加入 `.gitignore`，不提交到版本库

---

## 部署方案

### Nginx 配置

```nginx
server {
    listen 443 ssl;
    server_name docs.yoursite.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass         http://127.0.0.1:3007;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name docs.yoursite.com;
    return 301 https://$host$request_uri;
}
```

### 进程守护

```bash
npm install -g pm2
pm2 start server.js --name md-viewer
pm2 save
pm2 startup   # 设置开机自启
```

---

## 开发顺序

1. 初始化项目，安装依赖，配置 SQLite
2. 实现公开文档渲染路由（`/docs/:slug`）+ 响应式样式
3. 实现 JWT 登录接口
4. 实现文档 CRUD API
5. 开发管理后台 HTML/JS（三栏布局）
6. 初始化管理员账号脚本
7. 联调测试
8. 服务器部署：Nginx + PM2 + HTTPS

---

## 依赖清单

```json
{
  "dependencies": {
    "express": "^4.x",
    "better-sqlite3": "^9.x",
    "marked": "^9.x",
    "dompurify": "^3.x",
    "jsdom": "^24.x",
    "highlight.js": "^11.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "dotenv": "^16.x",
    "express-rate-limit": "^7.x",
    "pinyin": "^4.x"
  }
}
```

> `jsdom` 用于在 Node.js 服务端运行 DOMPurify（DOMPurify 本身是浏览器 API，需要 jsdom 模拟 DOM 环境）。
> `pinyin` 用于中文标题转拼音 slug。
