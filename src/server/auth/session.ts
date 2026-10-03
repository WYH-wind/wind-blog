import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { env, isProd } from "@/env";

// __Host- 前缀要求 Secure + 无 Domain + Path=/（生产满足）；本地 http 开发降级
export const SESSION_COOKIE_NAME = isProd ? "__Host-wind-session" : "wind-session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sessionSecret(): Uint8Array {
  return new TextEncoder().encode(env.SESSION_SECRET);
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(sessionSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, sessionSecret());
    return true;
  } catch {
    return false;
  }
}
