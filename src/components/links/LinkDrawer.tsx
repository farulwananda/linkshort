import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Sparkles } from 'lucide-react'
import { Drawer } from '#/components/ui/Drawer'
import { SegmentedControl } from '#/components/ui/SegmentedControl'
import { Button } from '#/components/ui/Button'
import { TagInput } from '#/components/ui/TagInput'
import {
  buildShortUrl,
  cn,
  copyToClipboard,
  isValidSlug,
  isValidUrl,
  normalizeUrl,
  slugify,
} from '#/lib/utils'
import type { LinkDraft, LinkStatus, ShortLink } from '#/lib/types'

type LinkDrawerProps = {
  open: boolean
  onClose: () => void
  onSave: (draft: LinkDraft) => void
  domain: string
  editing?: ShortLink | null
  slugExists: (slug: string, exceptId?: string) => boolean
}

function emptyDraft(): LinkDraft {
  return {
    title: '',
    slug: '',
    destinationUrl: '',
    tags: [],
    status: 'active',
  }
}

export function LinkDrawer({
  open,
  onClose,
  onSave,
  domain,
  editing,
  slugExists,
}: LinkDrawerProps) {
  const [draft, setDraft] = useState<LinkDraft>(emptyDraft())
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setDraft({
        title: editing.title,
        slug: editing.slug,
        destinationUrl: editing.destinationUrl,
        tags: editing.tags,
        status: editing.status === 'archived' ? 'inactive' : editing.status,
      })
    } else {
      setDraft(emptyDraft())
    }
    setTouched({})
    setCopied(false)
  }, [open, editing])

  const errors = useMemo(() => {
    const e: { title?: string; slug?: string; destinationUrl?: string } = {}
    if (!draft.title.trim()) e.title = 'Title is required'
    if (!draft.slug.trim()) e.slug = 'Slug is required'
    else if (!isValidSlug(draft.slug))
      e.slug = 'Lowercase letters, numbers, and hyphens only'
    else if (slugExists(draft.slug, editing?.id)) e.slug = 'This slug is already in use'
    if (!draft.destinationUrl.trim()) e.destinationUrl = 'Destination URL is required'
    else if (!isValidUrl(normalizeUrl(draft.destinationUrl)))
      e.destinationUrl = 'Enter a valid http(s) URL'
    return e
  }, [draft, editing, slugExists])

  const isValid = Object.keys(errors).length === 0

  function update<K extends keyof LinkDraft>(key: K, value: LinkDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function suggestSlug() {
    update('slug', slugify(draft.title))
    setTouched((t) => ({ ...t, slug: true }))
  }

  function handleCopy() {
    if (!isValidSlug(draft.slug) || slugExists(draft.slug, editing?.id)) return
    copyToClipboard(buildShortUrl(domain, draft.slug))
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }

  function handleSubmit() {
    setTouched({ title: true, slug: true, destinationUrl: true })
    if (!isValid) return
    onSave({
      ...draft,
      title: draft.title.trim(),
      slug: draft.slug.trim().toLowerCase(),
      destinationUrl: normalizeUrl(draft.destinationUrl),
    })
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? 'Edit link' : 'New short link'}
      description={
        editing ? 'Update the details of your short link.' : 'Create a new short link to share.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            {editing ? 'Save changes' : 'Create link'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col">
        {/* Notion-style property rows: label left, value right, divided */}
        <PropRow label="Title" error={touched.title ? errors.title : undefined}>
          <input
            value={draft.title}
            onChange={(e) => update('title', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, title: true }))}
            placeholder="Untitled"
            autoFocus
            className={propInputClass(touched.title && Boolean(errors.title))}
          />
        </PropRow>

        <PropRow
          label="Destination"
          error={touched.destinationUrl ? errors.destinationUrl : undefined}
        >
          <input
            value={draft.destinationUrl}
            onChange={(e) => update('destinationUrl', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, destinationUrl: true }))}
            placeholder="https://example.com/long-url"
            className={propInputClass(touched.destinationUrl && Boolean(errors.destinationUrl))}
          />
        </PropRow>

        <PropRow
          label="Slug"
          hint="used in /link/:slug"
          error={touched.slug ? errors.slug : undefined}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <input
                value={draft.slug}
                onChange={(e) => update('slug', e.target.value.toLowerCase())}
                onBlur={() => setTouched((t) => ({ ...t, slug: true }))}
                placeholder="my-link"
                className={cn(propInputClass(touched.slug && Boolean(errors.slug)), 'font-mono')}
              />
              <Button
                variant="subtle"
                size="md"
                onClick={suggestSlug}
                title="Suggest from title"
                className="shrink-0"
              >
                <Sparkles size={14} />
              </Button>
            </div>
            {draft.slug && !errors.slug ? (
              <div className="group/copy flex items-center gap-2 rounded-[5px] border border-neutral-200 bg-neutral-50 px-2.5 py-1.5">
                <span className="truncate font-mono text-[12px] text-neutral-600">
                  {buildShortUrl(domain, draft.slug)}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    'ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors',
                    copied
                      ? 'text-[#4f9a6e]'
                      : 'text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800',
                  )}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : null}
          </div>
        </PropRow>

        <PropRow label="Tags">
          <TagInput
            tags={draft.tags}
            onChange={(tags) => update('tags', tags)}
            placeholder="Add a tag and press Enter…"
          />
        </PropRow>

        <PropRow label="Status">
          <SegmentedControl<LinkStatus>
            value={draft.status === 'archived' ? 'inactive' : draft.status}
            onChange={(value) => update('status', value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            className="w-fit"
          />
        </PropRow>
      </div>
    </Drawer>
  )
}

function PropRow({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 border-b border-neutral-100 py-2.5 last:border-0">
      <div className="flex flex-col pt-1.5">
        <span className="text-[13px] font-medium text-neutral-600">{label}</span>
        {hint ? <span className="text-[11px] text-neutral-400">{hint}</span> : null}
      </div>
      <div className="flex flex-col gap-1">
        {children}
        {error ? <p className="text-[12px] text-[#e03e3e]">{error}</p> : null}
      </div>
    </div>
  )
}

function propInputClass(invalid: boolean): string {
  const base =
    'h-8 w-full rounded-[5px] border bg-white px-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors'
  return invalid
    ? `${base} border-[#e9c5c7] bg-[#fbeaea] focus:ring-2 focus:ring-[#e03e3e]/20`
    : `${base} border-neutral-200 hover:border-neutral-300 focus:border-[#337ea9]/40 focus:ring-2 focus:ring-[#337ea9]/20`
}
