"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AdminToastData = { ok: boolean; text: string; id: number };

/** 后台操作提示：成功/失败 toast，自动消失；重复调用会重置计时 */
export function useAdminToast(duration = 2600) {
  const [toast, setToast] = useState<AdminToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (ok: boolean, text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ ok, text, id: Date.now() });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [duration],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { toast, show };
}

export function AdminToast({ toast }: { toast: AdminToastData | null }) {
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      role="status"
      className="fixed left-1/2 top-16 z-50 -translate-x-1/2"
    >
      <div
        className={`wind-dialog flex items-center gap-2 rounded-full border bg-surface px-4 py-2 text-sm shadow-lg ${
          toast.ok ? "border-accent/40 text-accent" : "border-red-500/40 text-red-500"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        >
          {toast.ok ? <path d="m4.5 12.5 5 5 10-11" /> : <path d="M12 6v7m0 4v.5" />}
        </svg>
        {toast.text}
      </div>
    </div>
  );
}
