import { useState, useRef, useCallback } from 'react'
import { SendHorizontal } from 'lucide-react'
import type { LanguageMode } from '../../types'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled: boolean
  mode: LanguageMode
}

export function MessageInput({ onSend, disabled, mode }: MessageInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, disabled, onSend])

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const placeholder = mode === 'life' ? '倒一段话进来…' : 'Pour your thoughts…'

  return (
    <div
      className="shrink-0 px-3 py-3"
      style={{
        borderTop: '1px solid var(--color-crow-border)',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="flex items-end gap-2 px-4 py-2 rounded-2xl"
        style={{ background: 'var(--color-crow-surface)', border: '1px solid var(--color-crow-border)' }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none py-1"
          style={{
            color: 'var(--color-crow-text)',
            maxHeight: '200px',
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="shrink-0 p-1.5 rounded-xl transition-colors"
          style={{
            color: disabled || !text.trim() ? 'var(--color-crow-muted)' : 'var(--color-crow-accent)',
          }}
          aria-label="发送"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </div>
  )
}
