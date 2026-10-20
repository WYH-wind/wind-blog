"use client";

import { usePathname } from "next/navigation";

import { localeFromPath, type Locale } from "@/messages";

/** 客户端组件的当前语言：由 URL 的 /en 前缀推断（语言切换器、搜索弹窗等使用） */
export function useLocale(): Locale {
  return localeFromPath(usePathname());
}
