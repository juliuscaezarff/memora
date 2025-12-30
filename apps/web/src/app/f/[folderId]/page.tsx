import { PublicFolder } from "./public-folder";

interface PageProps {
  params: Promise<{ folderId: string }>;
}

export default async function PublicFolderPage({ params }: PageProps) {
  const { folderId } = await params;
  return <PublicFolder folderId={folderId} />;
}
