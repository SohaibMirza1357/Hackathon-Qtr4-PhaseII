/**
 * Better Auth catch-all API route handler (T011)
 *
 * This file wires the Better Auth server instance into the Next.js App Router.
 * All requests under /api/auth/* (sign-in, sign-up, sign-out, session, etc.)
 * are proxied through `toNextJsHandler`, which translates between Next.js
 * Request/Response types and Better Auth's internal handler.
 *
 * Security decisions:
 * - No custom logic here — keeps the auth surface minimal and auditable.
 * - Route-level protection (e.g. CSRF, origin checks) is delegated to Better Auth
 *   internals and the framework's built-in SameSite cookie behaviour.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Export named GET and POST handlers required by the Next.js App Router.
// Better Auth handles all sub-paths: /api/auth/sign-in, /api/auth/sign-up, etc.
export const { GET, POST } = toNextJsHandler(auth);
