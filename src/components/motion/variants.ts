import { useReducedMotion as useMotionReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'

export function useReducedMotion(): boolean {
  return Boolean(useMotionReducedMotion())
}

export const springSoft = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 } as const

export const easeOut = [0.22, 1, 0.36, 1] as const

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

export const pageTransition = { duration: 0.22, ease: easeOut }

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } },
}

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.26, ease: easeOut } },
}

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalPanelVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springSoft },
  exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.16, ease: easeOut } },
}

export const drawerPanelVariants: Variants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: springSoft },
  exit: { x: '100%', transition: { duration: 0.22, ease: easeOut } },
}

export const rowListVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.025 } },
}

export const rowItemVariants: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
}
