import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins";
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [inferAdditionalFields({
        user:{
            role: {
                type: "string",
                default: "guest"
            },
        }
    })],
})

export const { signIn, signOut, signUp, useSession } = authClient;