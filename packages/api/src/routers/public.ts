import prisma from "@memora/db";
import z from "zod";

import { publicProcedure } from "../index";

export const publicRouter = {
  getSharedFolder: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const folder = await prisma.folder.findUnique({
        where: {
          id: input.id,
          isShared: true,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      if (!folder) {
        return null;
      }

      return folder;
    }),

  getSharedFolderBookmarks: publicProcedure
    .input(z.object({ folderId: z.string() }))
    .handler(async ({ input }) => {
      // First verify the folder is shared
      const folder = await prisma.folder.findUnique({
        where: {
          id: input.folderId,
          isShared: true,
        },
      });

      if (!folder) {
        return [];
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
};
