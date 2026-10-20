import { TagView, tagMetadata } from "@/components/page-views/tag-view";

export const revalidate = 300;

type TagPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;
  return tagMetadata("en", slug);
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  return <TagView locale="en" slug={slug} />;
}
