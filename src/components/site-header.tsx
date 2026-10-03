import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/tags", label: "标签" },
  { href: "/archives", label: "归档" },
  { href: "/links", label: "友链" },
  { href: "/about", label: "关于" },
];

export function SiteHeader({ siteName }: { siteName: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line/70 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-heading text-xl tracking-wide text-foreground transition-colors hover:text-accent"
        >
          {siteName}
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2.5 py-1 text-muted transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            aria-label="搜索"
            title="搜索"
            className="rounded-full p-2 text-muted transition-colors hover:bg-accent-soft hover:text-accent"
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
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
