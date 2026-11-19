import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  Healthy: 'bg-chart-2/15 text-chart-2',
  Sick: 'bg-chart-1/15 text-chart-1',
  'In Surgery': 'bg-destructive/15 text-destructive',
}

export function HealthBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {status}
    </span>
  )
}
