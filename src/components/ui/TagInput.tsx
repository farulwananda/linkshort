import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '#/lib/utils'

type TagInputProps = {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Add a tag…' }: TagInputProps) {
  const [input, setInput] = useState('')

  function addTag() {
    const value = input.trim().toLowerCase()
    if (!value) return
    if (tags.includes(value)) {
      setInput('')
      return
    }
    onChange([...tags, value])
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-[34px] w-full flex-wrap items-center gap-1 rounded-[5px]',
        'border border-neutral-200 bg-white px-1.5 py-1',
        'hover:border-neutral-300 focus-within:border-[#337ea9]/40 focus-within:ring-2 focus-within:ring-[#337ea9]/20',
      )}
      onClick={() => {
        const el = document.getElementById('tag-input-field')
        el?.focus()
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-[4px] bg-notion-blue-bg px-1.5 py-0.5 text-[12px] font-medium text-[#337ea9]"
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(tag)
            }}
            className="rounded hover:text-[#0b6bcb]"
            aria-label={`Remove ${tag}`}
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <div className="flex flex-1 items-center gap-1">
        <input
          id="tag-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="h-7 min-w-[80px] flex-1 bg-transparent text-[14px] text-neutral-900 placeholder:text-neutral-400 outline-none"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            addTag()
          }}
          disabled={!input.trim()}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Add tag"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
