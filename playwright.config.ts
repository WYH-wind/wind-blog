import { defineConfig } from "@playwright/test";

/**
 * E2E 跑在生产构建上（next start -p 3100），依赖 .next 已构建。
 * 复用本地 Postgres 与 .env（与开发库同库，测试数据自行清理）。
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3100",
    locale: "zh-CN",
  },
  webServer: {
    command: "pnpm exec next start -p 3100",
    port: 3100,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
