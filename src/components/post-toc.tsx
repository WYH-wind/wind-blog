"use client";

import { useEffect, useRef, useState } from "react";

import type { TocItem } from "@/lib/markdown";

/** 文章页左侧目录：粘性定位，滚动时高亮当前小节（scroll-spy） */
export function PostToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  // 点击目录项后短暂锁定 scroll-spy：平滑滚动途中位置尚未越线，避免高亮闪回上一节
  const lockUntilRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (Date.now() < lockUntilRef.current) return;
        // 已滚到页底：整页剩余空间不足以把最后几节顶到线上，直接点亮最后一节
        const doc = document.documentElement;
        if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
          setActiveId(items[items.length - 1]?.id ?? "");
          return;
        }
        let current = items[0]?.id ?? "";
        for (const item of items) {
          const el = document.getElementById(item.id);
          if (!el) continue;
          // 标题越过头部下沿即视为「已读过」，最后一个满足的即当前小节
          if (el.getBoundingClientRect().top <= 96) current = item.id;
          else break;
        }
        setActiveId(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <nav
      aria-label="目录"
      className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-4 text-sm"
    >
      <p className="mb-2 text-xs tracking-[0.2em] text-muted">目录</p>
      <ul className="space-y-1 border-l border-line">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} style={{ paddingLeft: `${(item.depth - 2) * 12 + 12}px` }}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                title={item.text}
                onClick={() => {
                  setActiveId(item.id);
                  lockUntilRef.current = Date.now() + 1200;
                }}
                className={`block truncate py-0.5 transition-colors ${
                  active ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
