import type { LanguageMode } from '../../types'

interface EmptyStateProps {
  mode: LanguageMode
}

export function EmptyState({ mode }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
      <div
        className="text-7xl mb-8 select-none"
        style={{
          fontFamily: 'var(--font-serif)',
          color: 'var(--color-crow-accent)',
          textShadow: '0 2px 24px rgba(0,0,0,0.6)',
        }}
      >
        烏
      </div>
      {mode === 'life' ? (
        <p
          className="text-sm leading-loose max-w-xs"
          style={{
            color: 'var(--color-crow-muted)',
            textShadow: '0 1px 12px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.7)',
          }}
        >
          今天，有什么压在你心上？
        </p>
      ) : (
        <p
          className="text-sm leading-loose max-w-xs"
          style={{
            color: 'var(--color-crow-muted)',
            textShadow: '0 1px 12px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.7)',
          }}
        >
          What's been sitting with you today?
        </p>
      )}
    </div>
  )
}
