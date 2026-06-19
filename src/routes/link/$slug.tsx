import { useEffect } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, ExternalLink, Link2 } from 'lucide-react'
import { loadLinks } from '#/lib/storage'
import { loadSettings } from '#/lib/storage'
import { buildShortUrl } from '#/lib/utils'

export const Route = createFileRoute('/link/$slug')({ component: RedirectPlaceholder })

function RedirectPlaceholder() {
  const { slug } = Route.useParams()
  const navigate = useNavigate()

  const link = (() => {
    const links = loadLinks()
    return links.find((l) => l.slug.toLowerCase() === slug.toLowerCase()) ?? null
  })()

  const settings = loadSettings()

  useEffect(() => {
    document.title = `/link/${slug} · linkshort`
  }, [slug])

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
            <Link2 size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-neutral-900">
              Redirect route reserved
            </span>
            <span className="font-mono text-[12px] text-neutral-400">
              {buildShortUrl(settings.domain, slug)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-[13px] text-neutral-600">
            This is a v1 frontend prototype. Live redirects are not served yet.
          </p>
          {link ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                <span className="font-medium text-neutral-700">{link.title}</span>
                <span className="text-neutral-300">·</span>
                <StatusPill status={link.status} />
              </div>
              <a
                href={link.destinationUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 truncate font-mono text-[12px] text-blue-600 hover:underline"
              >
                <ExternalLink size={12} className="shrink-0" />
                <span className="truncate">{link.destinationUrl}</span>
              </a>
            </div>
          ) : (
            <p className="text-[13px] text-neutral-500">
              No link matched the slug <code className="rounded bg-neutral-200 px-1 py-0.5 font-mono text-[12px]">{slug}</code>.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link
            to="/app"
            className="text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
          >
            Go to dashboard
          </Link>
          <button
            type="button"
            onClick={() => navigate({ to: '/app' })}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-neutral-900 px-3 text-[13px] font-medium text-white hover:bg-neutral-800"
          >
            Open app
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </main>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'active'
      ? 'text-emerald-600'
      : status === 'inactive'
        ? 'text-amber-600'
        : 'text-neutral-400'
  return <span className={`text-[12px] font-medium ${tone}`}>{status}</span>
}
