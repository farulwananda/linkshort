import { useRef, useState } from 'react'
import { CheckCircle2, FileUp, AlertCircle } from 'lucide-react'
import { Modal } from '#/components/ui/Modal'
import { Button } from '#/components/ui/Button'
import { parseImportJson, type ImportResult } from '#/lib/importExport'
import type { ShortLink } from '#/lib/types'

type ImportModalProps = {
  open: boolean
  onClose: () => void
  onImport: (links: ShortLink[]) => { added: number; merged: number }
}

export function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [done, setDone] = useState<{ added: number; merged: number } | null>(null)
  const [pasteText, setPasteText] = useState('')

  function handleText(raw: string) {
    const parsed = parseImportJson(raw)
    setResult(parsed)
    setDone(null)
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      handleText(String(reader.result ?? ''))
    }
    reader.readAsText(file)
  }

  function confirmImport() {
    if (!result || result.valid.length === 0) return
    const res = onImport(result.valid)
    setDone(res)
    setResult(null)
    setPasteText('')
  }

  function close() {
    setResult(null)
    setDone(null)
    setPasteText('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Import links"
      description="Upload a JSON file or paste link data. Duplicate slugs are auto-renamed."
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={confirmImport}
            disabled={!result || result.valid.length === 0}
          >
            Import {result?.valid.length ?? 0} links
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {done ? (
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
            <CheckCircle2 size={15} />
            Imported {done.added} new, merged {done.merged} existing.
          </div>
        ) : null}

        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
        >
          <FileUp size={20} className="text-neutral-400" />
          <p className="text-[13px] text-neutral-500">
            Drag & drop a JSON file, or
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-neutral-700">
            Or paste JSON
          </label>
          <textarea
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value)
              if (e.target.value.trim()) handleText(e.target.value)
              else setResult(null)
            }}
            placeholder='[{ "title": "...", "slug": "...", "destinationUrl": "..." }]'
            className="min-h-[120px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 font-mono text-[12px] text-neutral-800 outline-none focus:ring-2 focus:ring-neutral-300"
          />
        </div>

        {result ? (
          <div className="flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-[12px]">
            <div className="flex items-center gap-2 text-neutral-700">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>{result.valid.length} valid links ready</span>
            </div>
            {result.slugCollisions > 0 ? (
              <p className="text-neutral-500">
                {result.slugCollisions} duplicate slug
                {result.slugCollisions === 1 ? '' : 's'} will be auto-renamed on import.
              </p>
            ) : null}
            {result.skipped > 0 ? (
              <p className="text-amber-600">{result.skipped} row(s) skipped.</p>
            ) : null}
            {result.errors.length > 0 ? (
              <div className="mt-1 flex flex-col gap-1">
                {result.errors.slice(0, 5).map((err, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-red-600">
                    <AlertCircle size={12} className="mt-0.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
                {result.errors.length > 5 ? (
                  <span className="text-neutral-400">
                    +{result.errors.length - 5} more errors…
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
