import { useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Link as LinkIcon,
  Settings as SettingsIcon,
  Tag,
  Trash2,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { useReducedMotion } from '#/components/motion/variants'
import { motion, AnimatePresence } from 'motion/react'
import { useSession } from '#/hooks/useSession'

type NavItem = {
  label: string
  to: string
  icon: typeof LinkIcon
  match?: 'exact' | 'prefix'
  iconColor?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Links', to: '/app', icon: LinkIcon, match: 'exact', iconColor: 'text-[#337ea9]' },
  { label: 'Analytics', to: '/app/analytics', icon: BarChart3, match: 'exact', iconColor: 'text-[#9065b0]' },
  { label: 'Tags', to: '/app/tags', icon: Tag, match: 'exact', iconColor: 'text-[#4f9a6e]' },
  { label: 'Archive', to: '/app/archive', icon: Trash2, match: 'prefix', iconColor: 'text-neutral-500' },
  { label: 'Settings', to: '/app/settings', icon: SettingsIcon, match: 'prefix', iconColor: 'text-neutral-500' },
]

export function Sidebar({
  workspace,
  onNavigate,
}: {
  workspace: string
  onNavigate?: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useSession()
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  function isActive(item: NavItem): boolean {
    if (item.match === 'exact') return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  function handleSignOut() {
    logout()
    onNavigate?.()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex h-full flex-col bg-neutral-50 text-neutral-900">
      {/* Workspace header — Notion style, hover reveals chevron */}
      <div className="group relative">
        <button
          type="button"
          onClick={() => setWorkspaceOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-neutral-100
                     transition-colors"
        >
          <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-neutral-900 text-[12px] font-bold text-white shadow-[0_1px_0_rgba(15,15,15,0.1)]">
            {workspace.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[14px] font-semibold leading-tight text-neutral-900">
              {workspace}
            </span>
            <span className="truncate text-[11px] leading-tight text-neutral-500">
              Personal · Free
            </span>
          </div>
          <ChevronRight
            size={14}
            className={cn(
              'shrink-0 text-neutral-400 transition-transform duration-150',
              workspaceOpen && 'rotate-90',
            )}
          />
        </button>
        <AnimatePresence>
          {workspaceOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-b border-neutral-200/60"
            >
              <div className="flex flex-col py-1">
                <span className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                  Workspace
                </span>
                <SidebarMiniRow label="Members" value="1" />
                <SidebarMiniRow label="Plan" value="Free" />
                <SidebarMiniRow label="Settings" value="Open" />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-px px-2 pt-2">
        <div className="px-2 pb-1 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Personal
          </span>
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-2 rounded-[5px] px-2 py-[5px] text-[14px] transition-colors',
                active
                  ? 'bg-neutral-100 text-neutral-900 font-medium'
                  : 'text-neutral-700 hover:bg-neutral-100/70 hover:text-neutral-900',
              )}
            >
              <Icon
                size={16}
                className={cn('shrink-0', active ? item.iconColor : 'text-neutral-500')}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {active ? (
                <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-neutral-900" />
              ) : null}
            </Link>
          )
        })}

      </nav>

      {/* Footer — sign out + settings shortcut */}
      <div className="mt-auto flex flex-col gap-px px-2 pb-2">
        <div className="my-1 h-px bg-neutral-200/60" />
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-[5px] px-2 py-[5px] text-left text-[13px] text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-800"
        >
          <ArrowLeft size={15} className="shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  )
}

function SidebarMiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1 text-[12px] text-neutral-600">
      <span>{label}</span>
      <span className="text-neutral-400">{value}</span>
    </div>
  )
}

export function MobileSidebar({
  open,
  onClose,
  workspace,
}: {
  open: boolean
  onClose: () => void
  workspace: string
}) {
  const reduced = useReducedMotion()
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-neutral-900/30 backdrop-blur-[1px]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { x: '-100%' }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '-100%' }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 36 }}
            className="relative z-10 h-full w-64 border-r border-neutral-200 bg-neutral-50 shadow-xl"
          >
            <Sidebar workspace={workspace} onNavigate={onClose} />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export function SidebarChrome({
  className,
  workspace,
}: {
  className?: string
  workspace: string
}) {
  return (
    <aside
      className={cn(
        'hidden w-60 shrink-0 border-r border-neutral-200 bg-neutral-50 lg:block',
        className,
      )}
    >
      <Sidebar workspace={workspace} />
    </aside>
  )
}
