import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSession } from '#/hooks/useSession'

export const Route = createFileRoute('/')({ component: IndexRedirect })

function IndexRedirect() {
  const { state } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (state === 'loading') return
    navigate({ to: state === 'authenticated' ? '/app' : '/login' })
  }, [state, navigate])

  return (
    <main className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-pulse rounded-md bg-neutral-900" />
        <p className="text-[13px] text-neutral-400">Loading…</p>
      </div>
    </main>
  )
}
