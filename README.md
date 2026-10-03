# Wind

个人博客 · 简洁、轻盈、流动。

以「风」为视觉母题：大量留白、细线条、柔和动效。前后台一体，文章存 PostgreSQL，浏览器里写作发布。

## 功能总览

- **前台**：首页（风线 hero）、文章详情（Markdown + Shiki 双主题高亮、目录、阅读时长、上/下一篇）、标签、归档、搜索（pg_trgm 中文子串）、友链、关于、RSS、sitemap/robots、OG 分享图、404
- **游客交互**：点赞/收藏（匿名 cookie 去重、可取消）、浏览量（同访客同日计 1）、隐私声明
- **后台** `/admin`：Argon2id 密码登录、文章管理（草稿/发布/置顶/slug 手改后旧链接 308）、Markdown 编辑器（实时预览与前台同管线）、图片上传（sharp 压缩转 WebP、禁 SVG、随机文件名）、友链与站点设置
- **安全**：双层授权（proxy 粗筛 + 每个写操作 `requireAdmin()`）、Origin 校验、双层限流、安全响应头 + CSP、健康检查 `/api/health`
- **暗色模式**：跟随系统 + 手动切换；霞鹜文楷 Screen / JetBrains Mono 全自托管（OFL 许可，见 [docs/FONTS.md](docs/FONTS.md)）

## 技术栈

Next.js 16.3.8（App Router）· React 19.3 · TypeScript strict · Tailwind CSS 4.3 · PostgreSQL 18 · Prisma ORM 7.10 · Shiki 4.5 · Zod

## 快速开始

```bash
pnpm install
cp .env.example .env          # 本地默认值即可直接用
docker compose up -d          # 启动本地 PostgreSQL 18（OrbStack）
pnpm prisma migrate dev       # 建表
pnpm prisma db seed           # 填充示例文章/标签/友链
pnpm build && pnpm start      # 生产模式运行（后台登录才可用）
# 或 pnpm dev（开发模式）
```

## 后台登录

```bash
pnpm admin:hash-password <你的密码>   # 输出可直接粘贴进 .env 的行（$ 已按 @next/env 规则转义）
```

把输出的 `ADMIN_PASSWORD_HASH="..."` 写入 `.env` 后重启服务。**本地开发密码**为 `wind-dev-2026`（仅存于本地 .env，不入库）；上线前务必重新生成。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 本地开发（Turbopack） |
| `pnpm build` / `pnpm start` | 生产构建 / 启动 |
| `pnpm lint` / `pnpm typecheck` | 代码检查 / 类型检查 |
| `pnpm format` | Prettier 格式化 |
| `pnpm test` | Vitest 单元测试 |
| `pnpm exec playwright test` | E2E（登录/发布/渲染/上传，需先 build） |
| `pnpm db:up` | 启动本地 Postgres |
| `pnpm prisma migrate dev` | 创建/应用迁移 |
| `pnpm prisma db seed` | 示例数据 |
| `pnpm admin:hash-password` | 生成 Argon2id 密码哈希 |

## 文档

- 开发计划、技术基线、安全标准、部署方案：[docs/PLAN.md](docs/PLAN.md)
- 字体与配色授权：[docs/FONTS.md](docs/FONTS.md)
- 生产部署（Phase 7，待阿里云 ECS 就绪后启动）：方案见 docs/PLAN.md 第五节
