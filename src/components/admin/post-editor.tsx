"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { slugFromTitle } from "@/lib/slug";
import { savePostAction } from "@/server/actions/posts";
import { previewMarkdownAction } from "@/server/actions/preview";

export type PostEditorInitial = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover: string;
  status: "DRAFT" | "PUBLISHED";
  pinned: boolean;
  pinOrder: number;
  tags: string[];
};

const field =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent/50";

export function PostEditor({ initial }: { initial: PostEditorInitial | null }) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initial?.status ?? "DRAFT");
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [pinOrder, setPinOrder] = useState(initial?.pinOrder ?? 0);
  const [tagsText, setTagsText] = useState(initial?.tags.join(", ") ?? "");

  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // 预览 debounce 300ms，走与前台一致的渲染管线（Server Action）
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setPreviewHtml(await previewMarkdownAction(content));
      } catch {
        setPreviewHtml("<p>预览失败，请重试</p>");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [content]);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugFromTitle(value));
  }

  async function insertImage(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? "上传失败" });
        return;
      }
      const ta = contentRef.current;
      const pos = ta?.selectionStart ?? content.length;
      const snippet = `\n![](${data.url})\n`;
      setContent(content.slice(0, pos) + snippet + content.slice(pos));
      setMessage({ ok: true, text: "图片已插入" });
    } catch {
      setMessage({ ok: false, text: "上传失败" });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const result = await savePostAction(initial?.id ?? null, {
        title,
        slug,
        summary,
        content,
        cover,
        status,
        pinned,
        pinOrder,
        tags: tagsText.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      });
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      if (!initial) {
        router.replace(`/admin/posts/${result.id}/edit`);
        router.refresh();
      }
      setMessage({ ok: true, text: "已保存" });
    } catch {
      setMessage({ ok: false, text: "保存失败，请重试" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl tracking-wide">
          {initial ? "编辑文章" : "新建文章"}
        </h1>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm ${message.ok ? "text-accent" : "text-red-500"}`}>
              {message.text}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-full border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:text-accent lg:hidden"
          >
            {showPreview ? "编辑" : "预览"}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-accent px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 编辑栏 */}
        <div className={`space-y-4 ${showPreview ? "hidden lg:block" : ""}`}>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="标题"
            aria-label="标题"
            className={`${field} font-heading text-lg`}
          />
          <div className="flex flex-wrap gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <span className="shrink-0 font-mono text-xs text-muted">/posts/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                placeholder="自动生成，可手动改"
                aria-label="slug"
                className={`${field} font-mono text-xs`}
              />
            </div>
          </div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="摘要（列表页展示，可留空）"
            aria-label="摘要"
            rows={2}
            className={field}
          />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
              aria-label="状态"
              className={`${field} w-auto`}
            >
              <option value="DRAFT">草稿</option>
              <option value="PUBLISHED">发布</option>
            </select>
            <label className="flex items-center gap-1.5 text-muted">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              置顶
            </label>
            {pinned && (
              <input
                type="number"
                min={0}
                max={999}
                value={pinOrder}
                onChange={(e) => setPinOrder(Number(e.target.value) || 0)}
                aria-label="置顶顺序"
                className={`${field} w-20`}
              />
            )}
          </div>
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="标签，逗号分隔（如：Next.js, 前端）"
            aria-label="标签"
            className={field}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-accent disabled:opacity-60"
            >
              {uploading ? "上传中…" : "插入图片"}
            </button>
            <input
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="封面图 URL（可选）"
              aria-label="封面"
              className={`${field} min-w-0 flex-1 font-mono text-xs`}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void insertImage(file);
                e.target.value = "";
              }}
            />
          </div>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="正文（Markdown）"
            aria-label="正文"
            className={`${field} min-h-[50vh] font-mono leading-6`}
          />
        </div>

        {/* 预览栏 */}
        <div className={`space-y-2 ${showPreview ? "" : "hidden lg:block"}`}>
          <p className="text-xs text-muted">实时预览（与前台渲染一致）</p>
          <div className="min-h-[60vh] rounded-xl border border-line bg-surface p-5">
            <div
              className="prose prose-zinc max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
