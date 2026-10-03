import { PostEditor } from "@/components/admin/post-editor";
import { listAllTags } from "@/server/queries/admin";

export default async function NewPostPage() {
  const allTags = await listAllTags();
  return <PostEditor initial={null} allTags={allTags} />;
}
