type Stat = {
  id: string
  label: string
  value: string
}

/**
 * Server component — no client JS. The Strapi `getStats()` fetch from the
 * original has been replaced by data passed down from the page.
 */
export default function StatsBar({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null

  return (
    <div className="w-full bg-primary text-black py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col items-center justify-center w-full sm:flex-1 p-2 border-b sm:border-b-0 sm:border-r last:border-0 border-black/20"
          >
            <p className="text-3xl sm:text-4xl font-bold">{stat.value}</p>
            <p className="text-sm sm:text-base uppercase tracking-wider font-semibold opacity-80">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
