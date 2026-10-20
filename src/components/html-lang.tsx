"use client";

import { useEffect } from "react";

/** 根布局的 <html lang="zh-CN"> 是静态的；/en 树用它在客户端切到 en */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "zh-CN";
    };
  }, [lang]);
  return null;
}
