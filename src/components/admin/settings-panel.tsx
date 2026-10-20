"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveSettingsAction } from "@/server/actions/settings";
import { AdminToast, useAdminToast } from "@/components/admin/toast";
import type { SettingKey } from "@/lib/settings-schema";

type SiteSettingsMap = Record<SettingKey, string>;

const field =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent/50";

/** 站点设置：默认查看（只读），「编辑」进入编辑模式；保存成功回查看，失败留在编辑模式 */
export function SettingsPanel({
  settings,
  aboutHtml,
}: {
  settings: SiteSettingsMap;
  aboutHtml: string;
}) {
  const router = useRouter();
  const { toast, show } = useAdminToast();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [draft, setDraft] = useState<SiteSettingsMap>(settings);
  const [pending, startTransition] = useTransition();

  function enterEdit() {
    setDraft(settings); // 以最新值为编辑起点
    setMode("edit");
  }

  function save() {
    if (pending) return;
    startTransition(async () => {
      const result = await saveSettingsAction(draft);
      if (result.ok) {
        show(true, "设置已保存");
        setMode("view");
        router.refresh(); // 让服务端重新渲染（查看模式的关于页 HTML 等随之更新）
      } else {
        show(false, result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} />

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-wide">站点设置</h1>
        {mode === "view" ? (
          <button
            type="button"
            onClick={enterEdit}
            className="rounded-full bg-accent px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90"
          >
            编辑
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("view")}
              disabled={pending}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-60"
            >
              取消
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="rounded-full bg-accent px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "保存中…" : "保存设置"}
            </button>
          </div>
        )}
      </div>

      {mode === "view" ? (
        <div className="space-y-4">
          <div className="space-y-3 rounded-xl border border-line bg-surface p-4 text-sm">
            <MetaRow label="站点名称" value={settings["site.name"]} />
            <MetaRow label="一句话简介" value={settings["site.description"]} />
            <MetaRow label="头像 URL" value={settings["site.avatar"]} mono />
            <MetaRow label="GitHub 主页" value={settings["site.github"]} mono />
            <MetaRow label="联系邮箱" value={settings["site.email"]} mono />
            <MetaRow label="页脚文案" value={settings["site.footer"]} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted">关于页（Markdown）</p>
            <div
              className="prose prose-zinc max-w-none rounded-xl border border-line bg-surface p-4 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: aboutHtml }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm text-muted">站点名称</span>
            <input
              value={draft["site.name"]}
              onChange={(e) => setDraft({ ...draft, "site.name": e.target.value })}
              className={field}
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-muted">一句话简介</span>
            <input
              value={draft["site.description"]}
              onChange={(e) => setDraft({ ...draft, "site.description": e.target.value })}
              className={field}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-muted">头像 URL</span>
            <input
              value={draft["site.avatar"]}
              onChange={(e) => setDraft({ ...draft, "site.avatar": e.target.value })}
              className={`${field} font-mono text-xs`}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-muted">GitHub 主页</span>
            <input
              value={draft["site.github"]}
              onChange={(e) => setDraft({ ...draft, "site.github": e.target.value })}
              className={`${field} font-mono text-xs`}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-muted">联系邮箱</span>
            <input
              value={draft["site.email"]}
              onChange={(e) => setDraft({ ...draft, "site.email": e.target.value })}
              className={`${field} font-mono text-xs`}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-muted">页脚文案</span>
            <input
              value={draft["site.footer"]}
              onChange={(e) => setDraft({ ...draft, "site.footer": e.target.value })}
              className={field}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-muted">关于页（Markdown）</span>
            <textarea
              value={draft["site.about"]}
              onChange={(e) => setDraft({ ...draft, "site.about": e.target.value })}
              rows={10}
              className={`${field} font-mono leading-6`}
            />
          </label>
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="shrink-0 text-muted">{label}</span>
      <span className={`min-w-0 truncate text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value || <span className="text-muted/60">未设置</span>}
      </span>
    </div>
  );
}
