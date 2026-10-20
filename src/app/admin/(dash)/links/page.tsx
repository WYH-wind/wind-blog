import { LinksPanel } from "@/components/admin/links-panel";
import { listAllFriendLinks } from "@/server/queries/friend-links";

export default async function AdminLinksPage() {
  const links = await listAllFriendLinks();

  return (
    <div className="mx-auto max-w-3xl">
      <LinksPanel
        links={links.map((link) => ({
          id: link.id,
          name: link.name,
          url: link.url,
          description: link.description ?? "",
          sortOrder: link.sortOrder,
          visible: link.visible,
        }))}
      />
    </div>
  );
}
