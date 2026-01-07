import prisma from "@memora/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { action, params, apiKey } = await req.json();

    // Validate API key
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
    });

    if (!key) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const userId = key.userId;

    // Update last used
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });

    switch (action) {
      case "listFolders": {
        const folders = await prisma.folder.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { bookmarks: true } } },
        });
        return NextResponse.json({ data: folders });
      }

      case "getBookmarks": {
        const folder = await prisma.folder.findFirst({
          where: {
            name: { equals: params.folderName, mode: "insensitive" },
            userId,
          },
        });
        if (!folder) {
          return NextResponse.json(
            { error: `Folder "${params.folderName}" not found` },
            { status: 404 },
          );
        }
        const bookmarks = await prisma.bookmark.findMany({
          where: { folderId: folder.id },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ data: { folder, bookmarks } });
      }

      case "searchBookmarks": {
        // If folderName is provided, find that specific folder
        let folderFilter = {};
        if (params.folderName) {
          const folder = await prisma.folder.findFirst({
            where: {
              name: { equals: params.folderName, mode: "insensitive" },
              userId,
            },
          });
          if (!folder) {
            return NextResponse.json(
              { error: `Folder "${params.folderName}" not found` },
              { status: 404 },
            );
          }
          folderFilter = { id: folder.id };
        }

        const userFolders = await prisma.folder.findMany({
          where: { userId, ...folderFilter },
          select: { id: true },
        });
        const folderIds = userFolders.map((f) => f.id);
        const bookmarks = await prisma.bookmark.findMany({
          where: {
            folderId: { in: folderIds },
            OR: [
              { title: { contains: params.query, mode: "insensitive" } },
              { url: { contains: params.query, mode: "insensitive" } },
              { description: { contains: params.query, mode: "insensitive" } },
            ],
          },
          include: { folder: { select: { name: true, icon: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
        return NextResponse.json({ data: bookmarks });
      }

      case "saveBookmark": {
        const folder = await prisma.folder.findFirst({
          where: {
            name: { equals: params.folderName, mode: "insensitive" },
            userId,
          },
        });
        if (!folder) {
          return NextResponse.json(
            {
              error: `Folder "${params.folderName}" not found. Use list_folders to see available folders or create_folder to create a new one.`,
            },
            { status: 404 },
          );
        }
        const existing = await prisma.bookmark.findFirst({
          where: { url: params.url, folderId: folder.id },
        });
        if (existing) {
          return NextResponse.json({ data: { existing: true, folder } });
        }
        const bookmark = await prisma.bookmark.create({
          data: {
            url: params.url,
            title: params.title,
            description: params.description,
            faviconUrl: params.faviconUrl,
            ogImageUrl: params.ogImageUrl,
            folderId: folder.id,
          },
        });
        return NextResponse.json({ data: { bookmark, folder } });
      }

      case "createFolder": {
        const existing = await prisma.folder.findFirst({
          where: { name: params.name, userId },
        });
        if (existing) {
          return NextResponse.json(
            { error: "Folder already exists" },
            { status: 400 },
          );
        }
        const folder = await prisma.folder.create({
          data: {
            name: params.name,
            icon: params.icon || "📁",
            userId,
          },
        });
        return NextResponse.json({ data: folder });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("MCP Internal API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
