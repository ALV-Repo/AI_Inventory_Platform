export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-200" />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl bg-white shadow-sm"
            />
          ))}
        </div>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="h-96 animate-pulse rounded-xl bg-white shadow-sm" />

          <div className="h-96 animate-pulse rounded-xl bg-white shadow-sm" />

        </div>

        {/* Bottom section */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm" />

          <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm" />

        </div>

      </div>
    </div>
  );
}