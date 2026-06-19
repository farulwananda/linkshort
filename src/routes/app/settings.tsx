import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Menu, Monitor, Moon, Save, Settings as SettingsIcon, Sun } from 'lucide-react'
import { useAppShell } from '#/components/layout/AppShell'
import { PageHeader } from '#/components/layout/PageHeader'
import { AnimatedPage } from '#/components/motion/AnimatedPage'
import { Button } from '#/components/ui/Button'
import { Field, Input } from '#/components/ui/Input'
import { SegmentedControl } from '#/components/ui/SegmentedControl'
import { useSettings } from '#/hooks/useSettings'
import { buildShortUrl, cn } from '#/lib/utils'
import type { ThemeMode } from '#/lib/types'

export const Route = createFileRoute('/app/settings')({ component: SettingsPage })

function SettingsPage() {
  const shell = useAppShell()
  const { settings, hydrated, update, setTheme } = useSettings()
  const [domain, setDomain] = useState(settings.domain)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (hydrated) setDomain(settings.domain)
  }, [hydrated, settings.domain])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    update({ ...settings, domain: clean || 'yourdomain.com' })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-11 items-center gap-2 border-b border-neutral-200 bg-white/80 px-3 backdrop-blur-md">
        <button
          type="button"
          onClick={shell.openMobileSidebar}
          className="-ml-1 rounded-[5px] p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={17} />
        </button>
        <h1 className="text-[14px] font-semibold text-neutral-900">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <AnimatedPage className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader
            icon={<SettingsIcon size={28} className="text-neutral-500" />}
            iconBg="bg-neutral-50 border border-neutral-200"
            title="Settings"
            description="Configure your short link domain, appearance, and review app info."
          />

          {/* Appearance / Theme */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-col gap-1 pb-4">
              <h2 className="text-[15px] font-semibold text-neutral-900">Appearance</h2>
              <p className="text-[13px] text-neutral-500">
                Choose how Linkshort looks to you. System follows your OS preference.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                <span className="text-[13px] font-medium text-neutral-600">Theme</span>
                <SegmentedControl<ThemeMode>
                  value={settings.theme}
                  onChange={setTheme}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                  ]}
                  className="w-fit"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <ThemePreview active={settings.theme === 'light' || (settings.theme === 'system' && !('dark' in settings))} icon={<Sun size={14} />} label="Light" />
                <ThemePreview active={settings.theme === 'dark'} icon={<Moon size={14} />} label="Dark" />
                <ThemePreview active={settings.theme === 'system'} icon={<Monitor size={14} />} label="System" />
              </div>
            </div>
          </section>

          {/* Domain */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-col gap-1 pb-4">
              <h2 className="text-[15px] font-semibold text-neutral-900">Domain</h2>
              <p className="text-[13px] text-neutral-500">
                The domain used for your short links. This is a display-only setting in v1.
              </p>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Field
                label="Short link domain"
                hint="no protocol, e.g. yourdomain.com"
                htmlFor="domain"
              >
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="yourdomain.com"
                />
              </Field>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                  Preview
                </span>
                <p className="mt-0.5 font-mono text-[13px] text-neutral-700">
                  {buildShortUrl(domain.trim() || 'yourdomain.com', 'example')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="primary" type="submit">
                  <Save size={15} />
                  Save changes
                </Button>
                {saved ? (
                  <span className="text-[13px] text-[#4f9a6e]">Saved</span>
                ) : null}
              </div>
            </form>
          </section>

          {/* About */}
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-col gap-1 pb-3">
              <h2 className="text-[15px] font-semibold text-neutral-900">About v1</h2>
              <p className="text-[13px] text-neutral-500">
                This is a frontend-only prototype. Data is stored in your browser.
              </p>
            </div>
            <ul className="flex flex-col gap-2 text-[13px] text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-neutral-400" />
                Short links live in <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[12px]">localStorage</code> and persist across refreshes.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-neutral-400" />
                The <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[12px]">/link/:slug</code> route is reserved for future redirects.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-neutral-400" />
                Real auth, a database, and redirect serving will arrive in a later version.
              </li>
            </ul>
          </section>
        </AnimatedPage>
      </div>
    </>
  )
}

function ThemePreview({
  active,
  icon,
  label,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1.5 text-[12px] font-medium',
        active
          ? 'border-neutral-300 bg-neutral-100 text-neutral-900'
          : 'border-neutral-200 text-neutral-400',
      )}
    >
      {icon}
      {label}
    </div>
  )
}
