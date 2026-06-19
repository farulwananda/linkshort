export type LinkStatus = 'active' | 'inactive' | 'archived'

export type ShortLink = {
  id: string
  title: string
  slug: string
  destinationUrl: string
  tags: string[]
  status: LinkStatus
  totalClicks: number
  lastClickedAt: string | null
  createdAt: string
  updatedAt: string
}

export type LinkDraft = {
  title: string
  slug: string
  destinationUrl: string
  tags: string[]
  status: LinkStatus
}

export type LinkFilter = 'all' | 'active' | 'inactive' | 'archived'

export type SortKey = 'createdAt' | 'title' | 'totalClicks' | 'lastClickedAt'

export type SortDir = 'asc' | 'desc'

export type SortState = {
  key: SortKey
  dir: SortDir
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type Settings = {
  domain: string
  theme: ThemeMode
}

export type TagSummary = {
  name: string
  linkCount: number
  activeCount: number
  inactiveCount: number
  archivedCount: number
  totalClicks: number
}

export type AnalyticsSummary = {
  totalLinks: number
  activeLinks: number
  inactiveLinks: number
  archivedLinks: number
  totalClicks: number
  topLinks: ShortLink[]
  topTags: TagSummary[]
  staleLinks: ShortLink[]
  archivedClicks: number
  topLink: ShortLink | null
  topTag: TagSummary | null
}

export type TrendPoint = {
  label: string
  value: number
}

export type InsightKind = 'top' | 'stale' | 'inactiveHigh' | 'archivedClicks' | 'empty'

export type Insight = {
  kind: InsightKind
  title: string
  detail: string
  tone: 'neutral' | 'positive' | 'warning' | 'negative'
}

export type UiPrefs = {
  linksView?: 'table' | 'list'
  dismissedTips?: string[]
}

export const SESSION_KEY = 'linkshort.session'
export const LINKS_KEY = 'linkshort.links'
export const SETTINGS_KEY = 'linkshort.settings'
export const ANALYTICS_SEED_KEY = 'linkshort.analyticsSeed'
export const UI_KEY = 'linkshort.ui'
