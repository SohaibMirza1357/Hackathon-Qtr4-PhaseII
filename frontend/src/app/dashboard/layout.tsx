'use client';

/**
 * Dashboard layout (T018)
 *
 * Wraps all dashboard routes with:
 * - Session-based auth guard: redirects to /sign-in when no session exists
 * - Top navigation bar with app name, user email, and sign-out button
 *
 * This must be a Client Component because it consumes the useSession hook
 * and handles the signOut action.
 */

import { useSession, signOut } from '@/lib/auth-client';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, isPending } = useSession();

  // Redirect to sign-in when the session check completes and there is no session
  useEffect(() => {
    if (!isPending && !session) {
      window.location.href = '/sign-in';
    }
  }, [isPending, session]);

  // Show a full-screen loading state while the session is being resolved
  if (isPending) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50"
        role="status"
        aria-label="Loading session"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // While the redirect is in progress (no session), render nothing to avoid flash
  if (!session) {
    return null;
  }

  const userEmail = session?.user?.email ?? '';

  async function handleSignOut() {
    await signOut();
    window.location.href = '/sign-in';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <nav
          className="flex items-center justify-between px-4 sm:px-6 py-3"
          aria-label="Main navigation"
        >
          {/* App name */}
          <a
            href="/dashboard"
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            Todo App
          </a>

          {/* User info and sign-out */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Email — hidden on very small screens to avoid overflow */}
            <span
              className="hidden sm:block text-sm text-gray-600 truncate max-w-[200px]"
              aria-label={`Signed in as ${userEmail}`}
            >
              {userEmail}
            </span>

            <button
              type="button"
              onClick={handleSignOut}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
