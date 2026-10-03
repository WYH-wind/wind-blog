import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "lxgw-wenkai-screen-webfont/lxgwwenkaiscreen.css";
import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { env } from "@/env";
import { getSettings } from "@/server/queries/settings";

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: "Wind",
    template: "%s - Wind",
  },
  description: "简洁、轻盈、流动的个人博客。",
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    type: "website",
    siteName: "Wind",
    locale: "zh_CN",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader siteName={settings["site.name"]} />
          <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">{children}</main>
          <SiteFooter siteName={settings["site.name"]} footerText={settings["site.footer"]} />
        </ThemeProvider>
      </body>
    </html>
  );
}
