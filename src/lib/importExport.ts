import type { ShortLink, UiPrefs } from './types'
import { UI_KEY } from './types'
import { isValidSlug, isValidUrl, normalizeUrl, slugify } from './utils'

export function linksToCsv(links: ShortLink[]): string {
  const headers = [
    'id',
    'title',
    'slug',
    'destinationUrl',
    'tags',
    'status',
    'totalClicks',
    'lastClickedAt',
    'createdAt',
    'updatedAt',
  ]
  const escape = (value: string): string => {
    if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
    return value
  }
  const rows = links.map((link) =>
    [
      link.id,
      link.title,
      link.slug,
      link.destinationUrl,
      link.tags.join('|'),
      link.status,
      String(link.totalClicks),
      link.lastClickedAt ?? '',
      link.createdAt,
      link.updatedAt,
    ]
      .map(escape)
      .join(','),
  )
  return [headers.join(','), ...rows].join('\n')
}

export function downloadFile(filename: string, content: string, mime: string): void {
  if (typeof document === 'undefined') return
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export type ImportResult = {
  valid: ShortLink[]
  errors: string[]
  skipped: number
  slugCollisions: number
}

type RawImport = Partial<ShortLink> & Record<string, unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseImportJson(raw: string): ImportResult {
  const errors: string[] = []
  const valid: ShortLink[] = []
  let skipped = 0
  let slugCollisions = 0

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (e) {
    errors.push(`Invalid JSON: ${(e as Error).message}`)
    return { valid, errors, skipped, slugCollisions }
  }

  if (!Array.isArray(data)) {
    errors.push('JSON root must be an array of link objects.')
    return { valid, errors, skipped, slugCollisions }
  }

  const seenSlugs = new Set<string>()
  data.forEach((item, index) => {
    if (!isRecord(item)) {
      skipped += 1
      errors.push(`Row ${index + 1}: not an object`)
      return
    }
    const record = item as RawImport
    const title = typeof record.title === 'string' ? record.title.trim() : ''
    const slug = typeof record.slug === 'string' ? record.slug.trim().toLowerCase() : ''
    const destinationUrl =
      typeof record.destinationUrl === 'string' ? record.destinationUrl.trim() : ''
    const tags = Array.isArray(record.tags)
      ? record.tags.filter((t): t is string => typeof t === 'string').map((t) => t.toLowerCase())
      : []
    const status =
      record.status === 'active' || record.status === 'inactive' || record.status === 'archived'
        ? record.status
        : 'active'
    const totalClicks =
      typeof record.totalClicks === 'number' && Number.isFinite(record.totalClicks)
        ? Math.max(0, Math.floor(record.totalClicks))
        : 0
    const lastClickedAt =
      typeof record.lastClickedAt === 'string' && record.lastClickedAt
        ? record.lastClickedAt
        : null
    const createdAt =
      typeof record.createdAt === 'string' && record.createdAt ? record.createdAt : new Date().toISOString()
    const updatedAt =
      typeof record.updatedAt === 'string' && record.updatedAt ? record.updatedAt : createdAt

    if (!title) {
      skipped += 1
      errors.push(`Row ${index + 1}: missing title`)
      return
    }
    if (!slug || !isValidSlug(slug)) {
      skipped += 1
      errors.push(`Row ${index + 1}: invalid slug "${slug || '(empty)'}"`)
      return
    }
    if (seenSlugs.has(slug)) {
      slugCollisions += 1
      return
    }
    seenSlugs.add(slug)
    if (!destinationUrl || !isValidUrl(normalizeUrl(destinationUrl))) {
      skipped += 1
      errors.push(`Row ${index + 1}: invalid destination URL`)
      return
    }
    valid.push({
      id: typeof record.id === 'string' ? record.id : crypto.randomUUID(),
      title,
      slug,
      destinationUrl: normalizeUrl(destinationUrl),
      tags,
      status,
      totalClicks,
      lastClickedAt,
      createdAt,
      updatedAt,
    })
  })

  return { valid, errors, skipped, slugCollisions }
}

export function pickUniqueSlug(
  base: string,
  existing: string[],
  maxAttempts = 20,
): string {
  const cleaned = slugify(base) || 'link'
  if (!existing.includes(cleaned)) return cleaned
  for (let i = 2; i <= maxAttempts; i++) {
    const candidate = `${cleaned}-${i}`
    if (!existing.includes(candidate)) return candidate
  }
  return `${cleaned}-${Date.now().toString(36)}`
}

const DEFAULT_UI_PREFS: UiPrefs = {
  linksView: 'table',
  dismissedTips: [],
}

export function loadUiPrefs(): UiPrefs {
  if (typeof window === 'undefined') return DEFAULT_UI_PREFS
  try {
    const raw = window.localStorage.getItem(UI_KEY)
    if (!raw) return DEFAULT_UI_PREFS
    const parsed = JSON.parse(raw) as Partial<UiPrefs>
    return { ...DEFAULT_UI_PREFS, ...parsed }
  } catch {
    return DEFAULT_UI_PREFS
  }
}

export function saveUiPrefs(prefs: UiPrefs): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(UI_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}
