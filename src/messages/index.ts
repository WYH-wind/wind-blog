import { en } from "./en";
import { zh, type Dictionary } from "./zh";

export type { Dictionary };

/** 界面层双语：zh 为默认（无 URL 前缀），en 使用 /en 前缀；文章内容不翻译 */
export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";

const DICTIONARIES: Record<Locale, Dictionary> = { zh, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** 从路径推断语言：/en 前缀 → en，其余（含根路径）→ zh */
export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh";
}

/** 给站内路径加语言前缀（zh 无前缀，保持既有 URL 不变） */
export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  if (locale === "en") return `/en${clean}`;
  return clean || "/";
}

/** 去掉路径上的 /en 前缀（语言切换用） */
export function stripLocalePath(pathname: string): string {
  return pathname.replace(/^\/en(?=\/|$)/, "") || "/";
}

export const HTML_LANG: Record<Locale, string> = { zh: "zh-CN", en: "en" };
