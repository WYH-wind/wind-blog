import Link from "next/link";
import { notFound } from "next/navigation";

import { ViewToast } from "@/components/admin/view-toast";
import { formatDate } from "@/lib/date";
import { renderMarkdown } from "@/lib/markdown";
import { getPostById } from "@/server/queries/admin";

type AdminPostViewPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ toast?: string }>;
};

/** 后台文章查看页（非编辑模式）：编辑保存成功后回到这里 */
export default async function AdminPostViewPage({ params, searchParams }: AdminPostViewPageProps) {
  const [{ id }, { toast }] = await Promise.all([params, searchParams]);
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const post = await getPostById(numericId);
  if (!post) notFound();

  const { html } = await renderMarkdown(post.content);
  const published = post.status === "PUBLISHED";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ViewToast postPath={`/admin/posts/${post.id}`} toastKey={typeof toast === "string" ? toast : null} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate font-heading text-2xl tracking-wide">{post.title}</h1>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
              published ? "bg-accent-soft text-accent" : "border border-line text-muted"
            }`}
          >
            {published ? "已发布" : "草稿"}
          </span>
          {post.pinned && (
            <span className="shrink-0 rounded-full border border-accent/30 px-1.5 py-0.5 text-xs text-accent">
              置顶
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="rounded-full border border-line px-4 py-1.5 text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            返回列表
          </Link>
          {published && (
            <Link
              href={`/posts/${post.slug}`}
              className="rounded-full border border-line px-4 py-1.5 text-muted transition-colors hover:border-accent/50 hover:text-accent"
            >
              查看前台
            </Link>
          )}
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="rounded-full bg-accent px-4 py-1.5 text-background transition-opacity hover:opacity-90"
          >
            编辑
          </Link>
        </div>
      </div>

      <div className="space-y-2.5 rounded-xl border border-line bg-surface p-4 text-sm">
        <MetaRow label="链接">
          {published ? (
            <Link href={`/posts/${post.slug}`} className="font-mono text-xs text-accent hover:underline">
              /posts/{post.slug}
            </Link>
          ) : (
            <span className="font-mono text-xs text-muted/70">未发布（草稿无前台链接）</span>
          )}
        </MetaRow>
        <MetaRow label="发布时间">
          {post.publishedAt ? formatDate(post.publishedAt) : <span className="text-muted/60">未发布</span>}
        </MetaRow>
        <MetaRow label="最后更新">{formatDate(post.updatedAt)}</MetaRow>
        <MetaRow label="浏览量">{post.views}</MetaRow>
        <MetaRow label="标签">
          {post.tags.length > 0 ? (
            <span className="flex flex-wrap justify-end gap-1.5">
              {post.tags.map(({ tag }) => (
                <span key={tag.id} className="rounded-full bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]">
                  {tag.name}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-muted/60">无</span>
          )}
        </MetaRow>
        <MetaRow label="摘要">
          {post.summary || <span className="text-muted/60">未填写</span>}
        </MetaRow>
        <MetaRow label="封面">
          {post.cover ? <span className="font-mono text-xs">{post.cover}</span> : <span className="text-muted/60">未设置</span>}
        </MetaRow>
      </div>

      <div className="border-t border-line pt-6">
        <p className="mb-3 text-xs tracking-[0.2em] text-muted">正文</p>
        <div
          className="prose prose-zinc max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="min-w-0 text-right">{children}</span>
    </div>
  );
}
