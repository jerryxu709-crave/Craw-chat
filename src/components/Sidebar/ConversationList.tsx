import { useState } from 'react'
import { Trash2, Check, X } from 'lucide-react'
import { clsx } from 'clsx'
import type { Conversation } from '../../types'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
  onDelete?: (id: string) => void
}

function formatRelativeDate(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  return new Date(timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function ConversationList({ conversations, activeId, onSelect, onDelete }: ConversationListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  if (conversations.length === 0) {
    return (
      <p
        className="px-4 py-8 text-xs text-center"
        style={{ color: 'var(--color-crow-muted)' }}
      >
        还没有对话
      </p>
    )
  }

  return (
    <ul className="py-2">
      {conversations.map((conv) => (
        <li key={conv.id} className="flex items-stretch group">
          <button
            onClick={() => onSelect(conv)}
            className={clsx('flex-1 text-left px-4 py-3 transition-colors min-w-0')}
            style={{
              background: activeId === conv.id ? 'var(--color-crow-border)' : 'transparent',
              color: activeId === conv.id ? 'var(--color-crow-text)' : 'var(--color-crow-muted)',
            }}
          >
            <div className="text-sm truncate">{conv.title}</div>
            <div
              className="text-xs mt-0.5 flex items-center gap-2"
              style={{ color: 'var(--color-crow-muted)', opacity: 0.7 }}
            >
              <span>{formatRelativeDate(conv.updatedAt)}</span>
              {conv.themes.length > 0 && (
                <span className="truncate">{conv.themes.slice(0, 2).join(' · ')}</span>
              )}
            </div>
          </button>

          {onDelete && (
            <div className="flex items-center pr-2 shrink-0">
              {confirmId === conv.id ? (
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => { onDelete(conv.id); setConfirmId(null) }}
                    className="p-1 rounded transition-colors"
                    style={{ color: '#e57373' }}
                    aria-label="确认删除"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--color-crow-muted)' }}
                    aria-label="取消"
                  >
                    <X size={14} />
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmId(conv.id)}
                  className="p-1.5 rounded transition-opacity"
                  style={{ opacity: 0.4, color: 'var(--color-crow-muted)' }}
                  aria-label="删除对话"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
