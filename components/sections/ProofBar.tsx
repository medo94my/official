import StaggeredList from '@/components/motion/StaggeredList'

type Stat = { id: string; label: string; value: string }

/**
 * A measurement strip, not a hero banner.
 *
 * Hidden while the table is empty, which is the shipped state — these are
 * numeric claims about the owner and only the owner can make them truthfully.
 * The section is structurally complete and simply absent until real values
 * exist, rather than showing invented placeholders.
 */
export default function ProofBar({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null

  return (
    <StaggeredList
      as="dl"
      gap="tight"
      distance="nudge"
      className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-border py-7 sm:grid-cols-3"
    >
      {stats.map((stat) => (
        <div key={stat.id}>
          {/* Mono and tabular: these are measured values, and the type system
              on this page says mono means a fact from the system. */}
          <dd className="font-mono text-2xl font-semibold tracking-tight tnum text-foreground">
            {stat.value}
          </dd>
          <dt className="label mt-1">{stat.label}</dt>
        </div>
      ))}
    </StaggeredList>
  )
}
