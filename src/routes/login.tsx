import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Link2, Lock } from 'lucide-react'
import { motion } from 'motion/react'
import { useSession } from '#/hooks/useSession'
import { Button } from '#/components/ui/Button'
import { useReducedMotion } from '#/components/motion/variants'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const { state, login } = useSession()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (state === 'authenticated') navigate({ to: '/app' })
  }, [state, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!password) return
    login()
    navigate({ to: '/app' })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <motion.div
        initial={reduced ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-[340px] flex-col items-center gap-7"
      >
        {/* Notion-style logo lockup */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-neutral-900 text-white shadow-[0_4px_12px_rgba(15,15,15,0.15)]">
            <Link2 size={22} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-neutral-900">
              Linkshort
            </h1>
            <p className="text-center text-[14px] text-neutral-500">
              Your personal shortlink workspace.
            </p>
          </div>
        </div>

        {/* Notion-style form card */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3 rounded-[8px] border border-neutral-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,15,15,0.04),0_8px_24px_rgba(15,15,15,0.04)]"
        >
          <label htmlFor="password" className="text-[13px] font-medium text-neutral-700">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock
              size={14}
              className="pointer-events-none absolute left-2.5 text-neutral-400"
            />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Enter any password"
              autoFocus
              className={cnInput(touched && !password)}
            />
          </div>
          {touched && !password ? (
            <p className="text-[12px] text-[#e03e3e]">Enter a password to continue.</p>
          ) : null}

          <Button variant="primary" type="submit" className="mt-1 w-full">
            Sign in
            <ArrowRight size={15} />
          </Button>

          <div className="mt-1 flex items-center gap-2">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-[11px] uppercase tracking-wide text-neutral-400">v1</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <p className="text-center text-[12px] text-neutral-400">
            Frontend-only prototype · no real auth yet
          </p>
        </form>
      </motion.div>
    </main>
  )
}

function cnInput(invalid: boolean): string {
  const base =
    'h-9 w-full rounded-[5px] border bg-white pl-8 pr-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors'
  return invalid
    ? `${base} border-[#e9c5c7] bg-[#fbeaea] focus:ring-2 focus:ring-[#e03e3e]/20`
    : `${base} border-neutral-200 hover:border-neutral-300 focus:border-[#337ea9]/40 focus:ring-2 focus:ring-[#337ea9]/20`
}
