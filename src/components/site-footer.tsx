export function SiteFooter({ siteName, footerText }: { siteName: string; footerText: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto w-full max-w-2xl space-y-1 px-6 py-8 text-sm text-muted">
        <p>{footerText}</p>
        <p className="text-xs text-muted/80">
          本站不保存访客 IP，仅以匿名标识进行点赞、收藏与浏览去重。
        </p>
        <p>
          © {year} {siteName}
        </p>
      </div>
    </footer>
  );
}
