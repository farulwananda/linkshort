import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Pencil,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react'
import { Topbar } from '#/components/layout/Topbar'
import { useAppShell } from '#/components/layout/AppShell'
import { PageHeader } from '#/components/layout/PageHeader'
import { AnimatedPage } from '#/components/motion/AnimatedPage'
import { AnimatedList, AnimatedListItem } from '#/components/motion/AnimatedList'
import { EmptyState } from '#/components/links/EmptyState'
import { ConfirmDialog } from '#/components/links/ConfirmDialog'
import { Modal } from '#/components/ui/Modal'
import { Button } from '#/components/ui/Button'
import { Field, Input } from '#/components/ui/Input'
import { Badge } from '#/components/ui/Badge'
import { useLinks } from '#/hooks/useLinks'
import { buildTagSummaries } from '#/lib/analytics'
import { cn, formatNumber } from '#/lib/utils'
import { useReducedMotion } from '#/components/motion/variants'
import type { TagSummary } from '#/lib/types'

export function TagsView() {
  const shell = useAppShell()
  const navigate = useNavigate()
  const { links, hydrated, renameTag, deleteTag } = useLinks()
  const [search, setSearch] = useState('')
  const [renaming, setRenaming] = useState<TagSummary | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState<string | undefined>()
  const [confirmDelete, setConfirmDelete] = useState<TagSummary | null>(null)

  const tags = useMemo(() => {
    const summaries = buildTagSummaries(links)
    const q = search.trim().toLowerCase()
    if (!q) return summaries
    return summaries.filter((t) => t.name.includes(q))
  }, [links, search])

  const allTagNames = useMemo(() => tags.map((t) => t.name), [tags])

  function openRename(tag: TagSummary) {
    setRenaming(tag)
    setRenameValue(tag.name)
    setRenameError(undefined)
  }

  function submitRename() {
    if (!renaming) return
    const next = renameValue.trim().toLowerCase()
    if (!next) {
      setRenameError('Tag name is required')
      return
    }
    if (next !== renaming.name && allTagNames.includes(next)) {
      setRenameError('A tag with this name already exists')
      return
    }
    renameTag(renaming.name, next)
    setRenaming(null)
  }

  function openLinksForTag(tag: string) {
    try {
      window.sessionStorage.setItem('linkshort.pendingTag', tag)
    } catch {
      /* ignore */
    }
    void navigate({ to: '/app' })
  }

  return (
    <>
      <Topbar
        search={search}
        onSearch={setSearch}
        onMenuClick={shell.openMobileSidebar}
        createLabel="New tag"
      />

      <div className="flex-1 overflow-y-auto">
        <AnimatedPage className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader
            icon={<TagIcon size={28} className="text-[#4f9a6e]" />}
            iconBg="bg-neutral-50 border border-neutral-200"
            title="Tags"
            description="All tags across your links, with counts and clicks. Rename or remove tags in bulk."
          />

          {!hydrated ? (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-neutral-100" />
                  <div className="h-4 w-16 animate-pulse rounded bg-neutral-100" />
                </div>
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white">
              <EmptyState
                icon={<TagIcon size={20} />}
                title={search ? 'No matching tags' : 'No tags yet'}
                description={
                  search
                    ? 'Try a different search term.'
                    : 'Add tags to your links to organize and filter them here.'
                }
              />
            </div>
          ) : (
            <AnimatedList className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 border-b border-neutral-200 bg-neutral-50/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 sm:grid">
                <span>Tag</span>
                <span>Links</span>
                <span>Active</span>
                <span>Clicks</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {tags.map((tag) => (
                  <AnimatedListItem key={tag.name} presenceKey={tag.name}>
                    <TagRow
                      tag={tag}
                      onRename={() => openRename(tag)}
                      onDelete={() => setConfirmDelete(tag)}
                      onOpenLinks={() => openLinksForTag(tag.name)}
                    />
                  </AnimatedListItem>
                ))}
              </div>
            </AnimatedList>
          )}
        </AnimatedPage>
      </div>

      <Modal
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        title="Rename tag"
        description={`Rename "${renaming?.name}" across all links that use it.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitRename}>
              Save
            </Button>
          </>
        }
      >
        <Field label="New name" error={renameError}>
          <Input
            value={renameValue}
            onChange={(e) => {
              setRenameValue(e.target.value)
              setRenameError(undefined)
            }}
            placeholder="tag-name"
            invalid={Boolean(renameError)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitRename()
            }}
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) deleteTag(confirmDelete.name)
        }}
        title="Remove tag"
        description={`"#${confirmDelete?.name}" will be removed from ${confirmDelete?.linkCount} ${confirmDelete?.linkCount === 1 ? 'link' : 'links'}. Links themselves are not deleted.`}
        confirmLabel="Remove tag"
        destructive
      />
    </>
  )
}

function TagRow({
  tag,
  onRename,
  onDelete,
  onOpenLinks,
}: {
  tag: TagSummary
  onRename: () => void
  onDelete: () => void
  onOpenLinks: () => void
}) {
  const reduced = useReducedMotion()
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-3 transition-colors hover:bg-neutral-50/70 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-4">
      <button
        type="button"
        onClick={onOpenLinks}
        className="inline-flex items-center gap-2 self-start text-left"
      >
        <Badge tone="blue" className="text-[12px]">
          #{tag.name}
        </Badge>
        <ArrowRight size={13} className="text-neutral-300" />
      </button>
      <span className="text-[13px] tabular-nums text-neutral-600">
        <span className="sm:hidden text-neutral-400">Links: </span>
        {tag.linkCount}
      </span>
      <span className="text-[13px] tabular-nums text-neutral-600">
        <span className="sm:hidden text-neutral-400">Active: </span>
        {tag.activeCount}
      </span>
      <span className="text-[13px] tabular-nums text-neutral-700">
        <span className="sm:hidden text-neutral-400">Clicks: </span>
        {formatNumber(tag.totalClicks)}
      </span>
      <div className="flex items-center gap-1 self-start sm:justify-end">
        <motion.button
          type="button"
          onClick={onRename}
          whileHover={reduced ? undefined : { scale: 1.05 }}
          whileTap={reduced ? undefined : { scale: 0.95 }}
          className={cn(
            'rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700',
          )}
          aria-label="Rename tag"
          title="Rename"
        >
          <Pencil size={15} />
        </motion.button>
        <motion.button
          type="button"
          onClick={onDelete}
          whileHover={reduced ? undefined : { scale: 1.05 }}
          whileTap={reduced ? undefined : { scale: 0.95 }}
          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="Delete tag"
          title="Remove"
        >
          <Trash2 size={15} />
        </motion.button>
      </div>
    </div>
  )
}
