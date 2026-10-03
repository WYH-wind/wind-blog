"use server";

import { revalidatePath } from "next/cache";

import { settingsSchema, SETTING_KEYS } from "@/lib/settings-schema";
import { requireAdmin } from "@/server/auth/require-admin";
import { db } from "@/server/db";

export async function saveSettingsFormAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const raw: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    const value = formData.get(key);
    raw[key] = typeof value === "string" ? value : "";
  }

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return; // 表单侧已约束；非法输入静默忽略

  for (const [key, value] of Object.entries(parsed.data)) {
    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  revalidatePath("/", "layout");
}
