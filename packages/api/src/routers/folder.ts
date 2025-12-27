import prisma from "@memora/db";
import z from "zod";

import { protectedProcedure } from "../index";

export const folderRouter = {
  getAll: protectedProcedure.handler(async ({ context }) => {
    return await prisma.folder.findMany({
      where: {
        userId: context.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { bookmarks: true },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        icon: z.string().min(1).max(10).default("📁"),
      })
    )
    .handler(async ({ input, context }) => {
      return await prisma.folder.create({
        data: {
          name: input.name,
          icon: input.icon,
          userId: context.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        icon: z.string().min(1).max(10).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      return await prisma.folder.update({
        where: {
          id: input.id,
          userId: context.session.user.id,
        },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.icon && { icon: input.icon }),
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      return await prisma.folder.delete({
        where: {
          id: input.id,
          userId: context.session.user.id,
        },
      });
    }),
};
