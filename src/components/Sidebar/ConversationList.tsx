import { clsx } from 'clsx'
import type { Conversation } from '../../types'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
}

function formatRelativeDate(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  return new Date(timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
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
        <li key={conv.id}>
          <button
            onClick={() => onSelect(conv)}
            className={clsx('w-full text-left px-4 py-3 transition-colors')}
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
        </li>
      ))}
    </ul>
  )
}
