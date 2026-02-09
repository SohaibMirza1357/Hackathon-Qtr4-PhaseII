/**
 * Better Auth client-side instance (T012)
 *
 * Provides React hooks and action helpers (signIn, signUp, signOut, useSession)
 * for use in Client Components. This module must only be imported in files that
 * run in the browser — never in Server Components or server-only modules.
 *
 * Security decisions:
 * - baseURL defaults to the app's own origin so auth requests go to the same
 *   host and benefit from SameSite cookie protections.
 * - NEXT_PUBLIC_BETTER_AUTH_URL must match the server-side BETTER_AUTH_URL
 *   to ensure consistent redirect/callback behaviour.
 * - No secrets are referenced here — this file is safe to be bundled into
 *   client-side JavaScript.
 */

import { createAuthClient } from "better-auth/react";

// Initialise the Better Auth client pointing at the Next.js app origin.
// NEXT_PUBLIC_BETTER_AUTH_URL is exposed to the browser bundle; it must NOT
// contain any secret values.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

// Re-export individual helpers for ergonomic imports in components:
//   import { signIn, useSession } from "@/lib/auth-client"
export const { signIn, signUp, signOut, useSession } = authClient;
