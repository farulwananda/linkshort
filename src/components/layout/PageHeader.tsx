import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from '#/components/motion/variants'

type PageHeaderProps = {
  icon: ReactNode
  iconBg?: string
  title: string
  description?: string
  actions?: ReactNode
}

/**
 * Notion-style page header: large icon tile, big editable-looking title,
 * airy spacing. The icon tile is hover-interactive like Notion's cover icon.
 */
export function PageHeader({
  icon,
  iconBg = 'bg-white border border-neutral-200',
  title,
  description,
  actions,
}: PageHeaderProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3 pt-2"
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-[10px] text-neutral-700 shadow-[0_1px_0_rgba(15,15,15,0.04)] transition-transform hover:scale-[1.04] ${iconBg}`}
        title="Page icon"
      >
        {icon}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="notion-title">{title}</h1>
          {description ? (
            <p className="text-[14px] text-neutral-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-1.5 pt-1">{actions}</div> : null}
      </div>
    </motion.div>
  )
}
