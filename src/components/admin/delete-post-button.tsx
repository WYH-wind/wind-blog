"use client";

import { useTransition } from "react";

import { deletePostAction } from "@/server/actions/posts";

export function DeletePostButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-xs text-muted transition-colors hover:text-red-500 disabled:opacity-50"
      onClick={() => {
        if (!confirm("确认删除这篇文章？不可恢复。")) return;
        startTransition(async () => {
          await deletePostAction(id);
        });
      }}
    >
      {pending ? "删除中…" : "删除"}
    </button>
  );
}
