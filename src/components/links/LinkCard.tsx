import { useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  Check,
  Copy,
  ExternalLink,
  Pencil,
  Power,
  Trash2,
} from 'lucide-react'
import { StatusBadge, TagBadge } from '#/components/ui/Badge'
import { Checkbox } from './LinkRow'
import { buildShortUrl, copyToClipboard, formatNumber, formatRelative } from '#/lib/utils'
import type { ShortLink } from '#/lib/types'

type LinkCardProps = {
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

export function LinkCard({
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
}: LinkCardProps) {
  const [copied, setCopied] = useState(false)
  const shortUrl = buildShortUrl(domain, link.slug)

  function copy(e: React.MouseEvent) {
    e.stopPropagation()
    copyToClipboard(shortUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      })
      .catch(() => {})
  }

  return (
    <div
      className={`flex flex-col gap-3 border-b border-neutral-100 p-4 transition-colors ${
        selected ? 'bg-notion-blue-bg' : 'hover:bg-neutral-50'
      }`}
      onClick={selectable ? onToggleSelect : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {selectable ? (
              <Checkbox
                checked={selected}
                onChange={onToggleSelect}
                label={`Select ${link.title}`}
              />
            ) : null}
            <span className="truncate text-[14px] font-medium text-neutral-900">
              {link.title}
            </span>
          </div>
          <a
            href={link.destinationUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 truncate text-[12px] text-neutral-400"
          >
            <ExternalLink size={11} className="shrink-0" />
            <span className="truncate">{link.destinationUrl}</span>
          </a>
        </div>
        <StatusBadge status={link.status} />
      </div>

      <button
        type="button"
        onClick={copy}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[12px] text-neutral-700"
      >
        <span className="truncate">/link/{link.slug}</span>
        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      </button>

      {link.tags.length ? (
        <div className="flex flex-wrap gap-1">
          {link.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[12px] text-neutral-400">
          <span>{formatNumber(link.totalClicks)} clicks</span>
          <span>·</span>
          <span>{formatRelative(link.lastClickedAt)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 pt-0.5" onClick={(e) => e.stopPropagation()}>
        <CardAction icon={Pencil} label="Edit" onClick={onEdit} />
        <CardAction icon={Copy} label="Copy" onClick={onDuplicate} />
        {link.status !== 'archived' ? (
          <CardAction
            icon={Power}
            label={link.status === 'active' ? 'Pause' : 'Activate'}
            onClick={onToggleActive}
          />
        ) : null}
        {link.status !== 'archived' ? (
          <CardAction icon={Archive} label="Archive" onClick={onArchive} />
        ) : (
          <CardAction icon={ArchiveRestore} label="Restore" onClick={onRestore} />
        )}
        <CardAction icon={Trash2} label="Delete" onClick={onDelete} danger />
      </div>
    </div>
  )
}

function CardAction({
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
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[12px] font-medium transition-colors ${
        danger
          ? 'border-red-200 text-red-600 hover:bg-red-50'
          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  )
}
