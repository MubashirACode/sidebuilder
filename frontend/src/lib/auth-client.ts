// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BASEURL,
  fetchOptions: {
    credentials: "include",
  },
})
