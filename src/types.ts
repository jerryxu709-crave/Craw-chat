export type LanguageMode = 'work' | 'life'
export type FamiliarityLevel = 1 | 2 | 3
export type MessageRole = 'user' | 'assistant'

export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  languageMode: LanguageMode
  themes: string[]
  emotions: string[]
  messageCount: number
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  timestamp: number
}

export interface AppSettings {
  languageMode: LanguageMode
  familiarityLevel: FamiliarityLevel
}

export interface TagVocabulary {
  themes: string[]
  emotions: string[]
  lastUpdated: number
}

export interface StreamingMessage {
  id: string
  content: string
  isStreaming: boolean
}
