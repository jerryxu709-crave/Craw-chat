import { useState, useCallback, useRef } from 'react'
import {
  createConversation,
  addMessage,
  getMessages,
  updateConversation,
} from '../lib/db'
import { streamCrowResponse } from '../lib/claude'
import { autoTagConversation } from '../lib/tagging'
import type {
  Conversation,
  Message,
  StreamingMessage,
  LanguageMode,
  FamiliarityLevel,
} from '../types'

export function useConversation(mode: LanguageMode, familiarityLevel: FamiliarityLevel) {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState<StreamingMessage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<boolean>(false)
  const messagesRef = useRef<Message[]>([])
  messagesRef.current = messages

  const loadConversation = useCallback(async (conv: Conversation) => {
    setActiveConversation(conv)
    const msgs = await getMessages(conv.id)
    setMessages(msgs)
    setStreaming(null)
  }, [])

  const startNewConversation = useCallback(async () => {
    const conv = await createConversation(mode)
    setActiveConversation(conv)
    setMessages([])
    setStreaming(null)
    return conv
  }, [mode])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      let conv = activeConversation
      if (!conv) {
        conv = await startNewConversation()
      }

      const userMsg = await addMessage({
        conversationId: conv.id,
        role: 'user',
        content: text.trim(),
      })
      setMessages((prev) => [...prev, userMsg])

      const streamId = crypto.randomUUID()
      setStreaming({ id: streamId, content: '', isStreaming: true })
      setIsLoading(true)
      abortRef.current = false

      let fullContent = ''
      const convId = conv.id
      const currentMessages = [...messagesRef.current, userMsg]

      try {
        for await (const chunk of streamCrowResponse(
          currentMessages,
          text,
          mode,
          familiarityLevel,
        )) {
          if (abortRef.current) break
          fullContent += chunk
          setStreaming({ id: streamId, content: fullContent, isStreaming: true })
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : '连接失败，请检查网络和 API Key'
        fullContent = `[Error: ${errorMsg}]`
        setStreaming({ id: streamId, content: fullContent, isStreaming: false })
      } finally {
        if (fullContent && !fullContent.startsWith('[Error:')) {
          const assistantMsg = await addMessage({
            conversationId: convId,
            role: 'assistant',
            content: fullContent,
          })
          setMessages((prev) => [...prev, assistantMsg])

          // Auto-tag after every 2nd assistant turn (fire-and-forget)
          const allMsgs = [...currentMessages, assistantMsg]
          const assistantCount = allMsgs.filter((m) => m.role === 'assistant').length
          if (assistantCount % 2 === 0) {
            autoTagConversation(allMsgs).then((tags) => {
              updateConversation(convId, {
                title: tags.title,
                themes: tags.themes,
                emotions: tags.emotions,
              })
              setActiveConversation((prev) =>
                prev && prev.id === convId
                  ? { ...prev, title: tags.title, themes: tags.themes, emotions: tags.emotions }
                  : prev,
              )
            })
          }
        } else if (fullContent.startsWith('[Error:')) {
          setMessages((prev) => [
            ...prev,
            {
              id: streamId,
              conversationId: convId,
              role: 'assistant',
              content: fullContent,
              timestamp: Date.now(),
            },
          ])
        }
        setStreaming(null)
        setIsLoading(false)
      }
    },
    [activeConversation, isLoading, mode, familiarityLevel, startNewConversation],
  )

  return {
    activeConversation,
    messages,
    streaming,
    isLoading,
    loadConversation,
    startNewConversation,
    sendMessage,
  }
}
