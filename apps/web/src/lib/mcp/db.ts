import { authContext } from "./context";

const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function mcpFetch(
  action: string,
  params: Record<string, unknown> = {},
) {
  const { apiKey } = authContext.getContext();

  if (!apiKey) {
    return { error: "Not authenticated", status: 401 };
  }

  const response = await fetch(`${API_URL}/api/mcp-internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params, apiKey }),
  });

  const result = await response.json();

  if (!response.ok) {
    return { error: result.error, status: response.status };
  }

  return { data: result.data, status: 200 };
}
