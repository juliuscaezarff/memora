import { z } from "zod";
import { type InferSchema } from "xmcp";
import { mcpFetch } from "../lib/mcp/db";

export const schema = {
  query: z
    .string()
    .describe(
      "Search keyword to find bookmarks (searches in title, URL, and description). Use simple keywords like 'react', 'vercel', 'tutorial' - not full sentences.",
    ),
  folderName: z
    .string()
    .optional()
    .describe(
      "Optional: folder name to limit search to (e.g. 'my folder', 'recipes')",
    ),
};

export const metadata = {
  name: "search_bookmarks",
  description:
    "Search through all bookmarks by title, URL, or description. Useful for finding relevant links on a topic.",
  annotations: {
    title: "Search Bookmarks",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function searchBookmarks({
  query,
  folderName,
}: InferSchema<typeof schema>) {
  const result = await mcpFetch("searchBookmarks", { query, folderName });

  if (result.error) {
    return {
      content: [{ type: "text" as const, text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  const bookmarks = result.data;

  if (!bookmarks || bookmarks.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No bookmarks found matching "${query}".`,
        },
      ],
    };
  }

  const results = bookmarks.map(
    (b: {
      title: string;
      url: string;
      description: string | null;
      createdAt: string;
      folder: { icon: string; name: string };
    }) => ({
      title: b.title,
      url: b.url,
      description: b.description,
      folder: `${b.folder.icon} ${b.folder.name}`,
      createdAt: b.createdAt,
    }),
  );

  return {
    content: [
      {
        type: "text" as const,
        text: `Found ${bookmarks.length} bookmark(s) matching "${query}":\n\n${JSON.stringify(results, null, 2)}`,
      },
    ],
  };
}
