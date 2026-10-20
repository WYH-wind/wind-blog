"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createFriendLinkAction,
  deleteFriendLinkAction,
  toggleFriendLinkVisibleAction,
} from "@/server/actions/friend-links";
import { AdminToast, useAdminToast } from "@/components/admin/toast";

export type AdminLinkItem = {
  id: number;
  name: string;
  url: string;
  description: string;
  sortOrder: number;
  visible: boolean;
};

const field =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent/50";

const emptyForm = { name: "", url: "", description: "", sortOrder: "0" };

/** 友链管理：默认查看（只读），进入编辑模式后可增删改显隐；操作均有成功/失败提示 */
export function LinksPanel({ links }: { links: AdminLinkItem[] }) {
  const router = useRouter();
  const { toast, show } = useAdminToast();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyForm);

  /** 统一执行：防重复提交（pending 期按钮禁用），成功回查看模式，失败留在编辑模式 */
  function run(op: () => Promise<{ ok: true } | { ok: false; error: string }>, okText: string) {
    if (pending) return;
    startTransition(async () => {
      const result = await op();
      if (result.ok) {
        show(true, okText);
        setMode("view");
        router.refresh();
      } else {
        show(false, result.error);
      }
    });
  }

  function addLink() {
    run(
      () =>
        createFriendLinkAction({
          name: form.name.trim(),
          url: form.url.trim(),
          description: form.description.trim(),
          sortOrder: Number(form.sortOrder) || 0,
        }),
      "友链已添加",
    );
  }

  function toggleVisible(link: AdminLinkItem) {
    run(() => toggleFriendLinkVisibleAction(link.id), link.visible ? "已隐藏" : "已显示");
  }

  function removeLink(link: AdminLinkItem) {
    if (!window.confirm(`确认删除友链「${link.name}」？`)) return;
    run(() => deleteFriendLinkAction(link.id), "已删除");
  }

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} />

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-wide">友链管理</h1>
        {mode === "view" ? (
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="rounded-full bg-accent px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90"
          >
            编辑
          </button>
        ) : (
          <span className="text-xs text-muted">编辑模式 · 操作成功后自动返回</span>
        )}
      </div>

      {mode === "edit" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addLink();
          }}
          className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2"
        >
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="名称"
            required
            aria-label="名称"
            className={field}
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            type="url"
            placeholder="https://example.com"
            required
            aria-label="链接"
            className={field}
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="描述（可选）"
            aria-label="描述"
            className={field}
          />
          <input
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            type="number"
            min={0}
            max={999}
            aria-label="排序"
            className={field}
          />
          <button
            type="submit"
            disabled={pending}
            className="justify-self-start rounded-full bg-accent px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60 sm:col-span-2"
          >
            {pending ? "处理中…" : "添加友链"}
          </button>
        </form>
      )}

      {links.length === 0 ? (
        <p className="text-muted">
          {mode === "view" ? "还没有友链，点「编辑」开始添加。" : "还没有友链，用上方表单添加。"}
        </p>
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
                {link.description && <p className="mt-0.5 text-sm text-muted">{link.description}</p>}
              </div>
              {mode === "edit" && (
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggleVisible(link)}
                    className="rounded-full border border-line px-2.5 py-1 text-muted transition-colors hover:text-accent disabled:opacity-50"
                  >
                    {link.visible ? "隐藏" : "显示"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => removeLink(link)}
                    className="rounded-full px-2.5 py-1 text-muted transition-colors hover:text-red-500 disabled:opacity-50"
                  >
                    删除
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {mode === "edit" && links.length > 0 && (
        <p className="text-xs text-muted">排序值越小越靠前；隐藏后前台不再展示。</p>
      )}
    </div>
  );
}
