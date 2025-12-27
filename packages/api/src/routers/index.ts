import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { folderRouter } from "./folder";
import { todoRouter } from "./todo";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  todo: todoRouter,
  folder: folderRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
