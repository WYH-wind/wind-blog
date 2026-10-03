import Link from "next/link";

import { WindLines } from "@/components/wind-lines";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center gap-4 py-20 text-center">
      <WindLines className="pointer-events-none absolute inset-x-0 top-4 w-full opacity-70" />
      <p className="relative font-mono text-sm text-muted">404</p>
      <h1 className="relative font-heading text-3xl tracking-wide">风把这一页吹走了</h1>
      <p className="relative text-muted">你要找的页面不存在，或者已经随风而去。</p>
      <Link
        href="/"
        className="relative rounded-full border border-accent/40 px-4 py-1.5 text-sm text-accent transition-colors hover:bg-accent-soft"
      >
        回到首页
      </Link>
    </div>
  );
}
