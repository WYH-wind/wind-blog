<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Wind 博客 — 工程约定

个人全栈博客。技术基线、安全标准与完整计划见 `docs/PLAN.md`。

## 常用命令

- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm typecheck`
- `pnpm db:up`：docker compose 启动本地 PostgreSQL 18（OrbStack）
- `pnpm prisma migrate dev`：建表与迁移；`pnpm prisma db seed`：示例数据

## 约定

- Conventional Commits（feat / fix / docs / chore / refactor / test），main 主干开发
- TypeScript strict，禁止 `any`（用 `unknown` + 收窄）
- 环境变量一律经 `src/env.ts`（Zod）访问，禁止直接读 `process.env`
- 数据访问分层：`src/server/queries` 只读、`src/server/mutations` 只写；`db`/`auth` 模块标注 `import "server-only"`
- Markdown 渲染只走 `src/lib/markdown.ts` 单一管线，默认禁 raw HTML
- 关键依赖版本精确锁定（package.json 无 `^`），升级走显式提交
- 组件/类型 PascalCase，hooks 用 `use` 前缀，其余文件 kebab-case
