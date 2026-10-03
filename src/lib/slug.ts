import { pinyin } from "pinyin-pro";

export function randomSuffix(): string {
  // slug 后缀非安全敏感（唯一性由服务端数据库约束兜底），无需密码学随机
  return Math.random().toString(36).slice(2, 6);
}

/**
 * 标题 → slug：中文转拼音，保留英文数字；全符号标题回退随机短 ID。
 * 同构实现（服务端与编辑器客户端共用）；冲突由 Server Action 处理。
 * 生成后允许管理员手动改；发布后不自动变化（docs/PLAN.md 数据模型）。
 */
export function slugFromTitle(title: string): string {
  const parts = pinyin(title, {
    toneType: "none",
    type: "array",
    nonZh: "consecutive",
  })
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .map((s) => s.replace(/[^a-z0-9-]/g, ""))
    .filter(Boolean);

  const cleaned = parts
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (cleaned) return cleaned.slice(0, 80);
  return `post-${randomSuffix()}`;
}
