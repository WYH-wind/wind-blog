"use client";

import { useEffect, useState } from "react";

type Kind = "LIKE" | "FAVORITE";
type Counts = Record<Kind, number>;
type Mine = Record<Kind, boolean>;

const EMPTY_COUNTS: Counts = { LIKE: 0, FAVORITE: 0 };
const EMPTY_MINE: Mine = { LIKE: false, FAVORITE: false };

export function PostReactions({ slug, initialViews }: { slug: string; initialViews: number }) {
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [mine, setMine] = useState<Mine>(EMPTY_MINE);
  const [views, setViews] = useState<number>(initialViews);
  const [busyKind, setBusyKind] = useState<Kind | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [reactionsRes, viewRes] = await Promise.all([
          fetch(`/api/posts/${slug}/reactions`),
          fetch(`/api/posts/${slug}/view`, { method: "POST" }),
        ]);
        if (!alive) return;
        if (reactionsRes.ok) {
          const data = await reactionsRes.json();
          setCounts(data.counts);
          setMine(data.mine);
        }
        if (viewRes.ok) {
          const data = await viewRes.json();
          setViews(data.views);
        }
      } catch {
        // 网络失败静默：计数展示不影响阅读
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  async function toggle(kind: Kind) {
    if (busyKind) return;
    setBusyKind(kind);

    // 乐观更新，失败回滚
    const prevCounts = counts;
    const prevMine = mine;
    setCounts((c) => ({ ...c, [kind]: c[kind] + (mine[kind] ? -1 : 1) }));
    setMine((m) => ({ ...m, [kind]: !m[kind] }));

    try {
      const res = await fetch(`/api/posts/${slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts);
        setMine((m) => ({ ...m, [kind]: data.active }));
      } else {
        setCounts(prevCounts);
        setMine(prevMine);
      }
    } catch {
      setCounts(prevCounts);
      setMine(prevMine);
    } finally {
      setBusyKind(null);
    }
  }

  const pill = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-60 ${
      active
        ? "border-accent/40 bg-accent-soft text-accent"
        : "border-line text-muted hover:border-accent/40 hover:text-accent"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-line/70 pt-6 text-sm">
      <button
        type="button"
        aria-pressed={mine.LIKE}
        disabled={busyKind !== null}
        onClick={() => toggle("LIKE")}
        className={pill(mine.LIKE)}
      >
        <svg
          viewBox="0 0 24 24"
          fill={mine.LIKE ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M12 20.5s-7.5-4.7-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.3-7.5 10-7.5 10Z" />
        </svg>
        <span>赞</span>
        <span className="font-mono text-xs">{counts.LIKE}</span>
      </button>

      <button
        type="button"
        aria-pressed={mine.FAVORITE}
        disabled={busyKind !== null}
        onClick={() => toggle("FAVORITE")}
        className={pill(mine.FAVORITE)}
      >
        <svg
          viewBox="0 0 24 24"
          fill={mine.FAVORITE ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M6.5 3.5h11v17l-5.5-4-5.5 4v-17Z" />
        </svg>
        <span>收藏</span>
        <span className="font-mono text-xs">{counts.FAVORITE}</span>
      </button>

      <span className="ml-auto font-mono text-xs text-muted">{views} 次浏览</span>
    </div>
  );
}
