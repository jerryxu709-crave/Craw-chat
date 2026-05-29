import { useState } from 'react'
import { clsx } from 'clsx'
import { X, Plus } from 'lucide-react'
import { ConversationList } from './ConversationList'
import { TagTree } from './TagTree'
import { loadVocabulary } from '../../lib/settings'
import type { Conversation, LanguageMode } from '../../types'

interface SidebarProps {
  open: boolean
  conversations: Conversation[]
  activeId: string | null
  mode: LanguageMode
  onSelectConversation: (conv: Conversation) => void
  onNewConversation: () => void
  onModeChange: (mode: LanguageMode) => void
  onClose: () => void
}

export function Sidebar({
  open,
  conversations,
  activeId,
  mode,
  onSelectConversation,
  onNewConversation,
  onModeChange,
  onClose,
}: SidebarProps) {
  const vocab = loadVocabulary()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filtered = selectedTag
    ? conversations.filter(
        (c) => c.themes.includes(selectedTag) || c.emotions.includes(selectedTag),
      )
    : conversations

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 z-30 h-full w-72 flex flex-col',
        'transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
      style={{
        background: 'var(--color-crow-surface)',
        borderRight: '1px solid var(--color-crow-border)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Brand + Close */}
      <div
        className="flex items-center justify-between px-4 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-crow-border)' }}
      >
        <span
          className="text-2xl tracking-widest select-none"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-crow-accent)' }}
        >
          乌鸦
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--color-crow-muted)' }}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Active filter indicator */}
      {selectedTag && (
        <div
          className="flex items-center gap-2 px-4 py-2 shrink-0"
          style={{ borderBottom: '1px solid var(--color-crow-border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--color-crow-muted)' }}>
            筛选：
          </span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
            style={{ background: 'var(--color-crow-accent)', color: 'var(--color-crow-bg)' }}
          >
            {selectedTag}
            <button onClick={() => setSelectedTag(null)} className="ml-0.5" aria-label="清除筛选">
              <X size={11} />
            </button>
          </span>
          <span className="text-xs ml-auto" style={{ color: 'var(--color-crow-muted)', opacity: 0.6 }}>
            {filtered.length} 条
          </span>
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <ConversationList
          conversations={filtered}
          activeId={activeId}
          onSelect={onSelectConversation}
        />
      </div>

      {/* Tag tree */}
      <div style={{ borderTop: '1px solid var(--color-crow-border)' }}>
        <TagTree
          themes={vocab.themes}
          emotions={vocab.emotions}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
        />
      </div>

      {/* Bottom controls */}
      <div
        className="px-3 py-3 space-y-2 shrink-0"
        style={{ borderTop: '1px solid var(--color-crow-border)' }}
      >
        {/* Mode toggle */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-crow-border)' }}
        >
          {(['life', 'work'] as LanguageMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className="flex-1 py-2 text-sm transition-colors"
              style={{
                background: mode === m ? 'var(--color-crow-accent)' : 'transparent',
                color: mode === m ? 'var(--color-crow-bg)' : 'var(--color-crow-muted)',
                fontWeight: mode === m ? 500 : 400,
              }}
            >
              {m === 'life' ? '生活' : '工作'}
            </button>
          ))}
        </div>

        {/* New conversation */}
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors"
          style={{
            border: '1px solid var(--color-crow-border)',
            color: 'var(--color-crow-muted)',
          }}
        >
          <Plus size={16} />
          新对话
        </button>
      </div>
    </aside>
  )
}
