type Stat = {
  id: string
  label: string
  value: string
}

/**
 * A measurement strip, not a hero banner. Hidden while the table is empty —
 * these are claims only the owner can make truthfully.
 */
export default function StatsBar({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null

  return (
    <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-border py-6 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.id}>
          <dd className="font-mono text-2xl font-semibold tracking-tight tnum">{stat.value}</dd>
          <dt className="label mt-1">{stat.label}</dt>
        </div>
      ))}
    </dl>
  )
}
