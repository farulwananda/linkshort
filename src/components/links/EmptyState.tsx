import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-400">
          {icon}
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-semibold text-neutral-900">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-sm text-[13px] text-neutral-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="h-4 w-40 animate-pulse rounded bg-neutral-100" />
      <div className="h-4 w-28 animate-pulse rounded bg-neutral-100" />
      <div className="hidden h-4 w-48 animate-pulse rounded bg-neutral-100 sm:block" />
      <div className="ml-auto h-4 w-16 animate-pulse rounded bg-neutral-100" />
    </div>
  )
}
