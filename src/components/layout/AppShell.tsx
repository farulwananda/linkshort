import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { MobileSidebar, SidebarChrome } from './Sidebar'

type AppShellContextValue = {
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error('useAppShell must be used within AppShell')
  return ctx
}

export function AppShell({
  workspace,
  children,
}: {
  workspace: string
  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const value = useMemo<AppShellContextValue>(
    () => ({
      openMobileSidebar: () => setMobileOpen(true),
      closeMobileSidebar: () => setMobileOpen(false),
    }),
    [],
  )

  return (
    <AppShellContext.Provider value={value}>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <SidebarChrome workspace={workspace} />
        <MobileSidebar
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          workspace={workspace}
        />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AppShellContext.Provider>
  )
}
