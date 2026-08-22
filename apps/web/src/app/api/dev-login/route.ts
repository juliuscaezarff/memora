import { auth } from "@memora/auth";

export async function POST(request: Request) {
	if (process.env.NODE_ENV !== "development") {
		return new Response(null, { status: 404 });
	}

	const email = process.env.DEV_LOGIN_EMAIL;
	const password = process.env.DEV_LOGIN_PASSWORD;

	if (!email || !password) {
		return Response.json(
			{ error: "Dev login credentials are not configured" },
			{ status: 503 },
		);
	}

	return auth.handler(
		new Request(new URL("/api/auth/sign-in/email", request.url), {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email, password }),
		}),
	);
}
