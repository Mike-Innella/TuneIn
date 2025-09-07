import { useMemo } from "react"

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User display name
 * @property {string} [avatarUrl] - User avatar URL
 */

/**
 * Mock user data hook - TODO: wire to real auth
 * @returns {{ user: User }}
 */
export function useUser() {
  const user = useMemo(() => ({
    id: "demo-user-1",
    email: "mike@example.com", 
    name: "Mike Innella",
    avatarUrl: "https://i.pravatar.cc/120?img=12"
  }), [])

  return { user }
}
