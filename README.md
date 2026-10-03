# Wind

个人博客 · 简洁、轻盈、流动。

以「风」为视觉母题：大量留白、细线条、柔和动效。前后台一体，文章存 PostgreSQL，浏览器里写作发布。

## 技术栈

Next.js 16.3.8（App Router）· React 19.3 · TypeScript strict · Tailwind CSS 4.3 · PostgreSQL 18 · Prisma ORM 7.10 · Shiki 4.5 · Zod

## 快速开始

```bash
pnpm install
cp .env.example .env          # 本地默认值即可直接用
docker compose up -d          # 启动本地 PostgreSQL 18（OrbStack）
pnpm prisma migrate dev       # 建表
pnpm prisma db seed           # 填充示例文章/标签/友链
pnpm dev                      # http://localhost:3000
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 本地开发（Turbopack） |
| `pnpm build` / `pnpm start` | 生产构建 / 启动 |
| `pnpm lint` / `pnpm typecheck` | 代码检查 / 类型检查 |
| `pnpm format` | Prettier 格式化 |
| `pnpm db:up` | 启动本地 Postgres |
| `pnpm prisma migrate dev` | 创建/应用迁移 |
| `pnpm prisma db seed` | 示例数据 |
| `pnpm admin:hash-password` | 生成 Argon2id 管理员密码哈希（写入 .env） |

## 文档

- 开发计划、技术基线、安全标准、部署方案：[docs/PLAN.md](docs/PLAN.md)
- 生产部署（Phase 7）暂缓，待阿里云 ECS 就绪后启动
