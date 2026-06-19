import type { ReactNode } from 'react'
import { forwardRef } from 'react'
import { Menu, Plus, Search } from 'lucide-react'
import { cn } from '#/lib/utils'

type TopbarProps = {
  search: string
  onSearch: (value: string) => void
  onCreate?: () => void
  onMenuClick?: () => void
  createLabel?: string
  actions?: ReactNode
}

export const Topbar = forwardRef<HTMLInputElement, TopbarProps>(function Topbar(
  { search, onSearch, onCreate, onMenuClick, createLabel = 'New link', actions },
  ref,
) {
  return (
    <header className="sticky top-0 z-30 flex h-11 items-center gap-2 border-b border-neutral-200 bg-white/80 px-3 backdrop-blur-md">
      {onMenuClick ? (
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-1 rounded-[5px] p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={17} />
        </button>
      ) : null}

      <div className="relative max-w-xs flex-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          ref={ref}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search…"
          aria-label="Search links"
          className={cn(
            'h-8 w-full rounded-[5px] border border-transparent bg-neutral-100/80 pl-8 pr-2 text-[13px] text-neutral-800',
            'placeholder:text-neutral-400 outline-none',
            'hover:bg-neutral-100 focus:border-[#337ea9]/30 focus:bg-white focus:ring-2 focus:ring-[#337ea9]/20',
          )}
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {actions}
        {onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-8 items-center gap-1.5 rounded-[5px] bg-neutral-900 px-2.5 text-[13px] font-medium text-white shadow-[0_1px_0_rgba(15,15,15,0.1)] hover:bg-neutral-800 active:bg-neutral-950 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:active:bg-neutral-700"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">{createLabel}</span>
          </button>
        ) : null}
      </div>
    </header>
  )
})
