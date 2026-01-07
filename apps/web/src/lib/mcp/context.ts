import { createContext } from "xmcp"

type AuthContext = {
	apiKey: string | null
	userId: string | null
}

export const authContext = createContext<AuthContext>({ name: "mcp-auth" })
