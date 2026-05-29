import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar/Sidebar'
import { ChatView } from './components/ChatView/ChatView'
import { useSettings } from './hooks/useSettings'
import { useConversation } from './hooks/useConversation'
import { getConversations, deleteConversation } from './lib/db'
import type { Conversation } from './types'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const { settings, setMode } = useSettings()
  const {
    activeConversation,
    messages,
    streaming,
    isLoading,
    loadConversation,
    startNewConversation,
    sendMessage,
  } = useConversation(settings.languageMode, settings.familiarityLevel)

  const refreshConversations = () => {
    getConversations().then(setConversations)
  }

  useEffect(() => {
    refreshConversations()
  }, [activeConversation?.updatedAt])

  const handleSelectConversation = async (conv: Conversation) => {
    await loadConversation(conv)
    setSidebarOpen(false)
  }

  const handleNewConversation = async () => {
    await startNewConversation()
    setSidebarOpen(false)
    refreshConversations()
  }

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id)
    refreshConversations()
    if (activeConversation?.id === id) {
      await startNewConversation()
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: 'var(--color-crow-bg)' }}>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        conversations={conversations}
        activeId={activeConversation?.id ?? null}
        mode={settings.languageMode}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onModeChange={setMode}
        onDeleteConversation={handleDeleteConversation}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatView
        conversation={activeConversation}
        messages={messages}
        streaming={streaming}
        isLoading={isLoading}
        mode={settings.languageMode}
        onOpenSidebar={() => setSidebarOpen(true)}
        onSendMessage={sendMessage}
      />
    </div>
  )
}
