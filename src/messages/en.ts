import type { Dictionary } from "./zh";

export const en: Dictionary = {
  nav: {
    home: "Home",
    tags: "Tags",
    archives: "Archives",
    links: "Links",
    about: "About",
  },
  theme: {
    toggle: "Toggle color theme",
  },
  search: {
    open: "Search",
    close: "Close search",
    dialogLabel: "Site search",
    aria: "Search keywords",
    placeholder: "Search titles, summaries and full text…",
    emptyHint: "Type to search all posts — titles, summaries and full text.",
    loading: "Searching…",
    notFound: (q: string) => `No posts found for “${q}”.`,
    matchedSummary: "summary",
    matchedContent: "full text",
  },
  post: {
    minutes: (n: number) => `~${n} min read`,
    toc: "Contents",
    like: "Like",
    favorite: "Favorite",
    views: (n: number) => `${n} views`,
    pinned: "Pinned",
    notFoundTitle: "Post not found",
  },
  tags: {
    title: "Tags",
    empty: "No tags yet.",
    emptyTag: "No posts under this tag yet.",
  },
  archives: {
    title: "Archives",
    empty: "Nothing published yet.",
  },
  links: {
    title: "Links",
    empty: "No links yet — they are on the way.",
  },
  about: {
    title: "About",
  },
  footer: {
    privacy:
      "This site never stores visitor IPs; anonymous identifiers are used only for likes, favorites and view deduplication.",
  },
  notFound: {
    code: "404",
    title: "The wind took this page away",
    body: "The page you are looking for does not exist, or has drifted away.",
    back: "Back home",
  },
  locale: {
    zh: "中文",
    en: "English",
  },
  feed: {
    description: "A minimal, light and flowing personal blog.",
    language: "en",
  },
};
