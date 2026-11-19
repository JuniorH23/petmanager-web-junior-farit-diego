import { HEALTH_STATUSES, type Pet } from '@/lib/pets'
import { HealthBadge } from '@/components/health-badge'

const BAR_COLOR: Record<string, string> = {
  Healthy: 'bg-chart-2',
  Sick: 'bg-chart-1',
  'In Surgery': 'bg-destructive',
}

export function HealthSummary({ pets }: { pets: Pet[] }) {
  const dogs = pets.filter((p) => p.kind === 'dog').length
  const cats = pets.filter((p) => p.kind === 'cat').length
  const total = pets.length

  return (
    <section aria-label="Summary" className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_2fr]">
      <Stat label="Total pets" value={total} />
      <Stat label="Dogs" value={dogs} />
      <Stat label="Cats" value={cats} />
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium text-muted-foreground">Health status report</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {HEALTH_STATUSES.map((status) => {
            const count = pets.filter((p) => p.healthStatus === status).length
            const pct = total ? Math.round((count / total) * 100) : 0
            return (
              <li key={status} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0">
                  <HealthBadge status={status} />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className={`h-full rounded-full ${BAR_COLOR[status]}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-16 text-right tabular-nums text-muted-foreground">
                  {count} <span className="sr-only">pets,</span>({pct}%)
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}
