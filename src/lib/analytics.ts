import {
  ANALYTICS_SEED_KEY,
  type AnalyticsSummary,
  type Insight,
  type ShortLink,
  type TagSummary,
  type TrendPoint,
} from './types'

export function buildTagSummaries(links: ShortLink[]): TagSummary[] {
  const map = new Map<string, TagSummary>()
  for (const link of links) {
    for (const tag of link.tags) {
      const existing = map.get(tag)
      if (existing) {
        existing.linkCount += 1
        existing.totalClicks += link.totalClicks
        if (link.status === 'active') existing.activeCount += 1
        else if (link.status === 'inactive') existing.inactiveCount += 1
        else if (link.status === 'archived') existing.archivedCount += 1
      } else {
        const summary: TagSummary = {
          name: tag,
          linkCount: 1,
          activeCount: link.status === 'active' ? 1 : 0,
          inactiveCount: link.status === 'inactive' ? 1 : 0,
          archivedCount: link.status === 'archived' ? 1 : 0,
          totalClicks: link.totalClicks,
        }
        map.set(tag, summary)
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalClicks - a.totalClicks)
}

const STALE_DAYS = 60

export function isStale(link: ShortLink): boolean {
  if (link.status === 'archived') return false
  if (link.totalClicks === 0) return false
  if (!link.lastClickedAt) return true
  const days = (Date.now() - new Date(link.lastClickedAt).getTime()) / 86400000
  return days > STALE_DAYS
}

export function buildAnalytics(links: ShortLink[]): AnalyticsSummary {
  const activeLinks = links.filter((l) => l.status === 'active').length
  const inactiveLinks = links.filter((l) => l.status === 'inactive').length
  const archivedLinks = links.filter((l) => l.status === 'archived').length
  const totalClicks = links.reduce((sum, l) => sum + l.totalClicks, 0)
  const archivedClicks = links
    .filter((l) => l.status === 'archived')
    .reduce((sum, l) => sum + l.totalClicks, 0)

  const topLinks = [...links]
    .filter((l) => l.totalClicks > 0)
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 5)

  const topTags = buildTagSummaries(links).slice(0, 5)
  const staleLinks = links.filter(isStale).sort((a, b) => b.totalClicks - a.totalClicks)

  const topLink = topLinks[0] ?? null
  const topTag = topTags[0] ?? null

  return {
    totalLinks: links.length,
    activeLinks,
    inactiveLinks,
    archivedLinks,
    totalClicks,
    topLinks,
    topTags,
    staleLinks,
    archivedClicks,
    topLink,
    topTag,
  }
}

export type { InsightKind, Insight } from './types'

export function buildInsights(links: ShortLink[], summary: AnalyticsSummary): Insight[] {
  const insights: Insight[] = []
  if (links.length === 0) {
    insights.push({
      kind: 'empty',
      title: 'No data yet',
      detail: 'Create links to start seeing analytics insights.',
      tone: 'neutral',
    })
    return insights
  }
  if (summary.topLink) {
    insights.push({
      kind: 'top',
      title: 'Top performer',
      detail: `"${summary.topLink.title}" leads with ${summary.topLink.totalClicks.toLocaleString()} clicks.`,
      tone: 'positive',
    })
  }
  if (summary.topTag) {
    insights.push({
      kind: 'top',
      title: 'Top tag',
      detail: `#${summary.topTag.name} drives ${summary.topTag.totalClicks.toLocaleString()} clicks across ${summary.topTag.linkCount} links.`,
      tone: 'positive',
    })
  }
  if (summary.staleLinks.length > 0) {
    const count = summary.staleLinks.length
    insights.push({
      kind: 'stale',
      title: `${count} stale ${count === 1 ? 'link' : 'links'}`,
      detail: `Not clicked in over ${STALE_DAYS} days. Consider archiving or refreshing.`,
      tone: 'warning',
    })
  }
  const inactiveHigh = links.filter(
    (l) => l.status === 'inactive' && l.totalClicks > 0,
  )
  if (inactiveHigh.length > 0) {
    insights.push({
      kind: 'inactiveHigh',
      title: `${inactiveHigh.length} inactive with clicks`,
      detail: 'Some inactive links still receive clicks. Reactivate or archive them.',
      tone: 'warning',
    })
  }
  if (summary.archivedClicks > 0) {
    insights.push({
      kind: 'archivedClicks',
      title: 'Archived links still tracked',
      detail: `${summary.archivedClicks.toLocaleString()} clicks recorded on archived links.`,
      tone: 'neutral',
    })
  }
  return insights
}

function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

export function buildClickTrend(
  links: ShortLink[],
  days = 14,
  seedKey = ANALYTICS_SEED_KEY,
): TrendPoint[] {
  if (links.length === 0) {
    return buildEmptyTrend(days)
  }

  let seed = 0
  for (const link of links) {
    for (let i = 0; i < link.slug.length; i++) seed += link.slug.charCodeAt(i)
    seed += link.totalClicks
    seed += link.status.length * 13
  }
  let storedSeed: number | null = null
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(seedKey)
      if (raw) storedSeed = Number(raw)
      if (!raw || Number.isNaN(storedSeed)) {
        storedSeed = seed
        window.localStorage.setItem(seedKey, String(seed))
      }
    }
  } catch {
    /* ignore */
  }
  const rng = seededRandom(storedSeed ?? seed)

  const total = links.reduce((sum, l) => sum + l.totalClicks, 0)
  const targetTotal = total > 0 ? total : Math.max(days * 2, links.length * 9)
  const weights: number[] = []
  const dates: Date[] = []

  for (let index = 0; index < days; index++) {
    const date = new Date(Date.now() - (days - 1 - index) * 86400000)
    const dow = date.getDay()
    const weekend = dow === 0 || dow === 6
    const recency = 0.7 + (index / Math.max(days - 1, 1)) * 0.65
    const weekdayFactor = weekend ? 0.55 : dow === 2 || dow === 3 ? 1.35 : 1
    const jitter = 0.62 + rng() * 0.92
    const pulse = index % 5 === Math.floor((storedSeed ?? seed) % 5) ? 1.28 : 1
    dates.push(date)
    weights.push(recency * weekdayFactor * jitter * pulse)
  }

  const values = distributeTotal(targetTotal, weights)
  return dates.map((date, index) => ({
    label: date.toLocaleDateString(undefined, { weekday: 'short' }),
    value: values[index] ?? 0,
  }))
}

function buildEmptyTrend(days: number): TrendPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.now() - (days - 1 - index) * 86400000)
    return {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      value: 0,
    }
  })
}

function distributeTotal(total: number, weights: number[]): number[] {
  if (weights.length === 0 || total <= 0) return weights.map(() => 0)

  const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || 1
  const values = weights.map((weight) => Math.round((weight / weightSum) * total))
  let diff = total - values.reduce((sum, value) => sum + value, 0)
  const ranked = weights
    .map((weight, index) => ({ index, weight }))
    .sort((a, b) => b.weight - a.weight)

  for (let i = 0; diff !== 0 && ranked.length > 0; i++) {
    const target = ranked[i % ranked.length]
    if (diff > 0) {
      values[target.index] += 1
      diff -= 1
    } else if (values[target.index] > 0) {
      values[target.index] -= 1
      diff += 1
    }
  }

  return ensureVisibleVariance(values, ranked.map((item) => item.index))
}

function ensureVisibleVariance(values: number[], rankedIndexes: number[]): number[] {
  const uniquePositiveValues = new Set(values.filter((value) => value > 0))
  if (uniquePositiveValues.size >= Math.min(4, values.length)) return values

  const next = [...values]
  const donors = [...rankedIndexes].reverse()
  for (let step = 0; step < Math.min(4, rankedIndexes.length); step++) {
    const receiver = rankedIndexes[step]
    const donor = donors.find((index) => index !== receiver && next[index] > 1)
    if (donor === undefined) continue
    next[receiver] += step + 1
    next[donor] -= step + 1
    if (next[donor] < 0) {
      next[receiver] += next[donor]
      next[donor] = 0
    }
  }
  return next
}
