export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin" />
        <p className="text-gray-400">Loading…</p>
      </div>
    </div>
  )
}
