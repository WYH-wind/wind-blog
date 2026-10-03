import Link from "next/link";

import { DeletePostButton } from "@/components/admin/delete-post-button";
import { formatDateShort } from "@/lib/date";
import { listAllPosts } from "@/server/queries/admin";

export default async function AdminDashboard() {
  const posts = await listAllPosts();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-wide">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-accent px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90"
        >
          新建文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted">还没有文章，点右上角「新建文章」开始写作。</p>
      ) : (
        <ul className="divide-y divide-line/70">
          {posts.map((post) => (
            <li key={post.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="font-heading transition-colors hover:text-accent"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 truncate font-mono text-xs text-muted">
                  {post.slug} · {post.views} 浏览
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs">
                {post.publishedAt && (
                  <span className="font-mono text-muted">{formatDateShort(post.publishedAt)}</span>
                )}
                {post.pinned && (
                  <span className="rounded-full border border-accent/30 px-1.5 py-0.5 text-accent">
                    置顶
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    post.status === "PUBLISHED"
                      ? "bg-accent-soft text-accent"
                      : "border border-line text-muted"
                  }`}
                >
                  {post.status === "PUBLISHED" ? "已发布" : "草稿"}
                </span>
                <DeletePostButton id={post.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
