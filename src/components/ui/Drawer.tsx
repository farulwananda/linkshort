import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '#/lib/utils'
import {
  drawerPanelVariants,
  overlayVariants,
  useReducedMotion,
} from '#/components/motion/variants'

type DrawerProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const reduced = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            className="absolute inset-0 bg-neutral-900/30 backdrop-blur-[1px]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            variants={reduced ? undefined : drawerPanelVariants}
            initial={reduced ? { opacity: 0 } : 'initial'}
            animate={reduced ? { opacity: 1 } : 'animate'}
            exit={reduced ? { opacity: 0 } : 'exit'}
            transition={reduced ? { duration: 0 } : undefined}
            className={cn(
              'relative z-10 flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-2xl',
              className,
            )}
          >
            <div className="flex items-start justify-between gap-3 border-b border-neutral-100 p-4">
              <div className="flex flex-col gap-1">
                {title ? (
                  <h2 className="text-[15px] font-semibold text-neutral-900">{title}</h2>
                ) : null}
                {description ? (
                  <p className="text-[13px] text-neutral-500">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 -mt-1 rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
            {footer ? (
              <div className="flex items-center justify-end gap-2 border-t border-neutral-100 p-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
