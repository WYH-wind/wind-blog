import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const posts = [
  {
    slug: "build-blog-with-nextjs-16",
    title: "用 Next.js 16 搭建自己的博客",
    summary: "从零开始的全栈博客长什么样：数据模型、渲染管线、缓存策略与安全边界。",
    status: "PUBLISHED" as const,
    pinned: true,
    pinOrder: 1,
    publishedAt: new Date("2026-09-20T10:00:00+08:00"),
    content: `## 为什么要自己写

现成的博客系统很多，但自己写一遍全栈，才真正清楚每个环节：从 Markdown 到 HTML 的渲染管线、从数据库到页面的缓存边界、以及后台写操作的安全约束。

## 技术选型

- **框架**：Next.js 16（App Router）+ React 19
- **数据库**：PostgreSQL 18 + Prisma ORM
- **样式**：Tailwind CSS 4，CSS-first 的 design tokens
- **渲染**：unified 管线 + Shiki 代码高亮

## 渲染管线的安全边界

Markdown 默认不允许 raw HTML，所有 HTML 节点都会被转义为纯文本，从根上避免 XSS：

\`\`\`ts
const tree = remark().use(remarkParse).use(remarkGfm).parse(markdown);
// remark-rehype 默认丢弃/转义 raw HTML，无需额外 sanitizer
\`\`\`

## 缓存策略

| 内容 | 策略 |
| --- | --- |
| 文章页 | ISR，后台保存时按需刷新 |
| 点赞/浏览量 | 独立动态 API |
| 搜索 | 动态查询 |

> 单实例部署不需要 Redis，别为了简历驱动开发加组件。

## 小结

先把全链路跑通，再逐层打磨。骨架先行，血肉随后。
`,
    tags: ["Next.js", "前端"],
  },
  {
    slug: "postgres-18-highlights",
    title: "PostgreSQL 18 值得关注的几个点",
    summary: "从 16 跳到 18：异步 I/O、更聪明的统计信息，以及容器镜像的挂载变化。",
    status: "PUBLISHED" as const,
    pinned: false,
    pinOrder: 0,
    publishedAt: new Date("2026-09-26T21:30:00+08:00"),
    content: `## 异步 I/O

PG18 引入了异步 I/O，顺序扫描与大表读取的吞吐都有可见提升。

## 统计信息

\`\`\`sql
-- 观察查询计划是否如预期走索引
EXPLAIN ANALYZE SELECT * FROM posts WHERE status = 'PUBLISHED';
\`\`\`

## 容器镜像的坑

官方 \`postgres:18\` 镜像把推荐挂载点从 \`/var/lib/postgresql/data\` 改成了 \`/var/lib/postgresql\`，老写法容器会直接拒绝启动，日志里写得很清楚。

对个人项目而言，升级本身不急，但**备份要先行**：每天一份 \`pg_dump\`，异地保留 30 天。
`,
    tags: ["数据库"],
  },
  {
    slug: "why-wind",
    title: "为什么给博客起名「Wind」",
    summary: "简洁、轻盈、流动——这三词既是设计标准，也是对写作状态的期待。",
    status: "PUBLISHED" as const,
    pinned: false,
    pinOrder: 0,
    publishedAt: new Date("2026-10-01T09:00:00+08:00"),
    content: `## 一个词的标准

风看不见，但看得见它经过的地方。好的设计也是：留白、细线、克制的动效，界面退后，内容向前。

## 设计上怎么做

1. 单栏布局，正文宽度收窄，阅读节奏优先
2. 「风线」作为唯一的装饰母题，出现在首页与分隔处
3. 暗色模式不是反色，而是另一套安静的色板

## 写作上期待什么

像风一样：经常来，轻轻来。
`,
    tags: ["随笔"],
  },
  {
    slug: "design-system-draft",
    title: "草稿：设计系统的色板与字体",
    summary: "尚未定稿的 design tokens 思路。",
    status: "DRAFT" as const,
    pinned: false,
    pinOrder: 0,
    publishedAt: null,
    content: `## 待定

- 风青 accent 的浅/暗两套色值
- 霞鹜文楷的子集化体积
`,
    tags: ["前端"],
  },
];

const settings: Array<[string, string]> = [
  ["site.name", "Wind"],
  ["site.description", "简洁、轻盈、流动的个人博客。"],
  ["site.github", "https://github.com/yourname"],
  ["site.email", "hi@example.com"],
  [
    "site.about",
    "## 关于 Wind\n\n一名程序员的自留地，写代码、写想法、写生活。\n\n这里的一切都很简单：一栏文字，一点风。",
  ],
  ["site.footer", "由 Wind 驱动 · 简洁、轻盈、流动"],
];

async function main() {
  await db.postTag.deleteMany();
  await db.reaction.deleteMany();
  await db.postView.deleteMany();
  await db.postRedirect.deleteMany();
  await db.post.deleteMany();
  await db.tag.deleteMany();
  await db.friendLink.deleteMany();
  await db.setting.deleteMany();

  for (const [name, slug] of [
    ["Next.js", "nextjs"],
    ["前端", "frontend"],
    ["数据库", "database"],
    ["随笔", "essay"],
  ] as const) {
    await db.tag.create({ data: { name, slug } });
  }
  const tags = await db.tag.findMany();
  const tagByName = new Map(tags.map((t) => [t.name, t.id]));

  for (const p of posts) {
    await db.post.create({
      data: {
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        content: p.content,
        status: p.status,
        pinned: p.pinned,
        pinOrder: p.pinOrder,
        publishedAt: p.publishedAt,
        tags: {
          create: p.tags.map((name) => ({ tagId: tagByName.get(name)! })),
        },
      },
    });
  }

  const friendLinks = [
    {
      name: "Vercel Blog",
      url: "https://vercel.com/blog",
      description: "前端工程化前沿",
      sortOrder: 1,
    },
    {
      name: "PostgreSQL Weekly",
      url: "https://postgresweekly.com",
      description: "每周数据库动态",
      sortOrder: 2,
    },
    {
      name: "阮一峰的网络日志",
      url: "https://www.ruanyifeng.com/blog/",
      description: "科技爱好者周刊",
      sortOrder: 3,
    },
  ];
  for (const f of friendLinks) {
    await db.friendLink.create({ data: f });
  }

  for (const [key, value] of settings) {
    await db.setting.create({ data: { key, value } });
  }

  console.log(
    `Seed 完成：${posts.length} 篇文章、${tags.length} 个标签、${friendLinks.length} 条友链、${settings.length} 项设置`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
