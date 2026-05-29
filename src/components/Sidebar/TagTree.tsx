import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface TagSectionProps {
  label: string
  tags: string[]
}

function TagSection({ label, tags }: TagSectionProps) {
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
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                background: 'var(--color-crow-border)',
                color: 'var(--color-crow-muted)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface TagTreeProps {
  themes: string[]
  emotions: string[]
}

export function TagTree({ themes, emotions }: TagTreeProps) {
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
      <TagSection label="主题" tags={themes} />
      <TagSection label="情绪" tags={emotions} />
    </div>
  )
}
