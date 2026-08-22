import { NextResponse, type NextRequest } from "next/server";

import {
  getSafeLinkPreview,
  getSafeRemoteAsset,
} from "@/lib/bookmark-link-preview.server";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const rateLimitBuckets = new Map<string, number[]>();

function isRateLimited(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  const client =
    forwardedFor?.trim() || request.headers.get("x-real-ip") || "anonymous";
  const now = Date.now();
  const recent = (rateLimitBuckets.get(client) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  rateLimitBuckets.set(client, [...recent, now]);

  if (rateLimitBuckets.size > 1_000) {
    for (const [key, timestamps] of rateLimitBuckets) {
      if (
        timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)
      ) {
        rateLimitBuckets.delete(key);
      }
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "Too many preview requests." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url || url.length > 2_048) {
    return NextResponse.json(
      { error: "A valid URL is required." },
      { status: 400 },
    );
  }

  try {
    if (request.nextUrl.searchParams.get("asset") === "1") {
      const asset = await getSafeRemoteAsset(url);
      return new NextResponse(new Uint8Array(asset.body), {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          "Content-Type": asset.contentType,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const preview = await getSafeLinkPreview(url);
    return NextResponse.json(preview, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.warn("Bookmark link preview rejected", error);
    return NextResponse.json(
      { error: "Preview unavailable." },
      { status: 422 },
    );
  }
}
