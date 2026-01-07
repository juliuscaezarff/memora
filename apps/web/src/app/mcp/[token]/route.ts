import { xmcpHandler } from "@xmcp/adapter"
import prisma from "@memora/db"
import { authContext } from "@/lib/mcp/context"

type RouteContext = {
	params: Promise<{ token: string }>
}

async function handler(req: Request, context: RouteContext): Promise<Response> {
	const { token } = await context.params

	// Validate token from URL
	const key = await prisma.apiKey.findUnique({
		where: { key: token },
	})

	if (!key) {
		return new Response(JSON.stringify({ error: "Invalid token" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		})
	}

	// Update last used
	await prisma.apiKey.update({
		where: { id: key.id },
		data: { lastUsedAt: new Date() },
	})

	return new Promise((resolve) => {
		authContext.provider({ apiKey: token, userId: key.userId }, async () => {
			const response = await xmcpHandler(req)
			resolve(response)
		})
	})
}

export { handler as GET, handler as POST }
