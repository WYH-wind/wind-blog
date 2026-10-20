"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { AdminToast, useAdminToast } from "@/components/admin/toast";

const TOAST_TEXT: Record<string, string> = {
  saved: "已保存",
  drafted: "已转为草稿",
};

/**
 * 查看页提示：编辑页保存成功后带 ?toast= 跳转而来，展示后从地址栏移除参数，
 * 刷新/复制链接不会重复弹提示。
 */
export function ViewToast({ postPath, toastKey }: { postPath: string; toastKey: string | null }) {
  const router = useRouter();
  const { toast, show } = useAdminToast(3000);
  const cleaned = useRef(false);

  useEffect(() => {
    if (!toastKey || cleaned.current) return;
    cleaned.current = true;
    const text = TOAST_TEXT[toastKey];
    if (text) show(true, text);
    router.replace(postPath, { scroll: false });
  }, [toastKey, postPath, router, show]);

  return <AdminToast toast={toast} />;
}
