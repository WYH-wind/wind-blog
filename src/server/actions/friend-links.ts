"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/server/auth/require-admin";
import { db } from "@/server/db";

export type ActionResult = { ok: true } | { ok: false; error: string };

const linkSchema = z.object({
  name: z.string().trim().min(1, "名称不能为空").max(60),
  url: z.string().trim().max(300).url("链接必须是合法 URL"),
  description: z.string().trim().max(120).default(""),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

export async function createFriendLinkAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "输入不合法" };
  }

  await db.friendLink.create({ data: parsed.data });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleFriendLinkVisibleAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  if (!Number.isInteger(id)) return { ok: false, error: "参数不合法" };

  const link = await db.friendLink.findUnique({ where: { id }, select: { visible: true } });
  if (!link) return { ok: false, error: "友链不存在" };

  await db.friendLink.update({ where: { id }, data: { visible: !link.visible } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteFriendLinkAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  if (!Number.isInteger(id)) return { ok: false, error: "参数不合法" };

  try {
    await db.friendLink.delete({ where: { id } });
  } catch {
    return { ok: false, error: "删除失败，请重试" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
