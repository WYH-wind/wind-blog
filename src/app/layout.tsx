import type { Metadata } from "next";
import Link from "next/link";
import { ThemeProvider } from "next-themes";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wind",
    template: "%s - Wind",
  },
  description: "简洁、轻盈、流动的个人博客。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <header className="mx-auto w-full max-w-2xl px-6 pt-10">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Wind
            </Link>
          </header>
          <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">{children}</main>
          <footer className="mx-auto w-full max-w-2xl px-6 pb-10 text-sm text-zinc-500 dark:text-zinc-400">
            简洁、轻盈、流动
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
