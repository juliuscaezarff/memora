import { z } from "zod";
import { type InferSchema } from "xmcp";
import { mcpFetch } from "../lib/mcp/db";

export const schema = {
  name: z.string().min(1).max(50).describe("The name of the folder to create"),
  icon: z
    .string()
    .optional()
    .describe("Optional: emoji icon for the folder (default: 📁)"),
};

export const metadata = {
  name: "create_folder",
  description: "Create a new folder to organize bookmarks.",
  annotations: {
    title: "Create Folder",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
};

export default async function createFolder({
  name,
  icon,
}: InferSchema<typeof schema>) {
  const result = await mcpFetch("createFolder", { name, icon });

  if (result.error) {
    return {
      content: [{ type: "text" as const, text: `Error: ${result.error}` }],
      isError: true,
    };
  }

  const folder = result.data;

  return {
    content: [
      {
        type: "text" as const,
        text: `Folder created successfully!\n\nID: ${folder.id}\nName: ${folder.icon} ${folder.name}`,
      },
    ],
  };
}
