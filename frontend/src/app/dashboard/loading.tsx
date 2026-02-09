/**
 * Dashboard loading state (T020)
 *
 * Server Component — no "use client" needed.
 * Renders skeleton placeholders that visually match the dashboard layout
 * while async data is being fetched.
 */

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Loading dashboard">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block h-4 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-4">
        {/* Skeleton task cards */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
