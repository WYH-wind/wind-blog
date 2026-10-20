"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { SearchDialog } from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocale } from "@/lib/use-locale";
import { getDictionary, localePath, stripLocalePath } from "@/messages";

function LocaleSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const names = getDictionary(locale).locale;
  const next = locale === "en" ? "zh" : "en";

  const query = searchParams.toString();
  const base = stripLocalePath(pathname);
  const href = localePath(next, base);
  const hrefWithQuery = query ? `${href}?${query}` : href;

  return (
    <Link
      href={hrefWithQuery}
      hrefLang={next}
      aria-label={names[next]}
      title={names[next]}
      className="shrink-0 rounded-full px-1.5 py-1 font-mono text-xs text-muted transition-colors hover:text-accent"
    >
      {next === "en" ? "EN" : "中"}
    </Link>
  );
}

export function SiteHeader({ siteName }: { siteName: string }) {
  const locale = useLocale();
  const t = getDictionary(locale);

  const NAV_ITEMS = [
    { href: "/", label: t.nav.home },
    { href: "/tags", label: t.nav.tags },
    { href: "/archives", label: t.nav.archives },
    { href: "/links", label: t.nav.links },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-line/70 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-2 px-6">
        <Link
          href={localePath(locale, "/")}
          className="shrink-0 font-heading text-xl tracking-wide text-foreground transition-colors hover:text-accent"
        >
          {siteName}
        </Link>
        <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">
          {/* 只有导航链接可横向滑动；右侧图标组固定可见 */}
          <nav className="flex min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto text-[13px] [scrollbar-width:none] sm:gap-1 sm:text-sm [&::-webkit-scrollbar]:hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                hrefLang={locale}
                className="shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-muted transition-colors hover:text-accent sm:px-2.5"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Suspense fallback={null}>
            <LocaleSwitcher />
          </Suspense>
          <SearchDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
