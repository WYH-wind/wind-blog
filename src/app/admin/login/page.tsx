"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/server/auth/actions";
import { WindLines } from "@/components/wind-lines";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className="relative mx-auto flex min-h-[65vh] max-w-sm flex-col justify-center">
      <WindLines className="pointer-events-none absolute inset-x-0 -top-10 w-full opacity-70" />
      <div className="relative space-y-6 text-center">
        <h1 className="font-heading text-2xl tracking-wide">登录 Wind 后台</h1>
        <form action={formAction} className="space-y-3 text-left">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="管理员密码"
            aria-label="管理员密码"
            className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent/50"
          />
          {state.error && <p className="text-sm text-red-500">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "登录中…" : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
