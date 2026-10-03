"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const toolButton =
  "min-w-7 rounded-md px-1.5 py-1 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-accent";

const COLOR_SWATCHES = [
  { name: "red", label: "红色" },
  { name: "orange", label: "橙色" },
  { name: "green", label: "绿色" },
  { name: "blue", label: "蓝色" },
  { name: "violet", label: "紫色" },
] as const;

type ToolKey =
  | "h2"
  | "h3"
  | "bold"
  | "italic"
  | "strike"
  | "mark"
  | "quote"
  | "list"
  | "code"
  | "codeBlock"
  | "link"
  | "hr";

const TOOLS: { key: ToolKey; label: string; title: string; className?: string }[] = [
  { key: "h2", label: "H2", title: "二级标题" },
  { key: "h3", label: "H3", title: "三级标题" },
  { key: "bold", label: "B", title: "加粗（⌘B）", className: "font-bold" },
  { key: "italic", label: "I", title: "斜体（⌘I）", className: "italic" },
  { key: "strike", label: "S", title: "删除线", className: "line-through" },
  { key: "mark", label: "高亮", title: "高亮（:mark[]）" },
  { key: "quote", label: "引用", title: "引用" },
  { key: "list", label: "列表", title: "无序列表" },
  { key: "code", label: "代码", title: "行内代码" },
  { key: "codeBlock", label: "代码块", title: "代码块" },
  { key: "link", label: "链接", title: "链接" },
  { key: "hr", label: "分割线", title: "分割线" },
];

export function PostEditor({
  initial,
  allTags,
}: {
  initial: PostEditorInitial | null;
  allTags: { id: number; name: string }[];
}) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [pinOrder, setPinOrder] = useState(initial?.pinOrder ?? 0);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [newTag, setNewTag] = useState("");

  const isPublished = initial?.status === "PUBLISHED";
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
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

  // 已选之外的标签：文中出现过的排前面（「从文中提取」），其余归「现有标签」
  const { suggested, rest } = useMemo(() => {
    const haystack = `${title}\n${content}`;
    const unselected = allTags.map((t) => t.name).filter((n) => !tags.includes(n));
    const suggested = unselected.filter((n) => haystack.includes(n));
    const rest = unselected.filter((n) => !haystack.includes(n));
    return { suggested, rest };
  }, [allTags, tags, title, content]);

  function addTag(raw: string) {
    const name = raw.trim().slice(0, 20);
    if (!name) return;
    setTags((ts) => (ts.includes(name) ? ts : [...ts, name]));
  }

  function removeTag(name: string) {
    setTags((ts) => ts.filter((t) => t !== name));
  }

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugFromTitle(value));
  }

  /** 用 markdown 包裹选区（或插入占位文本），完成后焦点与选区还原 */
  function applyWrap(before: string, after: string, placeholder: string) {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? start;
    const selected = content.slice(start, end) || placeholder;
    setContent(content.slice(0, start) + before + selected + after + content.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  /** 给选区所在的每一行行首加前缀（标题/引用/列表） */
  function applyLinePrefix(prefix: string) {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? start;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const nextBreak = content.indexOf("\n", end);
    const blockEnd = nextBreak === -1 ? content.length : nextBreak;
    const lines = content.slice(lineStart, blockEnd).split("\n");
    const allHave = lines.every((line) => line.startsWith(prefix));
    const replaced = lines
      .map((line) => (allHave ? line.slice(prefix.length) : prefix + line))
      .join("\n");
    setContent(content.slice(0, lineStart) + replaced + content.slice(blockEnd));
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

  /**
   * 保存：草稿直接保存；发布需二次确认，成功后跳到前台文章页。
   * 已发布文章「保存修改」保持发布态，「转为草稿」需确认（前台立即不可见）。
   */
  async function save(target: "DRAFT" | "PUBLISHED") {
    if (target === "PUBLISHED" && !window.confirm("确认发布？发布后前台立即可见。")) return;
    if (target === "DRAFT" && isPublished && !window.confirm("转为草稿后前台将不可见，确认？")) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const result = await savePostAction(initial?.id ?? null, {
        title,
        slug,
        summary,
        content,
        cover,
        status: target,
        pinned,
        pinOrder,
        tags,
      });
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      if (target === "PUBLISHED") {
        if (!initial) router.replace(`/admin/posts/${result.id}/edit`);
        router.push(`/posts/${result.slug}`);
        return;
      }
      if (!initial) {
        router.replace(`/admin/posts/${result.id}/edit`);
      }
      router.refresh();
      setMessage({ ok: true, text: "已保存为草稿" });
    } catch {
      setMessage({ ok: false, text: "保存失败，请重试" });
    } finally {
      setSaving(false);
    }
  }

  /** 工具栏入口：按 key 分发到对应的包裹/行前缀操作（仅在事件回调中执行） */
  function runTool(key: ToolKey) {
    switch (key) {
      case "h2":
        return applyLinePrefix("## ");
      case "h3":
        return applyLinePrefix("### ");
      case "bold":
        return applyWrap("**", "**", "加粗文字");
      case "italic":
        return applyWrap("*", "*", "斜体文字");
      case "strike":
        return applyWrap("~~", "~~", "删除文字");
      case "mark":
        return applyWrap(":mark[", "]", "高亮文字");
      case "quote":
        return applyLinePrefix("> ");
      case "list":
        return applyLinePrefix("- ");
      case "code":
        return applyWrap("`", "`", "code");
      case "codeBlock":
        return applyWrap("\n```ts\n", "\n```\n", "// 代码");
      case "link":
        return applyWrap("[", "](https://)", "链接文字");
      case "hr":
        return applyWrap("\n---\n", "", "");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 顶栏：标题 + 操作按钮 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl tracking-wide">{initial ? "编辑文章" : "新建文章"}</h1>
        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => save("DRAFT")}
            disabled={saving}
            className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-60"
          >
            {isPublished ? "保存修改" : "保存草稿"}
          </button>
          {isPublished ? (
            <button
              type="button"
              onClick={() => save("DRAFT")}
              disabled={saving}
              className="rounded-full border border-red-500/30 px-4 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-60"
            >
              转为草稿
            </button>
          ) : (
            <button
              type="button"
              onClick={() => save("PUBLISHED")}
              disabled={saving}
              className="rounded-full bg-accent px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              发布
            </button>
          )}
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="标题"
        aria-label="标题"
        className={`${field} font-heading text-xl`}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* 左：工具栏 + 大编辑区 */}
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-0.5 rounded-xl border border-line bg-surface px-2 py-1.5">
            {TOOLS.map((tool) => (
              <button
                key={tool.key}
                type="button"
                title={tool.title}
                aria-label={tool.title}
                onClick={() => runTool(tool.key)}
                className={`${toolButton} ${tool.className ?? ""}`}
              >
                {tool.label}
              </button>
            ))}
            <div className="relative">
              <button
                type="button"
                title="文字颜色"
                aria-label="文字颜色"
                aria-haspopup="menu"
                aria-expanded={colorOpen}
                onClick={() => setColorOpen((v) => !v)}
                className={`${toolButton} font-semibold`}
              >
                A
                <span className="mx-auto block h-0.5 w-3.5 rounded bg-gradient-to-r from-red-500 via-blue-500 to-violet-500" />
              </button>
              {colorOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 flex items-center gap-1.5 rounded-xl border border-line bg-surface p-2 shadow-lg">
                  {COLOR_SWATCHES.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      title={color.label}
                      aria-label={color.label}
                      onClick={() => {
                        applyWrap(`:${color.name}[`, "]", "彩色文字");
                        setColorOpen(false);
                      }}
                      className="h-5 w-5 rounded-full ring-1 ring-line transition-transform hover:scale-110"
                      style={{ background: `var(--wind-c-${color.name})` }}
                    />
                  ))}
                </div>
              )}
            </div>
            <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />
            <button
              type="button"
              title="插入图片"
              aria-label="插入图片"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={toolButton}
            >
              {uploading ? "上传中…" : "图片"}
            </button>
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
            onKeyDown={(e) => {
              if (!(e.metaKey || e.ctrlKey)) return;
              const key = e.key.toLowerCase();
              if (key === "b") {
                e.preventDefault();
                applyWrap("**", "**", "加粗文字");
              } else if (key === "i") {
                e.preventDefault();
                applyWrap("*", "*", "斜体文字");
              }
            }}
            placeholder="正文（Markdown，支持 :red[文字] 变色、:mark[文字] 高亮）"
            aria-label="正文"
            className={`${field} h-[calc(100vh-380px)] min-h-[360px] resize-y font-mono leading-6`}
          />
        </div>

        {/* 右：元信息 + 预览 */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
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
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="摘要（列表页展示，可留空）"
              aria-label="摘要"
              rows={2}
              className={field}
            />

            {/* 标签选择器 */}
            <div className="space-y-2 rounded-xl border border-line bg-surface p-3">
              <div className="flex min-h-7 flex-wrap items-center gap-1.5">
                {tags.length === 0 ? (
                  <span className="text-xs text-muted">尚未选择标签</span>
                ) : (
                  tags.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent"
                    >
                      {name}
                      <button
                        type="button"
                        aria-label={`移除标签 ${name}`}
                        onClick={() => removeTag(name)}
                        className="transition-colors hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(newTag);
                      setNewTag("");
                    }
                  }}
                  placeholder="新标签，回车添加"
                  aria-label="新标签"
                  className={field}
                />
                <button
                  type="button"
                  onClick={() => {
                    addTag(newTag);
                    setNewTag("");
                  }}
                  className="shrink-0 rounded-xl border border-line px-3 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  添加
                </button>
              </div>
              {suggested.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted">从文中提取：</span>
                  {suggested.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => addTag(name)}
                      className="rounded-full border border-dashed border-accent/40 px-2.5 py-1 text-xs text-accent transition-colors hover:bg-accent-soft"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              )}
              {rest.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="shrink-0 text-xs text-muted">现有标签：</span>
                  {rest.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => addTag(name)}
                      className="rounded-full border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="封面图 URL（可选）"
                aria-label="封面"
                className={`${field} min-w-0 flex-1 font-mono text-xs`}
              />
            </div>
            <div className="flex items-center gap-3 text-sm">
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
          </div>

          <div
            className={`min-w-0 flex-1 flex-col gap-2 ${showPreview ? "flex" : "hidden lg:flex"}`}
          >
            <p className="text-xs text-muted">实时预览（与前台渲染一致）</p>
            <div className="flex-1 overflow-y-auto rounded-xl border border-line bg-surface p-5">
              <div
                className="prose prose-zinc max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
