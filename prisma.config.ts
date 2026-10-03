import "dotenv/config";

import path from "node:path";

import { defineConfig, env } from "prisma/config";

// Prisma 7：schema 不再写 url，迁移/seed 的连接在此提供；
// 应用运行时连接由 src/server/db.ts 的 driver adapter 提供。
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
