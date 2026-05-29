import { useEffect, useRef } from 'react'
import { Menu, Download } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { EmptyState } from './EmptyState'
import { MessageInput } from '../Input/MessageInput'
import { buildMarkdownExport, downloadMarkdown } from '../../lib/export'
import { getMessages } from '../../lib/db'
import type { Conversation, Message, StreamingMessage, LanguageMode } from '../../types'

interface ChatViewProps {
  conversation: Conversation | null
  messages: Message[]
  streaming: StreamingMessage | null
  isLoading: boolean
  mode: LanguageMode
  onOpenSidebar: () => void
  onSendMessage: (text: string) => void
}

export function ChatView({
  conversation,
  messages,
  streaming,
  isLoading,
  mode,
  onOpenSidebar,
  onSendMessage,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, streaming?.content])

  const handleExport = async () => {
    if (!conversation) return
    const msgs = await getMessages(conversation.id)
    const content = buildMarkdownExport(conversation, msgs)
    const filename = `crow-${conversation.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`
    downloadMarkdown(filename, content)
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      {/* Header */}
      <header
        className="flex items-center px-3 py-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--color-crow-border)',
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        }}
      >
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-1 rounded-lg transition-colors"
          style={{ color: 'var(--color-crow-muted)' }}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1
          className="ml-3 text-lg tracking-wide truncate flex-1"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-crow-accent)' }}
        >
          {conversation?.title ?? '乌鸦'}
        </h1>
        {conversation && messages.length > 0 && (
          <button
            onClick={handleExport}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-crow-muted)' }}
            aria-label="Export to Markdown"
            title="导出 Markdown"
          >
            <Download size={18} />
          </button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.length === 0 && !streaming ? (
          <EmptyState mode={mode} />
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {streaming && (
              <MessageBubble
                message={{
                  id: streaming.id,
                  conversationId: conversation?.id ?? '',
                  role: 'assistant',
                  content: streaming.content,
                  timestamp: Date.now(),
                }}
                isStreaming={streaming.isStreaming}
              />
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={onSendMessage} disabled={isLoading} mode={mode} />
    </div>
  )
}
