import { PostView, postMetadata } from "@/components/page-views/post-view";

export const revalidate = 300;

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  return postMetadata("en", slug);
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  return <PostView locale="en" slug={slug} />;
}
