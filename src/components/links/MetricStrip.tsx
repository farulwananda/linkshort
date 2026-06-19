import { Link2, MousePointerClick, TrendingUp, Layers } from 'lucide-react'
import { formatNumber } from '#/lib/utils'

type MetricStripProps = {
  total: number
  active: number
  archived: number
  totalClicks: number
}

export function MetricStrip({ total, active, archived, totalClicks }: MetricStripProps) {
  const metrics = [
    { label: 'Total links', value: formatNumber(total), icon: Link2 },
    { label: 'Active', value: formatNumber(active), icon: TrendingUp },
    { label: 'Archived', value: formatNumber(archived), icon: Layers },
    { label: 'Total clicks', value: formatNumber(totalClicks), icon: MousePointerClick },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div
            key={metric.label}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3.5 py-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
              <Icon size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                {metric.label}
              </span>
              <span className="text-lg font-semibold leading-tight text-neutral-900">
                {metric.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
