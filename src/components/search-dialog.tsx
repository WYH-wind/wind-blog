"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { formatDateShort } from "@/lib/date";

type SearchHitDto = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  matched: "title" | "summary" | "content";
};

const MATCHED_LABEL = { summary: "摘要", content: "正文" } as const;

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 关键词高亮（仅展示层，纯文本拆分，无注入面） */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="rounded bg-accent-soft px-0.5 text-accent">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** 全局搜索：点击头部图标后在页面顶端弹出，任意页面可用（原独立 /search 页已移除） */
export function SearchDialog() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHitDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHits([]);
    setActiveIndex(0);
  }, []);

  // 打开时锁定背景滚动并聚焦输入框
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // 防抖 300ms 即搜；AbortController 取消过期请求。
  // 状态变更全部放在定时器回调里（异步上下文），q 为空时渲染层已直接显示提示，无需在 effect 体内清状态
  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = query.trim().slice(0, 50);
      if (!open || !q) {
        setHits([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (res.ok) {
          setHits(data.hits ?? []);
          setActiveIndex(0);
        } else {
          setHits([]);
        }
      } catch {
        /* 被新请求取消或网络失败：保留现状 */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, open]);

  function openHit(hit: SearchHitDto | undefined) {
    if (!hit) return;
    close();
    router.push(`/posts/${hit.slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      openHit(hits[activeIndex] ?? hits[0]);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="搜索"
        title="搜索"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full p-2 text-muted transition-colors hover:bg-accent-soft hover:text-accent"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.8-3.8" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="站内搜索">
          <div
            className="absolute inset-0 bg-black/25 motion-reduce:transition-none"
            onClick={close}
          />
          <div className="absolute inset-x-0 top-14 mx-auto w-[min(92vw,40rem)]">
            <div className="wind-dialog overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
              <div className="flex items-center gap-2 border-b border-line px-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="h-4 w-4 shrink-0 text-muted"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.8-3.8" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  maxLength={50}
                  placeholder="搜索标题、摘要与正文…"
                  aria-label="搜索关键词"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted/70"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="关闭搜索"
                  className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-xs text-muted transition-colors hover:text-foreground"
                >
                  Esc
                </button>
              </div>

              <div className="max-h-[min(60vh,26rem)] overflow-y-auto">
                {query.trim() === "" ? (
                  <p className="px-4 py-6 text-sm text-muted">
                    输入关键词，搜索全部文章——含标题、摘要与正文。
                  </p>
                ) : loading ? (
                  <p className="px-4 py-6 text-sm text-muted">搜索中…</p>
                ) : hits.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted">没有找到「{query.trim()}」相关文章。</p>
                ) : (
                  <ul>
                    {hits.map((hit, i) => (
                      <li key={hit.slug} className="border-b border-line/60 last:border-b-0">
                        <Link
                          href={`/posts/${hit.slug}`}
                          onClick={close}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={`flex flex-col gap-0.5 px-4 py-2.5 transition-colors ${
                            i === activeIndex ? "bg-accent-soft/60" : ""
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                              <Highlight text={hit.title} query={query.trim()} />
                            </span>
                            {hit.matched !== "title" && (
                              <span className="shrink-0 rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[10px] text-muted dark:bg-white/[0.08]">
                                {MATCHED_LABEL[hit.matched]}
                              </span>
                            )}
                            {hit.publishedAt && (
                              <span className="shrink-0 font-mono text-[11px] text-muted">
                                {formatDateShort(new Date(hit.publishedAt))}
                              </span>
                            )}
                          </span>
                          {hit.summary && (
                            <span className="truncate text-xs text-muted">
                              <Highlight text={hit.summary} query={query.trim()} />
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-line px-4 py-2 font-mono text-[10px] text-muted/80">
                <span>↑↓ 选择</span>
                <span>↵ 打开</span>
                <span>Esc 关闭</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
