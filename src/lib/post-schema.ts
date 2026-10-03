import { z } from "zod";

/**
 * Post 输入契约：后台表单与服务端共用，运行时校验以服务端为准。
 */
export const postInputSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(120),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能是小写字母、数字与连字符")
    .optional()
    .or(z.literal("")),
  summary: z.string().trim().max(300).default(""),
  content: z.string().min(1, "正文不能为空").max(100_000),
  cover: z.string().trim().max(300).default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  pinned: z.boolean().default(false),
  pinOrder: z.number().int().min(0).max(999).default(0),
  tags: z.array(z.string().trim().min(1).max(20)).max(10).default([]),
});

export type PostInput = z.infer<typeof postInputSchema>;
