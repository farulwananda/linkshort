import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadLinks, saveLinks } from '#/lib/storage'
import { createId, nowIso } from '#/lib/utils'
import { pickUniqueSlug } from '#/lib/importExport'
import type { LinkDraft, ShortLink } from '#/lib/types'

export function useLinks() {
  const [links, setLinks] = useState<ShortLink[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLinks(loadLinks())
    setHydrated(true)
  }, [])

  const persist = useCallback((next: ShortLink[]) => {
    setLinks(next)
    saveLinks(next)
  }, [])

  const createLink = useCallback(
    (draft: LinkDraft): ShortLink => {
      const now = nowIso()
      const link: ShortLink = {
        id: createId(),
        title: draft.title.trim(),
        slug: draft.slug.trim(),
        destinationUrl: draft.destinationUrl.trim(),
        tags: draft.tags,
        status: draft.status,
        totalClicks: 0,
        lastClickedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      persist([link, ...links])
      return link
    },
    [links, persist],
  )

  const updateLink = useCallback(
    (id: string, draft: LinkDraft): void => {
      const next = links.map((link) =>
        link.id === id
          ? {
              ...link,
              title: draft.title.trim(),
              slug: draft.slug.trim(),
              destinationUrl: draft.destinationUrl.trim(),
              tags: draft.tags,
              status: draft.status,
              updatedAt: nowIso(),
            }
          : link,
      )
      persist(next)
    },
    [links, persist],
  )

  const patchLink = useCallback(
    (id: string, patch: Partial<ShortLink>): void => {
      const next = links.map((link) =>
        link.id === id ? { ...link, ...patch, updatedAt: nowIso() } : link,
      )
      persist(next)
    },
    [links, persist],
  )

  const deleteLink = useCallback(
    (id: string): void => {
      persist(links.filter((link) => link.id !== id))
    },
    [links, persist],
  )

  const archiveLink = useCallback(
    (id: string): void => {
      patchLink(id, { status: 'archived' })
    },
    [patchLink],
  )

  const restoreLink = useCallback(
    (id: string): void => {
      patchLink(id, { status: 'active' })
    },
    [patchLink],
  )

  const toggleActive = useCallback(
    (id: string): void => {
      const link = links.find((l) => l.id === id)
      if (!link) return
      patchLink(id, { status: link.status === 'active' ? 'inactive' : 'active' })
    },
    [links, patchLink],
  )

  const slugExists = useCallback(
    (slug: string, exceptId?: string): boolean => {
      const target = slug.trim().toLowerCase()
      return links.some(
        (link) => link.slug.toLowerCase() === target && link.id !== exceptId,
      )
    },
    [links],
  )

  const duplicateLink = useCallback(
    (id: string): ShortLink | null => {
      const source = links.find((l) => l.id === id)
      if (!source) return null
      const now = nowIso()
      const usedSlugs = links.map((l) => l.slug.toLowerCase())
      const slug = pickUniqueSlug(source.slug, usedSlugs)
      const copy: ShortLink = {
        id: createId(),
        title: `${source.title} (copy)`,
        slug,
        destinationUrl: source.destinationUrl,
        tags: source.tags,
        status: source.status === 'archived' ? 'inactive' : source.status,
        totalClicks: 0,
        lastClickedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      persist([copy, ...links])
      return copy
    },
    [links, persist],
  )

  const bulkPatch = useCallback(
    (ids: string[], patch: Partial<ShortLink>): void => {
      const idSet = new Set(ids)
      const now = nowIso()
      const next = links.map((link) =>
        idSet.has(link.id) ? { ...link, ...patch, updatedAt: now } : link,
      )
      persist(next)
    },
    [links, persist],
  )

  const bulkArchive = useCallback((ids: string[]) => bulkPatch(ids, { status: 'archived' }), [bulkPatch])
  const bulkRestore = useCallback((ids: string[]) => bulkPatch(ids, { status: 'active' }), [bulkPatch])
  const bulkActivate = useCallback((ids: string[]) => bulkPatch(ids, { status: 'active' }), [bulkPatch])
  const bulkDeactivate = useCallback((ids: string[]) => bulkPatch(ids, { status: 'inactive' }), [bulkPatch])

  const bulkDelete = useCallback(
    (ids: string[]): void => {
      const idSet = new Set(ids)
      persist(links.filter((link) => !idSet.has(link.id)))
    },
    [links, persist],
  )

  const importLinks = useCallback(
    (incoming: ShortLink[]): { added: number; merged: number } => {
      const byId = new Map(links.map((l) => [l.id, l]))
      const bySlug = new Map(links.map((l) => [l.slug.toLowerCase(), l]))
      const usedSlugs = links.map((l) => l.slug.toLowerCase())
      let added = 0
      let merged = 0
      for (const item of incoming) {
        const existing = byId.get(item.id)
        if (existing) {
          byId.set(item.id, { ...item, updatedAt: nowIso() })
          bySlug.set(item.slug.toLowerCase(), { ...item, updatedAt: nowIso() })
          merged += 1
          continue
        }
        let slug = item.slug.toLowerCase()
        if (bySlug.has(slug)) {
          slug = pickUniqueSlug(slug, usedSlugs)
        }
        usedSlugs.push(slug)
        const newLink: ShortLink = { ...item, id: createId(), slug, updatedAt: nowIso() }
        byId.set(newLink.id, newLink)
        bySlug.set(newLink.slug.toLowerCase(), newLink)
        added += 1
      }
      persist(Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      return { added, merged }
    },
    [links, persist],
  )

  const renameTag = useCallback(
    (oldName: string, newName: string): void => {
      const clean = newName.trim().toLowerCase()
      if (!clean || clean === oldName) return
      const now = nowIso()
      const next = links.map((link) => {
        if (!link.tags.includes(oldName)) return link
        const dedup = new Set(link.tags.map((t) => (t === oldName ? clean : t)))
        return { ...link, tags: Array.from(dedup), updatedAt: now }
      })
      persist(next)
    },
    [links, persist],
  )

  const deleteTag = useCallback(
    (name: string): void => {
      const now = nowIso()
      const next = links.map((link) => {
        if (!link.tags.includes(name)) return link
        return {
          ...link,
          tags: link.tags.filter((t) => t !== name),
          updatedAt: now,
        }
      })
      persist(next)
    },
    [links, persist],
  )

  const stats = useMemo(() => {
    const active = links.filter((l) => l.status === 'active').length
    const totalClicks = links.reduce((sum, l) => sum + l.totalClicks, 0)
    return {
      total: links.length,
      active,
      archived: links.filter((l) => l.status === 'archived').length,
      totalClicks,
    }
  }, [links])

  return {
    links,
    hydrated,
    createLink,
    updateLink,
    patchLink,
    deleteLink,
    archiveLink,
    restoreLink,
    toggleActive,
    slugExists,
    duplicateLink,
    bulkArchive,
    bulkRestore,
    bulkActivate,
    bulkDeactivate,
    bulkDelete,
    importLinks,
    renameTag,
    deleteTag,
    stats,
  }
}

export type UseLinksReturn = ReturnType<typeof useLinks>
