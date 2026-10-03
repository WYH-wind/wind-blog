import { WindLines } from "@/components/wind-lines";
import { PostListItem } from "@/components/post-list-item";
import { listPublishedPosts } from "@/server/queries/posts";
import { getSettings } from "@/server/queries/settings";

export const revalidate = 300;

export default async function Home() {
  const [posts, settings] = await Promise.all([listPublishedPosts(20), getSettings()]);

  return (
    <div className="space-y-12">
      <section className="relative pb-4 pt-8">
        <WindLines className="pointer-events-none absolute inset-x-0 -top-4 w-full opacity-80" />
        <div className="relative">
          <h1 className="font-heading text-5xl tracking-wide">{settings["site.name"]}</h1>
          <p className="mt-3 text-muted">{settings["site.description"]}</p>
        </div>
      </section>

      <ul className="divide-y divide-line/70">
        {posts.map((post) => (
          <PostListItem key={post.id} post={post} />
        ))}
      </ul>
    </div>
  );
}
