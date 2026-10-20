import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "lxgw-wenkai-screen-webfont/lxgwwenkaiscreen.css";
import "./globals.css";

import { env } from "@/env";

// 前台公共布局（header/main/footer）在 (site) 路由组：zh 与 /en 两棵树共用；
// admin 在组外，不渲染站点头尾。每页的 hreflang/RSS 由各 view 的 metadata 提供。

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: "Wind",
    template: "%s - Wind",
  },
  description: "简洁、轻盈、流动的个人博客。",
  openGraph: {
    type: "website",
    siteName: "Wind",
    locale: "zh_CN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
