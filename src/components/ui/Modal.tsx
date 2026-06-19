import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '#/lib/utils'
import {
  modalPanelVariants,
  overlayVariants,
  useReducedMotion,
} from '#/components/motion/variants'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={reduced ? { duration: 0 } : { duration: 0.18 }}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            variants={reduced ? undefined : modalPanelVariants}
            initial={reduced ? { opacity: 0 } : 'initial'}
            animate={reduced ? { opacity: 1 } : 'animate'}
            exit={reduced ? { opacity: 0 } : 'exit'}
            transition={reduced ? { duration: 0 } : undefined}
            className={cn(
              'relative z-10 w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl',
              className,
            )}
          >
            <div className="flex items-start justify-between gap-3 p-4 pb-3">
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
            {children ? (
              <div className="px-4 pb-2 text-sm text-neutral-600">{children}</div>
            ) : null}
            {footer ? (
              <div className="flex items-center justify-end gap-2 p-4 pt-3">{footer}</div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
