"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { WindLines } from "@/components/wind-lines";
import { getDictionary, localeFromPath, localePath } from "@/messages";

export default function NotFound() {
  // 根级 404 无路由上下文，用路径推断语言（/en/* → 英文）
  const locale = localeFromPath(usePathname());
  const t = getDictionary(locale);

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-4 py-20 text-center">
      <WindLines className="pointer-events-none absolute inset-x-0 top-4 w-full opacity-70" />
      <p className="relative font-mono text-sm text-muted">{t.notFound.code}</p>
      <h1 className="relative font-heading text-3xl tracking-wide">{t.notFound.title}</h1>
      <p className="relative text-muted">{t.notFound.body}</p>
      <Link
        href={localePath(locale, "/")}
        className="relative rounded-full border border-accent/40 px-4 py-1.5 text-sm text-accent transition-colors hover:bg-accent-soft"
      >
        {t.notFound.back}
      </Link>
    </div>
  );
}
