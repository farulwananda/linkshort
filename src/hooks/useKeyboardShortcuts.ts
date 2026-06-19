import { useEffect } from 'react'

export type ShortcutHandlers = {
  onFocusSearch?: () => void
  onNew?: () => void
  onEscape?: () => void
  onSelectAll?: () => void
  onClearSelection?: () => void
  onExport?: () => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  )
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditableTarget(e.target)) {
          ;(e.target as HTMLElement).blur?.()
          return
        }
        handlers.onEscape?.()
        return
      }
      if (isEditableTarget(e.target)) return
      if (e.metaKey || e.ctrlKey || e.altKey) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
          if (handlers.onSelectAll) {
            e.preventDefault()
            handlers.onSelectAll()
          }
        }
        return
      }
      if (e.key === '/') {
        e.preventDefault()
        handlers.onFocusSearch?.()
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handlers.onNew?.()
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault()
        handlers.onExport?.()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handlers, enabled])
}
