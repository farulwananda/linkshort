import { useEffect, useMemo, useState } from 'react'
import { Archive, Link2, Plus, SearchX, Upload, Download } from 'lucide-react'
import { Topbar } from '#/components/layout/Topbar'
import { useAppShell } from '#/components/layout/AppShell'
import { PageHeader } from '#/components/layout/PageHeader'
import { AnimatedPage } from '#/components/motion/AnimatedPage'
import { MetricStrip } from './MetricStrip'
import { LinkTable } from './LinkTable'
import { LinkDrawer } from './LinkDrawer'
import { ConfirmDialog } from './ConfirmDialog'
import { BulkActionBar } from './BulkActionBar'
import { ImportModal } from './ImportModal'
import { EmptyState, SkeletonRow } from './EmptyState'
import { SegmentedControl } from '#/components/ui/SegmentedControl'
import { Button } from '#/components/ui/Button'
import { useLinks } from '#/hooks/useLinks'
import { useKeyboardShortcuts } from '#/hooks/useKeyboardShortcuts'
import {
  downloadFile,
  linksToCsv,
} from '#/lib/importExport'
import { uniqueTags } from '#/lib/utils'
import type { LinkFilter, ShortLink, SortState } from '#/lib/types'

type LinkListViewProps = {
  domain: string
  lockToArchived?: boolean
}

type Confirm =
  | { kind: 'delete' | 'archive' | 'restore' | 'duplicate'; link: ShortLink }
  | { kind: 'bulkDelete' | 'bulkArchive' | 'bulkRestore'; count: number }
  | null

export function LinkListView({ domain, lockToArchived = false }: LinkListViewProps) {
  const shell = useAppShell()
  const {
    links,
    hydrated,
    createLink,
    updateLink,
    deleteLink,
    archiveLink,
    restoreLink,
    toggleActive,
    duplicateLink,
    bulkArchive,
    bulkRestore,
    bulkActivate,
    bulkDeactivate,
    bulkDelete,
    importLinks,
    slugExists,
    stats,
  } = useLinks()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LinkFilter>(lockToArchived ? 'archived' : 'all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [sort, setSort] = useState<SortState>({ key: 'createdAt', dir: 'desc' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<ShortLink | null>(null)
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [importOpen, setImportOpen] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allTags = useMemo(() => uniqueTags(links), [links])

  // Consume pending tag from Tags page "open links with this tag"
  useEffect(() => {
    if (lockToArchived || !hydrated) return
    try {
      const pending = window.sessionStorage.getItem('linkshort.pendingTag')
      if (pending) {
        window.sessionStorage.removeItem('linkshort.pendingTag')
        setTagFilter(pending)
        setFilter('all')
      }
    } catch {
      /* ignore */
    }
  }, [hydrated, lockToArchived])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const result = links.filter((link) => {
      if (lockToArchived && link.status !== 'archived') return false
      if (!lockToArchived && filter !== 'all' && link.status !== filter) return false
      if (tagFilter !== 'all' && !link.tags.includes(tagFilter)) return false
      if (!q) return true
      return (
        link.title.toLowerCase().includes(q) ||
        link.slug.toLowerCase().includes(q) ||
        link.destinationUrl.toLowerCase().includes(q) ||
        link.tags.some((t) => t.includes(q))
      )
    })

    result.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      switch (sort.key) {
        case 'title':
          return a.title.localeCompare(b.title) * dir
        case 'totalClicks':
          return (a.totalClicks - b.totalClicks) * dir
        case 'lastClickedAt': {
          const at = a.lastClickedAt ? new Date(a.lastClickedAt).getTime() : 0
          const bt = b.lastClickedAt ? new Date(b.lastClickedAt).getTime() : 0
          return (at - bt) * dir
        }
        case 'createdAt':
        default:
          return (
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
          )
      }
    })
    return result
  }, [links, search, filter, tagFilter, sort, lockToArchived])

  const filteredIds = useMemo(() => filtered.map((l) => l.id), [filtered])
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id))

  function handleSort(key: SortState['key']) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' },
    )
  }

  function openCreate() {
    setEditing(null)
    setDrawerOpen(true)
  }

  function openEdit(link: ShortLink) {
    setEditing(link)
    setDrawerOpen(true)
  }

  function handleSave(draft: Parameters<typeof createLink>[0]) {
    if (editing) {
      updateLink(editing.id, draft)
    } else {
      createLink(draft)
    }
    setDrawerOpen(false)
    setEditing(null)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds((prev) => {
      if (allSelected) {
        const next = new Set(prev)
        for (const id of filteredIds) next.delete(id)
        return next
      }
      const next = new Set(prev)
      for (const id of filteredIds) next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  function handleConfirm() {
    if (!confirm) return
    if (confirm.kind === 'delete') deleteLink(confirm.link.id)
    else if (confirm.kind === 'archive') archiveLink(confirm.link.id)
    else if (confirm.kind === 'restore') restoreLink(confirm.link.id)
    else if (confirm.kind === 'duplicate') duplicateLink(confirm.link.id)
    else if (confirm.kind === 'bulkDelete') {
      bulkDelete(Array.from(selectedIds))
      clearSelection()
    } else if (confirm.kind === 'bulkArchive') {
      bulkArchive(Array.from(selectedIds))
    } else if (confirm.kind === 'bulkRestore') {
      bulkRestore(Array.from(selectedIds))
    }
  }

  function exportSelection(format: 'json' | 'csv') {
    const ids =
      selectedIds.size > 0
        ? Array.from(selectedIds)
        : filtered.map((l) => l.id)
    const subset = links.filter((l) => ids.includes(l.id))
    const stamp = new Date().toISOString().slice(0, 10)
    if (format === 'json') {
      downloadFile(`linkshort-${stamp}.json`, JSON.stringify(subset, null, 2), 'application/json')
    } else {
      downloadFile(`linkshort-${stamp}.csv`, linksToCsv(subset), 'text/csv')
    }
  }

  // Keep selection in sync with deletions
  useEffect(() => {
    if (selectedIds.size === 0) return
    const linkIds = new Set(links.map((l) => l.id))
    if (Array.from(selectedIds).some((id) => !linkIds.has(id))) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const id of next) if (!linkIds.has(id)) next.delete(id)
        return next
      })
    }
  }, [links, selectedIds])

  useKeyboardShortcuts({
    onFocusSearch: () => {
      const input = document.querySelector<HTMLInputElement>(
        'input[aria-label="Search links"]',
      )
      input?.focus()
    },
    onNew: lockToArchived ? undefined : openCreate,
    onEscape: () => {
      if (drawerOpen) setDrawerOpen(false)
      else if (importOpen) setImportOpen(false)
      else if (confirm) setConfirm(null)
      else if (selectedIds.size > 0) clearSelection()
    },
    onSelectAll: lockToArchived ? undefined : selectAll,
    onClearSelection: clearSelection,
    onExport: () => exportSelection('json'),
  })

  const showEmpty = hydrated && filtered.length === 0
  const isSearchEmpty = showEmpty && (search !== '' || tagFilter !== 'all' || filter !== 'all')

  return (
    <>
      <Topbar
        search={search}
        onSearch={setSearch}
        onCreate={lockToArchived ? undefined : openCreate}
        onMenuClick={shell.openMobileSidebar}
        createLabel="New link"
        actions={
          !lockToArchived ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setImportOpen(true)} title="Import JSON (e)">
                <Upload size={15} />
                <span className="hidden md:inline">Import</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportSelection('csv')}
                title="Export CSV"
              >
                <Download size={15} />
                <span className="hidden md:inline">Export</span>
              </Button>
            </>
          ) : null
        }
      />

      <div className="flex-1 overflow-y-auto">
        <AnimatedPage className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader
            icon={
              lockToArchived ? (
                <Archive size={28} className="text-neutral-500" />
              ) : (
                <Link2 size={28} className="text-[#337ea9]" />
              )
            }
            iconBg="bg-neutral-50 border border-neutral-200"
            title={lockToArchived ? 'Archive' : 'Links'}
            description={
              lockToArchived
                ? 'Links you have archived. Restore them anytime.'
                : 'Manage your short links, track clicks, and keep things tidy.'
            }
          />

          <MetricStrip
            total={stats.total}
            active={stats.active}
            archived={stats.archived}
            totalClicks={stats.totalClicks}
          />

          {!lockToArchived ? (
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedControl<LinkFilter>
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
              {allTags.length > 0 ? (
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="h-8 rounded-md border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-700 outline-none hover:border-neutral-300 focus:ring-2 focus:ring-neutral-300"
                >
                  <option value="all">All tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
              ) : null}
              <span className="ml-auto text-[12px] text-neutral-400">
                {filtered.length} {filtered.length === 1 ? 'link' : 'links'}
                {selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : null}
              </span>
            </div>
          ) : null}

          {!hydrated ? (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : showEmpty ? (
            <div className="rounded-xl border border-neutral-200 bg-white">
              {isSearchEmpty ? (
                <EmptyState
                  icon={<SearchX size={20} />}
                  title="No matching links"
                  description="Try adjusting your search or filters to find what you're looking for."
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSearch('')
                        setFilter('all')
                        setTagFilter('all')
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : lockToArchived ? (
                <EmptyState
                  icon={<Link2 size={20} />}
                  title="Archive is empty"
                  description="Archived links will appear here. You can archive a link from the Links page."
                />
              ) : (
                <EmptyState
                  icon={<Link2 size={20} />}
                  title="No links yet"
                  description="Create your first short link to start sharing and tracking clicks."
                  action={
                    <Button variant="primary" size="sm" onClick={openCreate}>
                      <Plus size={15} />
                      Create link
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <LinkTable
              links={filtered}
              domain={domain}
              sort={sort}
              onSort={handleSort}
              hydrated={hydrated}
              selectable={!lockToArchived}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelectAll={selectAll}
              allSelected={allSelected}
              onEdit={openEdit}
              onToggleActive={(link) => toggleActive(link.id)}
              onArchive={(link) => setConfirm({ kind: 'archive', link })}
              onRestore={(link) => setConfirm({ kind: 'restore', link })}
              onDelete={(link) => setConfirm({ kind: 'delete', link })}
              onDuplicate={(link) => setConfirm({ kind: 'duplicate', link })}
            />
          )}
        </AnimatedPage>
      </div>

      {!lockToArchived ? (
        <BulkActionBar
          count={selectedIds.size}
          onArchive={() => setConfirm({ kind: 'bulkArchive', count: selectedIds.size })}
          onRestore={() => {
            bulkRestore(Array.from(selectedIds))
          }}
          onActivate={() => {
            bulkActivate(Array.from(selectedIds))
          }}
          onDeactivate={() => {
            bulkDeactivate(Array.from(selectedIds))
          }}
          onDelete={() => setConfirm({ kind: 'bulkDelete', count: selectedIds.size })}
          onExport={() => exportSelection('json')}
          onClear={clearSelection}
        />
      ) : null}

      <LinkDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
        domain={domain}
        editing={editing}
        slugExists={slugExists}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={importLinks}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={confirmTitle(confirm)}
        description={confirmDescription(confirm)}
        confirmLabel={confirmLabel(confirm)}
        destructive={
          confirm?.kind === 'delete' || confirm?.kind === 'bulkDelete'
        }
      />
    </>
  )
}

function confirmTitle(confirm: Confirm): string {
  switch (confirm?.kind) {
    case 'delete':
      return 'Delete link'
    case 'archive':
      return 'Archive link'
    case 'restore':
      return 'Restore link'
    case 'duplicate':
      return 'Duplicate link'
    case 'bulkDelete':
      return `Delete ${confirm.count} links`
    case 'bulkArchive':
      return `Archive ${confirm.count} links`
    case 'bulkRestore':
      return `Restore ${confirm.count} links`
    default:
      return ''
  }
}

function confirmDescription(confirm: Confirm): string {
  switch (confirm?.kind) {
    case 'delete':
      return `"${confirm.link.title}" will be permanently deleted. This cannot be undone.`
    case 'archive':
      return `"${confirm.link.title}" will be moved to the archive. You can restore it later.`
    case 'restore':
      return `"${confirm.link.title}" will be restored to active status.`
    case 'duplicate':
      return `Create a copy of "${confirm.link.title}" with a new slug.`
    case 'bulkDelete':
      return `${confirm.count} ${confirm.count === 1 ? 'link' : 'links'} will be permanently deleted. This cannot be undone.`
    case 'bulkArchive':
      return `${confirm.count} ${confirm.count === 1 ? 'link' : 'links'} will be moved to the archive.`
    case 'bulkRestore':
      return `${confirm.count} ${confirm.count === 1 ? 'link' : 'links'} will be restored to active status.`
    default:
      return ''
  }
}

function confirmLabel(confirm: Confirm): string {
  switch (confirm?.kind) {
    case 'delete':
      return 'Delete'
    case 'archive':
      return 'Archive'
    case 'restore':
      return 'Restore'
    case 'duplicate':
      return 'Duplicate'
    case 'bulkDelete':
      return 'Delete'
    case 'bulkArchive':
      return 'Archive'
    case 'bulkRestore':
      return 'Restore'
    default:
      return 'Confirm'
  }
}
