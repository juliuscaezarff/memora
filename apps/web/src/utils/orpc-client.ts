import type { AppRouterClient } from "@memora/api/routers/index";

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const link = new RPCLink({
  url: () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/rpc`;
    }

    throw new Error("The HTTP oRPC client is only available in the browser");
  },
});

const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
