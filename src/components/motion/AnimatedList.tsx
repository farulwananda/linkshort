import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { rowItemVariants, rowListVariants, useReducedMotion } from './variants'

type AnimatedListProps = {
  children: ReactNode
  className?: string
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  const reduced = useReducedMotion()
  if (reduced) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      variants={rowListVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  )
}

type AnimatedListItemProps = {
  children: ReactNode
  className?: string
  presenceKey?: string
}

export function AnimatedListItem({
  children,
  className,
  presenceKey,
}: AnimatedListItemProps) {
  const reduced = useReducedMotion()
  if (reduced) {
    return <div className={className}>{children}</div>
  }
  if (presenceKey) {
    return (
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={presenceKey}
          layout
          variants={rowItemVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    )
  }
  return (
    <motion.div
      layout
      variants={rowItemVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  )
}
