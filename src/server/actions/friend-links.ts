"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/server/auth/require-admin";
import { db } from "@/server/db";

const linkSchema = z.object({
  name: z.string().trim().min(1).max(60),
  url: z.string().trim().max(300).url("链接必须是合法 URL"),
  description: z.string().trim().max(120).default(""),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

export async function createFriendLinkAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = linkSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    description: formData.get("description"),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  });
  if (!parsed.success) return;

  await db.friendLink.create({ data: parsed.data });
  revalidatePath("/", "layout");
}

export async function toggleFriendLinkVisibleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const link = await db.friendLink.findUnique({ where: { id }, select: { visible: true } });
  if (!link) return;
  await db.friendLink.update({ where: { id }, data: { visible: !link.visible } });
  revalidatePath("/", "layout");
}

export async function deleteFriendLinkAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await db.friendLink.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/", "layout");
}
