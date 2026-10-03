import type { Metadata } from "next";
import Link from "next/link";

import { formatDateShort } from "@/lib/date";
import { searchPublishedPosts } from "@/server/queries/posts";

export const metadata: Metadata = { title: "搜索" };

type SearchPageProps = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: rawQ } = await searchParams;
  // 输入约束：≤50 字符（docs/PLAN.md 安全标准）
  const q = (rawQ ?? "").trim().slice(0, 50);
  const hits = q ? await searchPublishedPosts(q) : [];

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl tracking-wide">搜索</h1>

      <form action="/search" method="GET" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          maxLength={50}
          placeholder="搜索文章标题或摘要…"
          aria-label="搜索关键词"
          className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent/50"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
        >
          搜索
        </button>
      </form>

      {q && (
        <p className="text-sm text-muted">
          「{q}」共 {hits.length} 条结果
        </p>
      )}

      {q && hits.length > 0 && (
        <ul className="divide-y divide-line/70">
          {hits.map((hit) => (
            <li key={hit.id} className="group py-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-heading text-base transition-colors group-hover:text-accent">
                  <Link href={`/posts/${hit.slug}`}>{hit.title}</Link>
                </h2>
                {hit.publishedAt && (
                  <time
                    dateTime={hit.publishedAt.toISOString()}
                    className="shrink-0 font-mono text-sm text-muted"
                  >
                    {formatDateShort(hit.publishedAt)}
                  </time>
                )}
              </div>
              <p className="mt-1 text-sm leading-6 text-muted">{hit.summary}</p>
            </li>
          ))}
        </ul>
      )}

      {q && hits.length === 0 && <p className="text-muted">没有找到相关文章，换个关键词试试。</p>}
    </div>
  );
}
