"use client";

import { useLocale } from "@/lib/use-locale";
import { getDictionary } from "@/messages";

export function SiteFooter({ siteName, footerText }: { siteName: string; footerText: string }) {
  const t = getDictionary(useLocale());
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto w-full max-w-2xl space-y-1 px-6 py-8 text-sm text-muted">
        <p>{footerText}</p>
        <p className="text-xs text-muted/80">{t.footer.privacy}</p>
        <p>
          © {year} {siteName}
        </p>
      </div>
    </footer>
  );
}
