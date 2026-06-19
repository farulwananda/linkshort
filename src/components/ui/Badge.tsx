import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'
import type { LinkStatus } from '#/lib/types'

type Tone = 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'purple'

const TONES: Record<Tone, string> = {
  neutral: 'bg-neutral-200/70 text-neutral-700 border-neutral-200/0',
  green: 'bg-notion-green-bg text-[#357a52] dark:text-[#6bbd8a] border-notion-green-bg',
  amber: 'bg-notion-amber-bg text-[#a85d08] dark:text-[#e0a04a] border-notion-amber-bg',
  red: 'bg-notion-red-bg text-[#b14545] dark:text-[#e07070] border-notion-red-bg',
  blue: 'bg-notion-blue-bg text-[#337ea9] dark:text-[#6ba5d0] border-notion-blue-bg',
  purple: 'bg-notion-purple-bg text-[#7b4a9a] dark:text-[#b88fc8] border-notion-purple-bg',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-[3px] text-[11px] font-medium leading-none whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const STATUS_TONE: Record<LinkStatus, Tone> = {
  active: 'green',
  inactive: 'amber',
  archived: 'neutral',
}

const STATUS_LABEL: Record<LinkStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
}

export function StatusBadge({ status }: { status: LinkStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span
        className={cn(
          'h-[5px] w-[5px] rounded-full',
          status === 'active' && 'bg-[#4f9a6e]',
          status === 'inactive' && 'bg-[#d9730d]',
          status === 'archived' && 'bg-neutral-400',
        )}
      />
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function TagBadge({ tag }: { tag: string }) {
  return <Badge tone="blue">#{tag}</Badge>
}
