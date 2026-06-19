import { AnimatePresence, motion } from 'motion/react'
import {
  Archive,
  ArchiveRestore,
  Download,
  Power,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '#/components/ui/Button'
import { useReducedMotion } from '#/components/motion/variants'

type BulkActionBarProps = {
  count: number
  onArchive: () => void
  onRestore: () => void
  onActivate: () => void
  onDeactivate: () => void
  onDelete: () => void
  onExport: () => void
  onClear: () => void
}

export function BulkActionBar({
  count,
  onArchive,
  onRestore,
  onActivate,
  onDeactivate,
  onDelete,
  onExport,
  onClear,
}: BulkActionBarProps) {
  const reduced = useReducedMotion()
  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={reduced ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-xl"
        >
          <span className="px-1 text-[13px] font-medium text-neutral-700">
            {count} selected
          </span>
          <div className="mx-1 h-5 w-px bg-neutral-200" />
          <BulkButton icon={Power} label="Activate" onClick={onActivate} />
          <BulkButton icon={Power} label="Pause" onClick={onDeactivate} />
          <BulkButton icon={Archive} label="Archive" onClick={onArchive} />
          <BulkButton icon={ArchiveRestore} label="Restore" onClick={onRestore} />
          <BulkButton icon={Download} label="Export" onClick={onExport} />
          <BulkButton icon={Trash2} label="Delete" onClick={onDelete} danger />
          <div className="mx-1 h-5 w-px bg-neutral-200" />
          <button
            type="button"
            onClick={onClear}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Clear selection"
          >
            <X size={15} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function BulkButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Power
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <Button variant={danger ? 'danger' : 'secondary'} size="sm" onClick={onClick}>
      <Icon size={13} />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
