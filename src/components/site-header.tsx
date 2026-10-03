import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/tags", label: "标签" },
  { href: "/archives", label: "归档" },
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
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
