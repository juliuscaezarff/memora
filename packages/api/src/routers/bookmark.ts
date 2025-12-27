import prisma from "@memora/db";
import z from "zod";

import { protectedProcedure } from "../index";

export const bookmarkRouter = {
  getByFolder: protectedProcedure
    .input(z.object({ folderId: z.string() }))
    .handler(async ({ input, context }) => {
      // Verify the folder belongs to the user
      const folder = await prisma.folder.findFirst({
        where: {
          id: input.folderId,
          userId: context.session.user.id,
        },
      });

      if (!folder) {
        throw new Error("Folder not found");
      }

      return await prisma.bookmark.findMany({
        where: {
          folderId: input.folderId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        title: z.string().min(1),
        faviconUrl: z.string().nullable().optional(),
        ogImageUrl: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        folderId: z.string(),
      })
    )
    .handler(async ({ input, context }) => {
      // Verify the folder belongs to the user
      const folder = await prisma.folder.findFirst({
        where: {
          id: input.folderId,
          userId: context.session.user.id,
        },
      });

      if (!folder) {
        throw new Error("Folder not found");
      }

      // Check for duplicates if folder doesn't allow them
      if (!folder.allowDuplicate) {
        const existing = await prisma.bookmark.findFirst({
          where: {
            folderId: input.folderId,
            url: input.url,
          },
        });

        if (existing) {
          throw new Error("Bookmark already exists in this folder");
        }
      }

      return await prisma.bookmark.create({
        data: {
          url: input.url,
          title: input.title,
          faviconUrl: input.faviconUrl ?? null,
          ogImageUrl: input.ogImageUrl ?? null,
          description: input.description ?? null,
          folderId: input.folderId,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      // Verify the bookmark belongs to a folder owned by the user
      const bookmark = await prisma.bookmark.findFirst({
        where: {
          id: input.id,
        },
        include: {
          folder: true,
        },
      });

      if (!bookmark || bookmark.folder.userId !== context.session.user.id) {
        throw new Error("Bookmark not found");
      }

      return await prisma.bookmark.delete({
        where: {
          id: input.id,
        },
      });
    }),
};
