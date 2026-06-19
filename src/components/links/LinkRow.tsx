import { useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  Check,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from 'lucide-react'
import { StatusBadge, TagBadge } from '#/components/ui/Badge'
import { buildShortUrl, cn, copyToClipboard, formatNumber, formatRelative } from '#/lib/utils'
import type { ShortLink } from '#/lib/types'

type LinkActionsProps = {
  link: ShortLink
  domain: string
  selected?: boolean
  selectable?: boolean
  onToggleSelect?: () => void
  onEdit: () => void
  onToggleActive: () => void
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
  onDuplicate: () => void
}

function useCopyFeedback() {
  const [copied, setCopied] = useState(false)
  const copy = (text: string) => {
    copyToClipboard(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      })
      .catch(() => {})
  }
  return { copied, copy }
}

function ActionMenu({
  link,
  onEdit,
  onToggleActive,
  onArchive,
  onRestore,
  onDelete,
  onDuplicate,
}: {
  link: ShortLink
  onEdit: () => void
  onToggleActive: () => void
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        aria-label="More actions"
      >
        <MoreHorizontal size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          <MenuItem icon={Pencil} label="Edit" onClick={onEdit} />
          <MenuItem icon={Copy} label="Duplicate" onClick={onDuplicate} />
          {link.status !== 'archived' ? (
            <MenuItem
              icon={Power}
              label={link.status === 'active' ? 'Deactivate' : 'Activate'}
              onClick={onToggleActive}
            />
          ) : null}
          {link.status !== 'archived' ? (
            <MenuItem icon={Archive} label="Archive" onClick={onArchive} />
          ) : (
            <MenuItem icon={ArchiveRestore} label="Restore" onClick={onRestore} />
          )}
          <div className="my-1 border-t border-neutral-100" />
          <MenuItem icon={Trash2} label="Delete" onClick={onDelete} danger />
        </div>
      ) : null}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] transition-colors',
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-neutral-700 hover:bg-neutral-100',
      )}
    >
      <Icon size={14} className="shrink-0" />
      {label}
    </button>
  )
}

export function LinkRow({
  link,
  domain,
  selected = false,
  selectable = false,
  onToggleSelect,
  onEdit,
  onToggleActive,
  onArchive,
  onRestore,
  onDelete,
  onDuplicate,
}: LinkActionsProps) {
  const { copied, copy } = useCopyFeedback()
  const shortUrl = buildShortUrl(domain, link.slug)

  return (
    <tr
      className={cn(
        'group border-b border-neutral-100 transition-colors hover:bg-neutral-50',
        selected && 'bg-notion-blue-bg hover:bg-notion-blue-bg-hover',
      )}
    >
      {selectable ? (
        <td className="w-8 px-3 py-3">
          <Checkbox checked={selected} onChange={onToggleSelect} label={`Select ${link.title}`} />
        </td>
      ) : null}
      <td className="max-w-[280px] px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="truncate text-[13px] font-medium text-neutral-900">
            {link.title}
          </span>
          <a
            href={link.destinationUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 truncate text-[12px] text-neutral-400 hover:text-neutral-600"
          >
            <ExternalLink size={11} className="shrink-0" />
            <span className="truncate">{link.destinationUrl}</span>
          </a>
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            copy(shortUrl)
          }}
          className="group/copy inline-flex items-center gap-1.5 rounded font-mono text-[12px] text-neutral-600 hover:text-neutral-900"
          title="Copy short URL"
        >
          <span className="truncate">/link/{link.slug}</span>
          {copied ? (
            <Check size={12} className="text-emerald-500" />
          ) : (
            <Copy
              size={12}
              className="text-neutral-300 group-hover/copy:text-neutral-500"
            />
          )}
        </button>
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {link.tags.length ? (
            link.tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} />)
          ) : (
            <span className="text-[12px] text-neutral-300">—</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={link.status} />
      </td>
      <td className="hidden px-4 py-3 text-right tabular-nums text-[13px] text-neutral-600 sm:table-cell">
        {formatNumber(link.totalClicks)}
      </td>
      <td className="hidden px-4 py-3 text-[12px] text-neutral-500 md:table-cell">
        {formatRelative(link.lastClickedAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end">
          <ActionMenu
            link={link}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
            onArchive={onArchive}
            onRestore={onRestore}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        </div>
      </td>
    </tr>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange?: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onChange?.()
      }}
      aria-label={label}
      aria-pressed={checked}
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors',
        checked
          ? 'border-[#337ea9] bg-[#337ea9] text-white'
          : 'border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-100',
      )}
    >
      {checked ? <Check size={11} /> : null}
    </button>
  )
}
