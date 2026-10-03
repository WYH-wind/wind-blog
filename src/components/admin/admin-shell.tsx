import Link from "next/link";

import { logoutAction } from "@/server/auth/actions";

const ADMIN_NAV = [
  { href: "/admin", label: "文章" },
  { href: "/admin/links", label: "友链" },
  { href: "/admin/settings", label: "设置" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
        <nav className="flex items-center gap-1 text-sm">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-accent-soft hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-accent">
            查看站点
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="transition-colors hover:text-red-500">
              退出登录
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
