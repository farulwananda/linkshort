import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Link2,
  MousePointerClick,
  Tag as TagIcon,
  TrendingUp,
} from 'lucide-react'
import { Topbar } from '#/components/layout/Topbar'
import { useAppShell } from '#/components/layout/AppShell'
import { PageHeader } from '#/components/layout/PageHeader'
import { AnimatedPage } from '#/components/motion/AnimatedPage'
import { EmptyState } from '#/components/links/EmptyState'
import { Badge } from '#/components/ui/Badge'
import { useLinks } from '#/hooks/useLinks'
import {
  buildAnalytics,
  buildClickTrend,
  buildInsights,
} from '#/lib/analytics'
import { buildShortUrl, cn, formatNumber } from '#/lib/utils'
import { useReducedMotion } from '#/components/motion/variants'
import type { Insight, TrendPoint } from '#/lib/types'

export function AnalyticsView({ domain }: { domain: string }) {
  const shell = useAppShell()
  const { links, hydrated } = useLinks()

  const summary = useMemo(() => buildAnalytics(links), [links])
  const trend = useMemo(() => buildClickTrend(links), [links])
  const insights = useMemo(() => buildInsights(links, summary), [links, summary])

  const metrics = [
    {
      label: 'Total links',
      value: formatNumber(summary.totalLinks),
      icon: Link2,
      sub: `${summary.activeLinks} active`,
    },
    {
      label: 'Active links',
      value: formatNumber(summary.activeLinks),
      icon: TrendingUp,
      sub: `${summary.inactiveLinks} inactive`,
    },
    {
      label: 'Total clicks',
      value: formatNumber(summary.totalClicks),
      icon: MousePointerClick,
      sub: 'all time',
    },
    {
      label: 'Top link',
      value: summary.topLink ? formatNumber(summary.topLink.totalClicks) : '—',
      icon: BarChart3,
      sub: summary.topLink ? summary.topLink.title : 'no clicks yet',
    },
  ]

  return (
    <>
      <Topbar
        search=""
        onSearch={() => {}}
        onMenuClick={shell.openMobileSidebar}
        createLabel="New link"
      />

      <div className="flex-1 overflow-y-auto">
        <AnimatedPage className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader
            icon={<BarChart3 size={28} className="text-[#9065b0]" />}
            iconBg="bg-neutral-50 border border-neutral-200"
            title="Analytics"
            description="A local, mock-backed overview of your short link performance."
          />

          {!hydrated ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] animate-pulse rounded-lg border border-neutral-200 bg-white"
                />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white">
              <EmptyState
                icon={<BarChart3 size={20} />}
                title="No analytics yet"
                description="Create your first short link to start seeing metrics here."
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {metrics.map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    sub={metric.sub}
                    Icon={metric.icon}
                  />
                ))}
              </div>

              <TrendChart points={trend} />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TopLinksChart
                  links={summary.topLinks}
                  domain={domain}
                  maxClicks={summary.topLinks[0]?.totalClicks ?? 0}
                />
                <TopTagsChart
                  tags={summary.topTags}
                  maxClicks={summary.topTags[0]?.totalClicks ?? 0}
                />
              </div>

              <InsightPanel insights={insights} />
            </>
          )}
        </AnimatedPage>
      </div>
    </>
  )
}

function MetricCard({
  label,
  value,
  sub,
  Icon,
}: {
  label: string
  value: string
  sub: string
  Icon: typeof Link2
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3.5 py-3"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
        <Icon size={16} />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          {label}
        </span>
        <span className="truncate text-lg font-semibold leading-tight text-neutral-900">
          {value}
        </span>
        <span className="truncate text-[11px] text-neutral-400">{sub}</span>
      </div>
    </motion.div>
  )
}

function TrendChart({ points }: { points: TrendPoint[] }) {
  const reduced = useReducedMotion()
  const max = Math.max(1, ...points.map((p) => p.value))
  const total = points.reduce((sum, p) => sum + p.value, 0)
  const hasData = total > 0
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between pb-3">
        <div className="flex flex-col">
          <h2 className="text-[14px] font-semibold text-neutral-900">Click trend</h2>
          <p className="text-[12px] text-neutral-400">Last 14 days (mock distribution)</p>
        </div>
        <Badge tone="neutral">{formatNumber(total)} clicks</Badge>
      </div>
      {!hasData ? (
        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-center text-[13px] text-neutral-400">
          Create links or import click data to see a trend.
        </div>
      ) : (
        <div className="flex h-36 items-end gap-1.5">
          {points.map((point, i) => {
            const heightPct = (point.value / max) * 100
            return (
              <div
                key={`${point.label}-${i}`}
                className="group flex flex-1 flex-col items-center justify-end gap-1"
                title={`${point.label}: ${point.value} clicks`}
              >
                <motion.div
                  initial={reduced ? undefined : { height: 0 }}
                  animate={{
                    height: point.value > 0 ? `${Math.max(heightPct, 5)}%` : '0%',
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.4, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="w-full rounded-t bg-neutral-200 transition-colors group-hover:bg-neutral-900"
                  style={{ minHeight: point.value > 0 ? 4 : 0 }}
                />
                <span className="hidden text-[10px] text-neutral-400 sm:block">
                  {point.label[0]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function TopLinksChart({
  links,
  domain,
  maxClicks,
}: {
  links: Array<{ id: string; title: string; slug: string; totalClicks: number }>
  domain: string
  maxClicks: number
}) {
  const reduced = useReducedMotion()
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 pb-3">
        <Link2 size={15} className="text-neutral-400" />
        <h2 className="text-[14px] font-semibold text-neutral-900">Top links</h2>
      </div>
      {links.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-neutral-400">No clicks recorded yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {links.map((link, i) => {
            const pct = (link.totalClicks / maxClicks) * 100
            return (
              <div key={link.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium text-neutral-800">
                    <span className="mr-1.5 text-neutral-400">#{i + 1}</span>
                    {link.title}
                  </span>
                  <span className="shrink-0 tabular-nums text-[12px] text-neutral-500">
                    {formatNumber(link.totalClicks)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <motion.div
                    initial={reduced ? undefined : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={reduced ? { duration: 0 } : { duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-neutral-900"
                  />
                </div>
                <span className="truncate font-mono text-[11px] text-neutral-400">
                  {buildShortUrl(domain, link.slug)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function TopTagsChart({
  tags,
  maxClicks,
}: {
  tags: Array<{ name: string; totalClicks: number; linkCount: number }>
  maxClicks: number
}) {
  const reduced = useReducedMotion()
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 pb-3">
        <TagIcon size={15} className="text-neutral-400" />
        <h2 className="text-[14px] font-semibold text-neutral-900">Top tags</h2>
      </div>
      {tags.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-neutral-400">No tagged links yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tags.map((tag, i) => {
            const pct = (tag.totalClicks / maxClicks) * 100
            return (
              <div key={tag.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="blue" className="text-[12px]">
                    #{tag.name}
                  </Badge>
                  <span className="shrink-0 tabular-nums text-[12px] text-neutral-500">
                    {formatNumber(tag.totalClicks)} · {tag.linkCount} links
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <motion.div
                    initial={reduced ? undefined : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={reduced ? { duration: 0 } : { duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-blue-500"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function InsightPanel({ insights }: { insights: Insight[] }) {
  const toneIcon: Record<Insight['tone'], typeof Activity> = {
    positive: TrendingUp,
    warning: AlertTriangle,
    negative: AlertTriangle,
    neutral: Activity,
  }
  const toneClass: Record<Insight['tone'], string> = {
    positive: 'border-emerald-200 bg-emerald-50/60 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50/60 text-amber-700',
    negative: 'border-red-200 bg-red-50/60 text-red-700',
    neutral: 'border-neutral-200 bg-neutral-50/60 text-neutral-700',
  }
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 pb-3">
        <Archive size={15} className="text-neutral-400" />
        <h2 className="text-[14px] font-semibold text-neutral-900">Insights</h2>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {insights.map((insight) => {
          const Icon = toneIcon[insight.tone]
          return (
            <div
              key={insight.title}
              className={cn(
                'flex items-start gap-2.5 rounded-lg border p-3',
                toneClass[insight.tone],
              )}
            >
              <Icon size={15} className="mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-medium">{insight.title}</span>
                <span className="text-[12px] opacity-80">{insight.detail}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
