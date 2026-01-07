import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { apiKeyRouter } from "./api-key";
import { bookmarkRouter } from "./bookmark";
import { folderRouter } from "./folder";
import { publicRouter } from "./public";

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
  apiKey: apiKeyRouter,
  folder: folderRouter,
  bookmark: bookmarkRouter,
  public: publicRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
