import { NextRequest, NextResponse } from "next/server";

interface Metadata {
  url: string;
  title: string;
  description: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
}

function normalizeUrl(input: string): string {
  let url = input.trim();

  // Add protocol if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  return url;
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MemoraBot/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getMetaContent(html: string, property: string): string | null {
  // Try property attribute (Open Graph)
  const propertyMatch = html.match(
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")
  );
  if (propertyMatch) return propertyMatch[1];

  // Try reverse order (content before property)
  const reversePropertyMatch = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i")
  );
  if (reversePropertyMatch) return reversePropertyMatch[1];

  // Try name attribute (standard meta)
  const nameMatch = html.match(
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")
  );
  if (nameMatch) return nameMatch[1];

  // Try reverse order for name
  const reverseNameMatch = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i")
  );
  if (reverseNameMatch) return reverseNameMatch[1];

  return null;
}

function getTitle(html: string): string {
  // Try og:title first
  const ogTitle = getMetaContent(html, "og:title");
  if (ogTitle) return ogTitle;

  // Try twitter:title
  const twitterTitle = getMetaContent(html, "twitter:title");
  if (twitterTitle) return twitterTitle;

  // Fall back to <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();

  return "Untitled";
}

function getDescription(html: string): string | null {
  return (
    getMetaContent(html, "og:description") ||
    getMetaContent(html, "twitter:description") ||
    getMetaContent(html, "description")
  );
}

function getOgImage(html: string): string | null {
  return (
    getMetaContent(html, "og:image") ||
    getMetaContent(html, "twitter:image") ||
    getMetaContent(html, "twitter:image:src")
  );
}

function getFaviconUrl(html: string, baseUrl: string): string | null {
  const domain = extractDomain(baseUrl);

  // Try to find favicon in HTML
  const iconPatterns = [
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i,
  ];

  for (const pattern of iconPatterns) {
    const match = html.match(pattern);
    if (match) {
      const iconUrl = match[1];
      // Handle relative URLs
      if (iconUrl.startsWith("//")) {
        return "https:" + iconUrl;
      } else if (iconUrl.startsWith("/")) {
        return domain + iconUrl;
      } else if (!iconUrl.startsWith("http")) {
        return domain + "/" + iconUrl;
      }
      return iconUrl;
    }
  }

  // Default to /favicon.ico
  return domain + "/favicon.ico";
}

function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return url;

  const domain = extractDomain(baseUrl);

  if (url.startsWith("//")) {
    return "https:" + url;
  } else if (url.startsWith("/")) {
    return domain + url;
  } else if (!url.startsWith("http")) {
    return domain + "/" + url;
  }
  return url;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const inputUrl = searchParams.get("url");

  if (!inputUrl) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const url = normalizeUrl(inputUrl);

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      // Return basic metadata even if fetch fails
      const domain = extractDomain(url);
      return NextResponse.json<Metadata>({
        url,
        title: new URL(url).hostname,
        description: null,
        faviconUrl: domain + "/favicon.ico",
        ogImageUrl: null,
      });
    }

    const html = await response.text();

    const title = getTitle(html);
    const description = getDescription(html);
    const ogImageUrl = getOgImage(html);
    const faviconUrl = getFaviconUrl(html, url);

    const metadata: Metadata = {
      url,
      title,
      description,
      faviconUrl,
      ogImageUrl: ogImageUrl ? resolveUrl(ogImageUrl, url) : null,
    };

    return NextResponse.json(metadata);
  } catch (error) {
    // Return basic metadata on error
    try {
      const url = normalizeUrl(inputUrl);
      const domain = extractDomain(url);
      return NextResponse.json<Metadata>({
        url,
        title: new URL(url).hostname,
        description: null,
        faviconUrl: domain + "/favicon.ico",
        ogImageUrl: null,
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch metadata" },
        { status: 500 }
      );
    }
  }
}
