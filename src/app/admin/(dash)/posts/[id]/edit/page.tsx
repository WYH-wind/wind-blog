import { notFound } from "next/navigation";

import { PostEditor } from "@/components/admin/post-editor";
import { getPostById } from "@/server/queries/admin";

type EditPostPageProps = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const post = await getPostById(numericId);
  if (!post) notFound();

  return (
    <PostEditor
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        cover: post.cover ?? "",
        status: post.status,
        pinned: post.pinned,
        pinOrder: post.pinOrder,
        tags: post.tags.map(({ tag }) => tag.name),
      }}
    />
  );
}
