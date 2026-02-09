"use client";

/**
 * Root page (T015)
 *
 * Checks whether a Better Auth session exists on mount. Redirects
 * authenticated users to /dashboard and unauthenticated users to /sign-in.
 * Renders a neutral loading message while the session status is pending to
 * avoid a flash of incorrect content.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Wait until Better Auth has resolved the session before redirecting.
    if (isPending) return;

    if (session) {
      router.replace("/dashboard");
    } else {
      router.replace("/sign-in");
    }
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Redirecting&hellip;</p>
    </div>
  );
}
