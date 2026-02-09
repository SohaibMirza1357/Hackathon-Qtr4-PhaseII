/**
 * Better Auth server-side configuration (T010)
 *
 * This module initializes the Better Auth instance that runs exclusively on the
 * server. It owns session creation, credential verification, and token issuance.
 *
 * Security decisions:
 * - All secrets come from environment variables — never hardcoded.
 * - `pg` Pool is used so Better Auth manages its own tables (users, sessions, etc.)
 *   directly in the Neon Serverless PostgreSQL database.
 * - minPasswordLength: 8 enforced at the auth-library level as a first gate;
 *   additional complexity rules can be layered in the sign-up flow.
 * - Short session lifetime (1 hour) with a 5-minute rolling update window limits
 *   the blast radius of a stolen session token.
 */

import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  // Database — Better Auth creates and manages its own schema tables
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  // Signing secret — must be at least 32 random bytes in production.
  // Set BETTER_AUTH_SECRET in .env (never commit the actual value).
  secret: process.env.BETTER_AUTH_SECRET,

  // Base URL of the Next.js app — used for redirect and callback URLs.
  // Set BETTER_AUTH_URL in .env (e.g. http://localhost:3000 locally).
  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    // Enforce a minimum password length at the library boundary.
    minPasswordLength: 8,
  },

  session: {
    // Access sessions expire after 1 hour of issuance.
    expiresIn: 3600,
    // Rolling window: session TTL resets if the session is touched within
    // 5 minutes of the previous update, reducing unnecessary DB writes.
    updateAge: 300,
  },

});
