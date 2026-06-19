import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { LinkCard } from './LinkCard'
import { LinkRow, Checkbox } from './LinkRow'
import { SkeletonRow } from './EmptyState'
import { cn } from '#/lib/utils'
import type { ShortLink, SortState } from '#/lib/types'

type LinkTableProps = {
  links: ShortLink[]
  domain: string
  sort: SortState
  onSort: (key: SortState['key']) => void
  hydrated: boolean
  selectable?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  onSelectAll?: () => void
  allSelected?: boolean
  onEdit: (link: ShortLink) => void
  onToggleActive: (link: ShortLink) => void
  onArchive: (link: ShortLink) => void
  onRestore: (link: ShortLink) => void
  onDelete: (link: ShortLink) => void
  onDuplicate: (link: ShortLink) => void
}

export function LinkTable({
  links,
  domain,
  sort,
  onSort,
  hydrated,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  allSelected = false,
  onEdit,
  onToggleActive,
  onArchive,
  onRestore,
  onDelete,
  onDuplicate,
}: LinkTableProps) {
  const colCount = selectable ? 8 : 7
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {/* Desktop table */}
      <table className="hidden w-full table-fixed md:table">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50/60 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            {selectable ? (
              <th className="w-8 px-3 py-2.5 text-left">
                <Checkbox checked={allSelected} onChange={onSelectAll} label="Select all" />
              </th>
            ) : null}
            <th className="w-[34%] px-4 py-2.5 text-left">
              <SortHeader label="Link" active={sort.key === 'title'} dir={sort.dir} onClick={() => onSort('title')} />
            </th>
            <th className="w-[24%] px-4 py-2.5 text-left">
              <SortHeader label="Short URL" active={false} dir={sort.dir} onClick={() => onSort('createdAt')} sortable={false} />
            </th>
            <th className="hidden w-[16%] px-4 py-2.5 text-left lg:table-cell">Tags</th>
            <th className="w-[12%] px-4 py-2.5 text-left">Status</th>
            <th className="hidden w-[10%] px-4 py-2.5 text-right sm:table-cell">
              <SortHeader label="Clicks" active={sort.key === 'totalClicks'} dir={sort.dir} onClick={() => onSort('totalClicks')} align="right" />
            </th>
            <th className="hidden w-[14%] px-4 py-2.5 text-left md:table-cell">
              <SortHeader label="Last clicked" active={sort.key === 'lastClickedAt'} dir={sort.dir} onClick={() => onSort('lastClickedAt')} />
            </th>
            <th className="w-[8%] px-4 py-2.5 text-right" />
          </tr>
        </thead>
        <tbody>
          {!hydrated ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-neutral-100">
                <td colSpan={colCount} className="px-0 py-0">
                  <SkeletonRow />
                </td>
              </tr>
            ))
          ) : (
            links.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                domain={domain}
                selectable={selectable}
                selected={selectedIds?.has(link.id) ?? false}
                onToggleSelect={() => onToggleSelect?.(link.id)}
                onEdit={() => onEdit(link)}
                onToggleActive={() => onToggleActive(link)}
                onArchive={() => onArchive(link)}
                onRestore={() => onRestore(link)}
                onDelete={() => onDelete(link)}
                onDuplicate={() => onDuplicate(link)}
              />
            ))
          )}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden">
        {!hydrated ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : (
          links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              domain={domain}
              selectable={selectable}
              selected={selectedIds?.has(link.id) ?? false}
              onToggleSelect={() => onToggleSelect?.(link.id)}
              onEdit={() => onEdit(link)}
              onToggleActive={() => onToggleActive(link)}
              onArchive={() => onArchive(link)}
              onRestore={() => onRestore(link)}
              onDelete={() => onDelete(link)}
              onDuplicate={() => onDuplicate(link)}
            />
          ))
        )}
      </div>

      {hydrated && links.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-neutral-400">No links to display.</div>
      ) : null}
    </div>
  )
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = 'left',
  sortable = true,
}: {
  label: string
  active: boolean
  dir: SortState['dir']
  onClick: () => void
  align?: 'left' | 'right'
  sortable?: boolean
}) {
  if (!sortable) {
    return <span className={cn(align === 'right' && 'flex justify-end')}>{label}</span>
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 transition-colors hover:text-neutral-700',
        active && 'text-neutral-700',
        align === 'right' && 'flex-row-reverse',
      )}
    >
      {label}
      {active ? (
        dir === 'asc' ? (
          <ArrowUp size={11} />
        ) : (
          <ArrowDown size={11} />
        )
      ) : (
        <ChevronsUpDown size={11} className="text-neutral-300" />
      )}
    </button>
  )
}
