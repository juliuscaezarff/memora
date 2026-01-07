import { z } from "zod";
import { type InferSchema } from "xmcp";
import { mcpFetch } from "../lib/mcp/db";

export const schema = {
  url: z.string().url().describe("The URL of the bookmark to save"),
  folderName: z
    .string()
    .describe(
      "The name of the folder to save the bookmark to (e.g. 'my folder', 'recipes', 'work')",
    ),
  title: z
    .string()
    .optional()
    .describe("Optional: custom title for the bookmark"),
  description: z
    .string()
    .optional()
    .describe("Optional: description for the bookmark"),
};

export const metadata = {
  name: "save_bookmark",
  description:
    "Save a new bookmark to a specific folder. The URL will be validated and metadata will be fetched automatically if title is not provided.",
  annotations: {
    title: "Save Bookmark",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

async function fetchMetadata(url: string): Promise<{
  title: string;
  description: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MemoraBot/1.0)",
      },
    });
    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
    );
    const ogImageMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    );

    const urlObj = new URL(url);
    const faviconUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;

    return {
      title: titleMatch?.[1]?.trim() || url,
      description: descMatch?.[1]?.trim() || null,
      faviconUrl,
      ogImageUrl: ogImageMatch?.[1] || null,
    };
  } catch {
    return {
      title: url,
      description: null,
      faviconUrl: null,
      ogImageUrl: null,
    };
  }
}

export default async function saveBookmark({
  url,
  folderName,
  title,
  description,
}: InferSchema<typeof schema>) {
  // Fetch metadata if title not provided
  const meta = title
    ? {
        title,
        description: description || null,
        faviconUrl: null,
        ogImageUrl: null,
      }
    : await fetchMetadata(url);

  const result = await mcpFetch("saveBookmark", {
    url,
    folderName,
    title: title || meta.title,
    description: description || meta.description,
    faviconUrl: meta.faviconUrl,
    ogImageUrl: meta.ogImageUrl,
  });

  if (result.error) {
    return {
      content: [{ type: "text" as const, text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  if (result.data.existing) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Bookmark already exists in folder "${result.data.folder.name}".`,
        },
      ],
    };
  }

  const { bookmark, folder } = result.data;

  return {
    content: [
      {
        type: "text" as const,
        text: `Bookmark saved successfully!\n\nTitle: ${bookmark.title}\nURL: ${bookmark.url}\nFolder: ${folder.icon} ${folder.name}`,
      },
    ],
  };
}
