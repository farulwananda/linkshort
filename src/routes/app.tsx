import { useEffect } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { AppShell } from '#/components/layout/AppShell'
import { useSession } from '#/hooks/useSession'
import { useSettings } from '#/hooks/useSettings'

export const Route = createFileRoute('/app')({ component: AppLayout })

function AppLayout() {
  const { state } = useSession()
  const { settings } = useSettings()
  const navigate = useNavigate()

  useEffect(() => {
    if (state === 'unauthenticated') navigate({ to: '/login' })
  }, [state, navigate])

  if (state !== 'authenticated') {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-7 w-7 animate-pulse rounded-md bg-neutral-900" />
      </div>
    )
  }

  return (
    <AppShell workspace={settings.domain}>
      <Outlet />
    </AppShell>
  )
}
