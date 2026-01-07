import prisma from "@memora/db";

import { protectedProcedure } from "../index";

function generateApiKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "mk_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const apiKeyRouter = {
  get: protectedProcedure.handler(async ({ context }) => {
    return await prisma.apiKey.findFirst({
      where: {
        userId: context.session.user.id,
      },
      select: {
        id: true,
        key: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }),

  create: protectedProcedure.handler(async ({ context }) => {
    // Delete existing key if any
    await prisma.apiKey.deleteMany({
      where: {
        userId: context.session.user.id,
      },
    });

    // Create new key
    const key = generateApiKey();
    return await prisma.apiKey.create({
      data: {
        key,
        userId: context.session.user.id,
      },
      select: {
        id: true,
        key: true,
        name: true,
        createdAt: true,
      },
    });
  }),

  regenerate: protectedProcedure.handler(async ({ context }) => {
    // Delete existing key
    await prisma.apiKey.deleteMany({
      where: {
        userId: context.session.user.id,
      },
    });

    // Create new key
    const key = generateApiKey();
    return await prisma.apiKey.create({
      data: {
        key,
        userId: context.session.user.id,
      },
      select: {
        id: true,
        key: true,
        name: true,
        createdAt: true,
      },
    });
  }),

  delete: protectedProcedure.handler(async ({ context }) => {
    await prisma.apiKey.deleteMany({
      where: {
        userId: context.session.user.id,
      },
    });
    return { success: true };
  }),
};
