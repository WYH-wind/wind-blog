import "server-only";

import GithubSlugger from "github-slugger";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import type { BuiltinLanguage, BuiltinTheme } from "shiki";
import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import type { Heading, RootContent } from "mdast";

// URL scheme 白名单：有协议的 URL 必须命中；相对路径/锚点直接放行
const SAFE_URL_SCHEME = /^(https?:|mailto:|\/|#)/i;
const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const URL_ATTRS = ["href", "src", "poster", "cite"] as const;

/** 拦截 javascript: / vbscript: / data: 等危险协议（remark 默认不处理） */
const rehypeSafeUrls: Plugin<[], Root> = () => (tree) => {
  const walk = (node: unknown) => {
    const el = node as Element;
    if (el.properties) {
      for (const attr of URL_ATTRS) {
        const value = el.properties[attr];
        if (typeof value === "string" && HAS_SCHEME.test(value) && !SAFE_URL_SCHEME.test(value)) {
          el.properties[attr] = "";
        }
      }
    }
    for (const child of el.children ?? []) walk(child);
  };
  walk(tree);
};

// 常用语言预加载；未知语言回落 plaintext（fallbackLanguage）
const SHIKI_LANGS: BuiltinLanguage[] = [
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "json",
  "bash",
  "shell",
  "css",
  "html",
  "markdown",
  "mdx",
  "python",
  "sql",
  "yaml",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "diff",
  "dockerfile",
  "nginx",
];

// 模块级单例：highlighter 只在首次渲染时创建一次
const processor = unified()
  .use(remarkParse)
  // 默认不开启 allowDangerousHtml：raw HTML 一律被转义/丢弃（防 XSS 的根基）
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeSafeUrls)
  .use(rehypeShiki, {
    themes: { light: "one-light", dark: "one-dark-pro" } as {
      light: BuiltinTheme;
      dark: BuiltinTheme;
    },
    defaultColor: false,
    langs: SHIKI_LANGS,
    fallbackLanguage: "plaintext",
  })
  .use(rehypeStringify);

export type TocItem = { id: string; text: string; depth: number };

export type RenderedMarkdown = {
  html: string;
  toc: TocItem[];
  readingMinutes: number;
};

export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  // process() = parse + run + stringify，返回 VFile
  const file = await processor.process(markdown);
  return {
    html: String(file),
    toc: extractToc(markdown),
    readingMinutes: calcReadingMinutes(markdown),
  };
}

function extractToc(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  const walk = (nodes: RootContent[]) => {
    for (const node of nodes) {
      if (node.type === "heading") {
        // node.type === "heading" 已将类型收窄为 Heading
        if (node.depth >= 2 && node.depth <= 4) {
          const text = headingText(node.children);
          if (text) {
            items.push({ id: slugger.slug(text), text, depth: node.depth });
          }
        }
      }
      // 不深入 blockquote/list 内部标题——博客正文中应避免
      if ("children" in node && node.type !== "heading") {
        walk(node.children);
      }
    }
  };
  walk(tree.children);
  return items;
}

function headingText(children: Heading["children"]): string {
  let out = "";
  for (const child of children) {
    if (child.type === "text" || child.type === "inlineCode") {
      out += child.value;
    } else if ("children" in child) {
      out += headingText(child.children);
    }
  }
  return out.trim();
}

function calcReadingMinutes(markdown: string): number {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, " ");
  const cjk = (withoutCode.match(/[\u3400-\u4dbf\u4e00-\u9fff]/g) ?? []).length;
  const words = (
    withoutCode.replace(/[\u3400-\u4dbf\u4e00-\u9fff]/g, " ").match(/[a-zA-Z0-9]+/g) ?? []
  ).length;
  // 中文约 400 字/分钟，英文约 200 词/分钟
  return Math.max(1, Math.ceil(cjk / 400 + words / 200));
}
