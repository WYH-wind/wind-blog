import {
  createFriendLinkAction,
  deleteFriendLinkAction,
  toggleFriendLinkVisibleAction,
} from "@/server/actions/friend-links";
import { listAllFriendLinks } from "@/server/queries/friend-links";

const field =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent/50";

export default async function AdminLinksPage() {
  const links = await listAllFriendLinks();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="font-heading text-2xl tracking-wide">友链管理</h1>

      <form
        action={createFriendLinkAction}
        className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2"
      >
        <input name="name" placeholder="名称" required aria-label="名称" className={field} />
        <input
          name="url"
          type="url"
          placeholder="https://example.com"
          required
          aria-label="链接"
          className={field}
        />
        <input name="description" placeholder="描述（可选）" aria-label="描述" className={field} />
        <input
          name="sortOrder"
          type="number"
          min={0}
          max={999}
          defaultValue={0}
          aria-label="排序"
          className={field}
        />
        <button
          type="submit"
          className="justify-self-start rounded-full bg-accent px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90 sm:col-span-2"
        >
          添加友链
        </button>
      </form>

      {links.length === 0 ? (
        <p className="text-muted">还没有友链。</p>
      ) : (
        <ul className="divide-y divide-line/70">
          {links.map((link) => (
            <li key={link.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-heading">
                  {link.name}{" "}
                  {!link.visible && (
                    <span className="ml-1 rounded-full border border-line px-1.5 py-0.5 text-xs text-muted">
                      已隐藏
                    </span>
                  )}
                </p>
                <p className="truncate font-mono text-xs text-muted">{link.url}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs">
                <form action={toggleFriendLinkVisibleAction}>
                  <input type="hidden" name="id" value={link.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-2.5 py-1 text-muted transition-colors hover:text-accent"
                  >
                    {link.visible ? "隐藏" : "显示"}
                  </button>
                </form>
                <form action={deleteFriendLinkAction}>
                  <input type="hidden" name="id" value={link.id} />
                  <button
                    type="submit"
                    className="rounded-full px-2.5 py-1 text-muted transition-colors hover:text-red-500"
                  >
                    删除
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
