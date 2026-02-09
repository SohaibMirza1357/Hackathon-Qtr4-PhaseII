/**
 * Authenticated API client (T013)
 *
 * A thin fetch wrapper that retrieves a JWT from the custom /api/token
 * endpoint and attaches it as a Bearer token on every request to the
 * FastAPI backend.
 *
 * Security decisions:
 * - JWT is retrieved fresh on each call so stale / revoked tokens are
 *   not reused.
 * - The /api/token endpoint validates the Better Auth session cookie
 *   server-side and returns a HS256 JWT signed with BETTER_AUTH_SECRET.
 * - On 401 the user is immediately redirected to /sign-in.
 * - Content-Type is always set to application/json.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get a JWT from the custom token endpoint.
  // This endpoint validates the session cookie and returns a signed JWT.
  let token: string | null = null;
  try {
    const tokenRes = await fetch("/api/token");
    if (tokenRes.ok) {
      const data = await tokenRes.json();
      token = data?.token || null;
    }
  } catch {
    // No valid session or token retrieval failed
  }

  // Build request headers.
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — redirect to sign-in.
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/sign-in?expired=true";
  }

  return response;
}
