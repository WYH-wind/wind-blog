"use server";

import { revalidatePath } from "next/cache";

import { settingsSchema } from "@/lib/settings-schema";
import { requireAdmin } from "@/server/auth/require-admin";
import { db } from "@/server/db";
import type { ActionResult } from "@/server/actions/friend-links";

export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "输入不合法" };
  }

  for (const [key, value] of Object.entries(parsed.data)) {
    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
