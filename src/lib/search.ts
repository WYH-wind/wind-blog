/**
 * LIKE/ILIKE 通配符转义：用户输入的 % _ \ 必须按字面匹配（docs/PLAN.md 安全标准）。
 * 配合 SQL 中的 ESCAPE '\\' 使用。
 */
export function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/** 搜索输入规整：去首尾空白 + 长度上限（50 字符） */
export function normalizeSearchQuery(raw: string | undefined | null): string {
  return (raw ?? "").trim().slice(0, 50);
}
