import { useCallback, useEffect, useState } from 'react'
import { loadSettings, saveSettings } from '#/lib/storage'
import type { Settings, ThemeMode } from '#/lib/types'
import { DEFAULT_SETTINGS } from '#/lib/seed'

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

function applyTheme(mode: ThemeMode): 'light' | 'dark' {
  const resolved = resolveTheme(mode)
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }
  return resolved
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [hydrated, setHydrated] = useState(false)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    setResolvedTheme(applyTheme(loaded.theme))
    setHydrated(true)
  }, [])

  // React to system theme changes when in "system" mode
  useEffect(() => {
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setResolvedTheme(applyTheme('system'))
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.theme])

  const update = useCallback((next: Settings) => {
    setSettings(next)
    saveSettings(next)
    setResolvedTheme(applyTheme(next.theme))
  }, [])

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      update({ ...settings, theme })
    },
    [settings, update],
  )

  return { settings, hydrated, update, setTheme, resolvedTheme }
}
