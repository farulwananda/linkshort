import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '#/lib/utils'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  invalid?: boolean
  prefix?: ReactNode
}

export function Input({ className, invalid, prefix, ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {prefix ? (
        <span className="pointer-events-none absolute left-3 text-sm text-neutral-400">
          {prefix}
        </span>
      ) : null}
      <input
        className={cn(
          'h-9 w-full rounded-[6px] border bg-white px-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 transition-colors outline-none focus:ring-2 focus:ring-[#337ea9]/20 focus:border-[#337ea9]/40 disabled:bg-neutral-50 disabled:text-neutral-400',
          invalid
            ? 'border-[#e9c5c7] bg-[#fbeaea] focus:ring-[#e03e3e]/20 focus:border-[#e03e3e]/40'
            : 'border-neutral-200 hover:border-neutral-300',
          prefix ? 'pl-9' : '',
          className,
        )}
        {...props}
      />
    </div>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-[72px] w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400 disabled:bg-neutral-50',
        invalid
          ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
          : 'border-neutral-200 hover:border-neutral-300',
        className,
      )}
      {...props}
    />
  )
}

type FieldProps = {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-neutral-700"
        >
          {label}
        </label>
        {hint ? <span className="text-[11px] text-neutral-400">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
    </div>
  )
}
