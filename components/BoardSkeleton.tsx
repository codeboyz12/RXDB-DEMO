export function BoardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400">Loading…</p>
      </div>
    </div>
  );
}
