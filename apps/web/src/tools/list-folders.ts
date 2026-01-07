import { mcpFetch } from "../lib/mcp/db";

export const metadata = {
  name: "list_folders",
  description:
    "List all bookmark folders for the authenticated user. Returns folder names, icons, and bookmark counts.",
  annotations: {
    title: "List Folders",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function listFolders() {
  const result = await mcpFetch("listFolders");

  if (result.error) {
    return {
      content: [{ type: "text" as const, text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  const folders = result.data;

  if (!folders || folders.length === 0) {
    return {
      content: [
        { type: "text" as const, text: "You don't have any folders yet." },
      ],
    };
  }

  const folderList = folders.map(
    (f: {
      id: string;
      name: string;
      icon: string;
      isShared: boolean;
      _count: { bookmarks: number };
    }) => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
      bookmarkCount: f._count.bookmarks,
      isShared: f.isShared,
    }),
  );

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(folderList, null, 2),
      },
    ],
  };
}
