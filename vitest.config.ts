import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // 单测运行在纯 Node，stub 掉 RSC 专用的 server-only 哨兵
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
