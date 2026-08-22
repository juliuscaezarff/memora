import type { auth } from "@memora/auth";
import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  lastLoginMethodClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [lastLoginMethodClient(), inferAdditionalFields<typeof auth>()],
});
