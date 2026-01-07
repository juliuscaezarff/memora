import { xmcpHandler } from "@xmcp/adapter";
import prisma from "@memora/db";
import { authContext } from "@/lib/mcp/context";

async function handler(req: Request): Promise<Response> {
  const authHeader = req.headers.get("authorization");
  let apiKey: string | null = null;
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const key = await prisma.apiKey.findUnique({
      where: { key: token },
    });

    if (key) {
      apiKey = token;
      userId = key.userId;

      // Update last used
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      });
    }
  }

  return new Promise((resolve) => {
    authContext.provider({ apiKey, userId }, async () => {
      const response = await xmcpHandler(req);
      resolve(response);
    });
  });
}

export { handler as GET, handler as POST };
