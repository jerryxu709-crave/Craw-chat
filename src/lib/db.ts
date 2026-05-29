import Dexie, { type EntityTable } from 'dexie'
import type { Conversation, Message, LanguageMode } from '../types'

class CrowDatabase extends Dexie {
  conversations!: EntityTable<Conversation, 'id'>
  messages!: EntityTable<Message, 'id'>

  constructor() {
    super('crow-db')
    this.version(1).stores({
      conversations: 'id, updatedAt, languageMode',
      messages: 'id, conversationId, timestamp',
    })
  }
}

export const db = new CrowDatabase()

export async function createConversation(mode: LanguageMode): Promise<Conversation> {
  const conv: Conversation = {
    id: crypto.randomUUID(),
    title: '新对话',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    languageMode: mode,
    themes: [],
    emotions: [],
    messageCount: 0,
  }
  await db.conversations.add(conv)
  return conv
}

export async function getConversations(): Promise<Conversation[]> {
  return db.conversations.orderBy('updatedAt').reverse().toArray()
}

export async function updateConversation(id: string, changes: Partial<Omit<Conversation, 'id'>>): Promise<void> {
  await db.conversations.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteConversation(id: string): Promise<void> {
  await db.transaction('rw', db.conversations, db.messages, async () => {
    await db.messages.where('conversationId').equals(id).delete()
    await db.conversations.delete(id)
  })
}

export async function addMessage(msg: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const full: Message = {
    ...msg,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  await db.messages.add(full)
  const count = await db.messages.where('conversationId').equals(msg.conversationId).count()
  await db.conversations.update(msg.conversationId, {
    updatedAt: Date.now(),
    messageCount: count,
  })
  return full
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('timestamp')
}
