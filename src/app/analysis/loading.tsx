export default function AnalysisLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
      <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="h-60 w-full animate-pulse rounded bg-gray-200" />
    </div>
  );
}
