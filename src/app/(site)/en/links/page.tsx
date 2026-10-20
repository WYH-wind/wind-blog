import { LinksView, linksMetadata } from "@/components/page-views/links-view";

export const revalidate = 300;

export function generateMetadata() {
  return linksMetadata("en");
}

export default function Page() {
  return <LinksView locale="en" />;
}
