import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "./index";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  // Convert Vercel request to standard Request
  const url = `https://${req.headers.host}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value)
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? JSON.stringify(req.body)
        : undefined,
  });

  const response = await app.fetch(request);

  // Send response back
  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = await response.text();
  res.send(body);
}
