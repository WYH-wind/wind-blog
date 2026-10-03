"use server";

import { revalidatePath } from "next/cache";

import { postInputSchema } from "@/lib/post-schema";
import { randomSuffix, slugFromTitle } from "@/lib/slug";
import { requireAdmin } from "@/server/auth/require-admin";
import { db } from "@/server/db";
import { HttpError } from "@/server/http";

export type SavePostResult = { ok: true; id: number } | { ok: false; error: string };

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let slug = base;
  for (let i = 0; i < 20; i++) {
    const clash = await db.post.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${randomSuffix()}`;
  }
  throw new HttpError(500, "slug 生成失败，请手动指定");
}

async function resolveTagIds(names: string[]): Promise<number[]> {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  const ids: number[] = [];
  for (const name of unique) {
    const existing = await db.tag.findUnique({ where: { name }, select: { id: true } });
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    let slug = slugFromTitle(name);
    while (await db.tag.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${slugFromTitle(name)}-${randomSuffix()}`;
    }
    const created = await db.tag.create({ data: { name, slug }, select: { id: true } });
    ids.push(created.id);
  }
  return ids;
}

export async function savePostAction(
  id: number | null,
  rawInput: unknown,
): Promise<SavePostResult> {
  await requireAdmin();

  const parsed = postInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "输入不合法" };
  }
  const input = parsed.data;

  // 发布语义：publishedAt 必须已发生（≤ now）
  const now = new Date();
  let publishedAt: Date | null = null;
  if (input.status === "PUBLISHED") {
    const existing = id
      ? (await db.post.findUnique({ where: { id }, select: { publishedAt: true } }))
          ?.publishedAt ?? null
      : null;
    publishedAt = existing && existing <= now ? existing : now;
  }

  try {
    if (id === null) {
      const slug = await uniqueSlug(input.slug || slugFromTitle(input.title));
      const post = await db.post.create({
        data: {
          slug,
          title: input.title,
          summary: input.summary,
          content: input.content,
          cover: input.cover || null,
          status: input.status,
          pinned: input.pinned,
          pinOrder: input.pinOrder,
          publishedAt,
          tags: { create: (await resolveTagIds(input.tags)).map((tagId) => ({ tagId })) },
        },
        select: { id: true },
      });
      revalidatePath("/", "layout");
      return { ok: true, id: post.id };
    }

    const prev = await db.post.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!prev) return { ok: false, error: "文章不存在" };

    const slug = await uniqueSlug(input.slug || slugFromTitle(input.title), id);
    await db.post.update({
      where: { id },
      data: {
        slug,
        title: input.title,
        summary: input.summary,
        content: input.content,
        cover: input.cover || null,
        status: input.status,
        pinned: input.pinned,
        pinOrder: input.pinOrder,
        publishedAt,
        tags: {
          deleteMany: {},
          create: (await resolveTagIds(input.tags)).map((tagId) => ({ tagId })),
        },
      },
    });

    // slug 变更 → 旧链接 308；改回旧 slug 时清掉对应 redirect
    if (prev.slug !== slug) {
      await db.postRedirect.deleteMany({ where: { postId: id, oldSlug: slug } });
      await db.postRedirect.upsert({
        where: { oldSlug: prev.slug },
        create: { oldSlug: prev.slug, postId: id },
        update: { postId: id },
      });
    }

    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    if (e instanceof HttpError) return { ok: false, error: e.message };
    return { ok: false, error: "保存失败，请重试" };
  }
}

export async function deletePostAction(id: number): Promise<void> {
  await requireAdmin();
  await db.post.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/", "layout");
}
