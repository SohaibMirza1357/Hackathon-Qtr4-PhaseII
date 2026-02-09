'use client';

/**
 * Dashboard error boundary (T021)
 *
 * Must be a Client Component — Next.js App Router requires error.tsx to be
 * a Client Component so it can accept the reset() callback and render
 * interactively after a runtime error.
 */

interface DashboardErrorProps {
  /** The error that was thrown during rendering or data fetching */
  error: Error & { digest?: string };
  /** Resets the error boundary and re-renders the segment */
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>

        <p className="text-red-600 text-sm mb-4">
          {error.message || 'An unexpected error occurred.'}
        </p>

        <button
          type="button"
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
