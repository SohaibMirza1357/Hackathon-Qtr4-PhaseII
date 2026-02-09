/**
 * Custom JWT token endpoint
 *
 * Validates the Better Auth session cookie, then creates a signed HS256 JWT
 * containing the user's ID as the `sub` claim. This JWT is sent by the
 * frontend to the FastAPI backend as a Bearer token.
 *
 * This avoids depending on Better Auth's JWT plugin and gives us full
 * control over the token format that the Python backend expects.
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createHmac } from "crypto";
import { NextResponse } from "next/server";

function createJWT(payload: Record<string, unknown>, secret: string): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const token = createJWT(
    {
      sub: session.user.id,
      email: session.user.email,
      iat: now,
      exp: now + 3600,
    },
    process.env.BETTER_AUTH_SECRET!
  );

  return NextResponse.json({ token });
}
