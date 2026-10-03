# Wind 博客 — 开发计划（最终定稿）

> 本文档是项目的唯一计划与标准来源。执行状态以 git 提交历史为准。

## 〇、要点确认

- 技术基线与安全标准按评审意见定稿（版本精确锁定、Argon2id、双层授权、上传/Markdown 安全、浏览量单一事实源、visitor cookie、异地备份等）。
- 本地开发：OrbStack + docker compose 起 PostgreSQL 18。
- 部署延后：专注 Phase 0–6 本地开发；生产部署（Phase 7）待服务器就绪后启动。
- 站点文案先用占位默认值，全部走 Setting 表，后台随时改。

## 一、定版技术基线（精确锁定）

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 16.3.8（含 2026-09-30 官方安全更新）+ React 19.3.0 + TypeScript strict |
| 样式 | Tailwind CSS 4.3.x（CSS-first design tokens） |
| 运行时 | Node.js 24 LTS + pnpm |
| 数据库 | PostgreSQL 18（postgres:18-alpine）+ Prisma ORM 7.10.x（不追 8 RC） |
| Markdown | unified（remark/rehype，默认禁 raw HTML）+ Shiki 4.5.x |
| 运行时校验 | Zod：env / API body / Server Action 入参 / Setting 全部过校验 |
| 认证 | @node-rs/argon2（Argon2id）+ jose 会话 JWT |
| 测试 | Vitest + Playwright + ESLint 9 + Prettier |

关键依赖在 package.json 写精确版本，pnpm-lock.yaml 入库；升级走显式提交。

## 二、安全标准（正式规范）

**认证与授权**

- 环境变量只存 `ADMIN_PASSWORD_HASH`（Argon2id），由 `pnpm admin:hash-password` 生成，不存明文
- 会话 cookie `__Host-wind-session`：HttpOnly + Secure + SameSite=Lax + Path=/ + 7 天（本地 http 开发自动降级）
- 双层授权：proxy.ts 只做粗筛（未登录访问 /admin 重定向登录页）；每个写库的 Server Action / Route Handler 内部必须再调 `requireAdmin()`
- CSRF：SameSite 之外，所有写方法 Route Handler 校验 Origin/Referer（Server Actions 用 Next 内建 Origin 校验）

**内容与上传**

- Markdown：默认不允许 raw HTML，渲染统一走 `src/lib/markdown.ts` 单一管线
- 上传：必须登录 → ≤10MB → MIME + magic bytes 校验 → sharp 校验尺寸（≤6000×6000）并压缩（最长边 ≤2000px、转 WebP）→ 随机文件名 + `YYYY/MM/DD/` 目录 → 禁止 SVG；nginx `client_max_body_size 10m` 双层限制（生产期生效）

**游客身份与限流**

- 去重标识用 `__Host-wind-visitor` 随机 UUID cookie（1 年），DB 只存 visitorId；IP 仅用于内存级短期限流，不入数据库、不写应用日志
- 双层限流：nginx limit_req（生产期）+ 应用内存限流
- 搜索输入：q ≤ 50 字符、最多 20 条、转义 `%`/`_` 通配符

**响应头与健康检查**

- HSTS、X-Content-Type-Options、Referrer-Policy、Permissions-Policy、CSP（逐步收紧）
- `GET /api/health`：检查 Next 存活 + DB 可达，仅返回 `{"status":"ok"}`，接入 Docker healthcheck（生产期）

**隐私**：关于页/页脚声明——不持久化原始 IP、伪匿名 visitor 标识去重、日志有限期保留、不用于跨站追踪。

## 三、数据模型

- **Post**：slug（唯一；发布后不自动变，可手动改）、title、summary、content（Markdown 原文，唯一数据源）、cover、status（DRAFT/PUBLISHED；PUBLISHED 约束 publishedAt ≤ now）、pinned + pinOrder、views（缓存计数）、publishedAt（timestamptz，内部 UTC）
- **PostRedirect**：oldSlug（唯一）→ postId；改 slug 后旧链接 308
- **Tag / PostTag**：复合主键 (postId, tagId) + 反向索引
- **Reaction**：UNIQUE(postId, kind, visitorId)，点赞/收藏可 toggle
- **PostView**：UNIQUE(postId, visitorId, day)，浏览量事实来源；`INSERT ... ON CONFLICT DO NOTHING` 命中才原子 +1 缓存计数
- **FriendLink**：name/url/avatar/description/sortOrder/visible
- **Setting**：key 白名单 registry（site.name/description/avatar/github/email/about/footer），Zod 校验
- **索引**：Post UNIQUE(slug)、INDEX(status, publishedAt)、INDEX(status, pinned, pinOrder, publishedAt)；Tag UNIQUE(slug)；搜索 GIN trgm 仅 title/summary
- **slug 生成**：中文标题 → pinyin 转写，冲突追加短 ID；保留手动编辑

## 四、架构要点

- **图片**：上传即压缩转 WebP；正文图片 nginx 静态直出 + 长缓存 + lazy-load（uploads volume 由 nginx 与 Next 共享）；不给全站图片套 next/image
- **缓存**：文章页走 ISR、后台保存时 `revalidatePath`；点赞/浏览/搜索为独立动态 API；单机不引入 Redis
- **编辑器预览**：编辑器（Client）debounce 200–400ms → Server Action → 共享 `renderMarkdown()` → HTML 回显；严禁 Client 组件直接 import 服务端模块
- **server 分层**：`src/server/{db,auth,queries,mutations,services}`；queries 只 SELECT、mutations 只写；db/auth 标注 `import "server-only"`

## 五、部署方案（标准先定，执行延后）

- **服务器**：推荐 2核4G（2C2G 为最低可跑线）；Ubuntu 24.04；40G ESSD；按量带宽峰值 3–5Mbps
- **地域合规**：内地 = ICP 备案 + 公安备案等相应要求；香港 = 无需 ICP 备案（其他合规要求以最新规定为准）；备案周期以接入商与管局实际审核为准，期间先用 IP 访问
- **容器拓扑**：nginx + next + postgres 三个常驻容器；certbot 装宿主机（webroot + cron renew + nginx reload）
- **镜像分发**：本地 build → `docker save` → scp → `docker load`；不使用 ACR 个人版于生产（官方定位仅开发测试、无 SLA）；后续自动化可评估 GHCR 或 ACR 企业版
- **磁盘保护**：compose 日志限制（max-size 10m / max-file 3）、镜像清理 cron、uploads 配额
- **备份**：每日 pg_dump + 每周 uploads 打包；本地留 7 天 + OSS 异地留 30 天；部署日做一次真实 restore 演练
- **安全基线**：安全组只开 22/80/443、SSH 密钥登录、UFW；发布流程含 `prisma migrate deploy`

## 六、执行分期

- **Phase 0 工程标准**：git init、README、docs/PLAN.md、Zod env schema、.env.example、pnpm + TS + ESLint/Prettier、dev 用 docker-compose（postgres:18-alpine）
- **Phase 1 纵向切片**：Prisma schema + migration + seed；渲染管线；一篇真实文章跑通 `/posts/[slug]`（最小样式，先证明全链路）
- **Phase 2 设计系统**：design tokens、字体、暗色模式、响应式、「风线」动效、首页 → **风格确认节点**
- **Phase 3 完整前台**：列表分页、标签、归档、搜索、友链、关于、RSS / sitemap / SEO（含 OG 自动图）/ 404
- **Phase 4 游客交互**：visitor cookie、点赞/收藏/浏览 API（去重 + 限流）、optimistic UI、隐私声明
- **Phase 5 后台**：Argon2id 登录 + 会话、文章 CRUD（slug 规则 + 308）、编辑器 + 实时预览、图片上传、标签/友链/设置管理
- **Phase 6 测试与安全收口**：Vitest（slug、渲染管线、阅读时长、搜索归一化、visitor 标识）+ Playwright 四条核心链路（登录、发布、Markdown 渲染、上传）+ 安全响应头 + health check + 错误/空态
- **Phase 7 生产部署**（延后）：Dockerfile + 生产 compose + nginx + HTTPS + migrate deploy + 备份与 restore 演练 + 上线检查单

## 七、设计方向（不变）

- 设计关键词：简洁、轻盈、流动；视觉母题「风」（风线 hero 动效、留白、细线条）
- 色板：暖纸白底 + 墨色正文 + 风青 accent（浅/暗两套 design tokens）
- 字体（全自托管子集化）：标题霞鹜文楷 Screen，正文系统无衬线，代码 JetBrains Mono
- 暗色模式：跟随系统 + 手动切换 + 本地记忆
