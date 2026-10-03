import "server-only";

import { z } from "zod";

/**
 * 环境变量唯一出口：全项目禁止直接读 process.env，一律 import { env } from "@/env"。
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  SESSION_SECRET: z.string().min(32),
  SITE_URL: z.string().url().default("http://localhost:3000"),
  // 上传图片的本地存储目录（生产环境为挂载卷）
  UPLOAD_DIR: z.string().default("./uploads"),
  // Phase 5 后台启用；缺失时仅前台功能可用
  ADMIN_PASSWORD_HASH: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const isProd = env.NODE_ENV === "production";
