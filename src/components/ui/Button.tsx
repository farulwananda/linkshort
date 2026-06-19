import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '#/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'icon'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  // Notion's primary: dark warm, white text, subtle shadow; inverts in dark mode
  primary:
    'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 dark:bg-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 shadow-[0_1px_0_rgba(0,0,0,0.04)] border border-neutral-900 dark:border-neutral-900',
  // Notion's default: white card with subtle border, hover lightens
  secondary:
    'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 active:bg-neutral-200/70 shadow-[0_1px_0_rgba(15,15,15,0.04)]',
  // Notion's ghost: transparent, hover shows soft bg
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 border border-transparent',
  danger:
    'bg-white text-[#e03e3e] border border-[#f0dadb] hover:bg-[#fbeaea] hover:border-[#e9c5c7] active:bg-[#f5dcdc] shadow-[0_1px_0_rgba(15,15,15,0.04)]',
  subtle:
    'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 active:bg-neutral-300 border border-transparent',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-[13px] gap-1.5 rounded-[5px]',
  md: 'h-9 px-3 text-[14px] gap-2 rounded-[6px]',
  icon: 'h-8 w-8 rounded-[5px]',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#337ea9]/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
