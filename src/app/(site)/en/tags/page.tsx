import { TagsView, tagsMetadata } from "@/components/page-views/tags-view";

export const revalidate = 300;

export function generateMetadata() {
  return tagsMetadata("en");
}

export default function Page() {
  return <TagsView locale="en" />;
}
