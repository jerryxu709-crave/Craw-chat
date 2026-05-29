import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface TagSectionProps {
  label: string
  tags: string[]
  selectedTag: string | null
  onTagSelect: (tag: string | null) => void
}

function TagSection({ label, tags, selectedTag, onTagSelect }: TagSectionProps) {
  const [expanded, setExpanded] = useState(false)
  if (tags.length === 0) return null

  return (
    <div>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-1.5 px-4 py-2 text-xs transition-colors"
        style={{ color: 'var(--color-crow-muted)' }}
      >
        <ChevronRight
          size={13}
          className={clsx('transition-transform shrink-0', expanded && 'rotate-90')}
        />
        {label}
        <span className="ml-auto opacity-50">{tags.length}</span>
      </button>
      {expanded && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {tags.map((tag) => {
            const active = selectedTag === tag
            return (
              <button
                key={tag}
                onClick={() => onTagSelect(active ? null : tag)}
                className="px-2 py-0.5 rounded-full text-xs transition-colors"
                style={{
                  background: active ? 'var(--color-crow-accent)' : 'var(--color-crow-border)',
                  color: active ? 'var(--color-crow-bg)' : 'var(--color-crow-muted)',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface TagTreeProps {
  themes: string[]
  emotions: string[]
  selectedTag: string | null
  onTagSelect: (tag: string | null) => void
}

export function TagTree({ themes, emotions, selectedTag, onTagSelect }: TagTreeProps) {
  if (themes.length === 0 && emotions.length === 0) {
    return (
      <p
        className="px-4 py-3 text-xs"
        style={{ color: 'var(--color-crow-muted)', opacity: 0.5 }}
      >
        对话后标签将在此出现
      </p>
    )
  }
  return (
    <div className="py-1">
      <TagSection label="主题" tags={themes} selectedTag={selectedTag} onTagSelect={onTagSelect} />
      <TagSection label="情绪" tags={emotions} selectedTag={selectedTag} onTagSelect={onTagSelect} />
    </div>
  )
}
