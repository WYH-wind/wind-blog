"use server";

import { renderMarkdown } from "@/lib/markdown";
import { requireAdmin } from "@/server/auth/require-admin";

/** 编辑器实时预览：与前台渲染共用同一条管线，返回 sanitized HTML */
export async function previewMarkdownAction(content: string): Promise<string> {
  await requireAdmin();
  const { html } = await renderMarkdown(content.slice(0, 50_000));
  return html;
}
