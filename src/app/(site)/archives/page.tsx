import { ArchivesView, archivesMetadata } from "@/components/page-views/archives-view";

export const revalidate = 300;

export function generateMetadata() {
  return archivesMetadata("zh");
}

export default function Page() {
  return <ArchivesView locale="zh" />;
}
