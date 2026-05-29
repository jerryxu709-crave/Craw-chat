import { clsx } from 'clsx'
import type { Message } from '../../types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2 mt-1 select-none"
          style={{
            background: 'var(--color-crow-border)',
            color: 'var(--color-crow-accent)',
            fontFamily: 'var(--font-serif)',
          }}
        >
          烏
        </div>
      )}
      <div
        className={clsx(
          'max-w-[82%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
          isUser ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm',
        )}
        style={{
          background: isUser ? 'var(--color-crow-user)' : 'var(--color-crow-crow)',
          color: 'var(--color-crow-text)',
          border: `1px solid ${isUser ? 'transparent' : 'var(--color-crow-border)'}`,
        }}
      >
        {message.content}
        {isStreaming && (
          <span
            className="inline-block ml-0.5 animate-pulse"
            style={{ color: 'var(--color-crow-accent)' }}
          >
            ▋
          </span>
        )}
      </div>
    </div>
  )
}
