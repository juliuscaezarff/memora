import { z } from "zod";
import { type InferSchema } from "xmcp";
import { mcpFetch } from "../lib/mcp/db";

export const schema = {
  folderName: z
    .string()
    .describe(
      "The name of the folder to get bookmarks from (e.g. 'my folder', 'recipes', 'work')",
    ),
};

export const metadata = {
  name: "get_bookmarks",
  description:
    "Get all bookmarks from a specific folder. Returns bookmark titles, URLs, descriptions, and metadata.",
  annotations: {
    title: "Get Bookmarks",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function getBookmarks({
  folderName,
}: InferSchema<typeof schema>) {
  const result = await mcpFetch("getBookmarks", { folderName });

  if (result.error) {
    return {
      content: [{ type: "text" as const, text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  const { folder, bookmarks } = result.data;

  if (!bookmarks || bookmarks.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No bookmarks found in folder "${folder.name}".`,
        },
      ],
    };
  }

  const bookmarkList = bookmarks.map(
    (b: {
      id: string;
      title: string;
      url: string;
      description: string | null;
      createdAt: string;
    }) => ({
      id: b.id,
      title: b.title,
      url: b.url,
      description: b.description,
      createdAt: b.createdAt,
    }),
  );

  return {
    content: [
      {
        type: "text" as const,
        text: `Bookmarks in "${folder.name}" (${bookmarks.length}):\n\n${JSON.stringify(bookmarkList, null, 2)}`,
      },
    ],
  };
}
