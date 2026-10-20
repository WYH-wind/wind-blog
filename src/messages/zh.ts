export const zh = {
  nav: {
    home: "首页",
    tags: "标签",
    archives: "归档",
    links: "友链",
    about: "关于",
  },
  theme: {
    toggle: "切换深浅主题",
  },
  search: {
    open: "搜索",
    close: "关闭搜索",
    dialogLabel: "站内搜索",
    aria: "搜索关键词",
    placeholder: "搜索标题、摘要与正文…",
    emptyHint: "输入关键词，搜索全部文章——含标题、摘要与正文。",
    loading: "搜索中…",
    notFound: (q: string) => `没有找到「${q}」相关文章。`,
    matchedSummary: "摘要",
    matchedContent: "正文",
  },
  post: {
    minutes: (n: number) => `约 ${n} 分钟`,
    toc: "目录",
    like: "赞",
    favorite: "收藏",
    views: (n: number) => `${n} 次浏览`,
    pinned: "置顶",
    notFoundTitle: "文章不存在",
  },
  tags: {
    title: "标签",
    empty: "还没有任何标签。",
    emptyTag: "这个标签下还没有文章。",
  },
  archives: {
    title: "归档",
    empty: "还没有发布任何文章。",
  },
  links: {
    title: "友链",
    empty: "还没有友链，风还在路上。",
  },
  about: {
    title: "关于",
  },
  footer: {
    privacy: "本站不保存访客 IP，仅以匿名标识进行点赞、收藏与浏览去重。",
  },
  notFound: {
    code: "404",
    title: "风把这一页吹走了",
    body: "你要找的页面不存在，或者已经随风而去。",
    back: "回到首页",
  },
  locale: {
    zh: "中文",
    en: "English",
  },
  feed: {
    description: "简洁、轻盈、流动的个人博客。",
    language: "zh-CN",
  },
};

export type Dictionary = typeof zh;
