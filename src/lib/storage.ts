import {
  LINKS_KEY,
  SESSION_KEY,
  SETTINGS_KEY,
  type Settings,
  type ShortLink,
} from './types'
import { SEED_LINKS, DEFAULT_SETTINGS } from './seed'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadLinks(): ShortLink[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(LINKS_KEY)
    if (!raw) {
      window.localStorage.setItem(LINKS_KEY, JSON.stringify(SEED_LINKS))
      return SEED_LINKS
    }
    const parsed = JSON.parse(raw) as ShortLink[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveLinks(links: ShortLink[]): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(LINKS_KEY, JSON.stringify(links))
  } catch {
    /* ignore quota errors */
  }
}

export function loadSettings(): Settings {
  if (!isBrowser()) return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

export function loadSession(): boolean {
  if (!isBrowser()) return false
  try {
    return window.localStorage.getItem(SESSION_KEY) === 'active'
  } catch {
    return false
  }
}

export function setSession(active: boolean): void {
  if (!isBrowser()) return
  try {
    if (active) {
      window.localStorage.setItem(SESSION_KEY, 'active')
    } else {
      window.localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    /* ignore */
  }
}
