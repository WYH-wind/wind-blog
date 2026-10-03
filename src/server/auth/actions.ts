"use server";

import { verify } from "@node-rs/argon2";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { createSession, destroySession } from "@/server/auth/session";
import { rateLimit } from "@/server/rate-limit";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { error: "请输入密码" };
  }

  if (!rateLimit(`login-ip:${await clientIpForAction()}`, 5)) {
    return { error: "尝试过于频繁，请一分钟后再试" };
  }

  const hash = env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return {
      error: "尚未配置管理员密码：运行 pnpm admin:hash-password <密码> 并写入 .env",
    };
  }

  // @node-rs/argon2 的 verify 为常量时间比较
  const ok = await verify(hash, password).catch(() => false);
  if (!ok) {
    return { error: "密码不正确" };
  }

  await createSession();
  redirect("/admin");
}

async function clientIpForAction(): Promise<string> {
  // Server Action 无 NextRequest 对象，从 headers 读取（内存限流用，不入库）
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
