import { callUtility } from './claude'
import { mergeIntoVocabulary, loadVocabulary } from './settings'
import type { Message } from '../types'

interface TagResult {
  themes: string[]
  emotions: string[]
  title: string
}

function buildTaggingPrompt(messages: Message[]): string {
  const vocab = loadVocabulary()
  const existingThemes = vocab.themes.length ? `Existing theme tags (reuse if appropriate): ${vocab.themes.join(', ')}` : ''
  const existingEmotions = vocab.emotions.length ? `Existing emotion tags (reuse if appropriate): ${vocab.emotions.join(', ')}` : ''

  const conversation = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Crow'}: ${m.content}`)
    .join('\n\n')

  return `Analyze this conversation and respond ONLY with valid JSON (no markdown, no explanation):

{
  "title": "<5–10 Chinese character title capturing the core topic>",
  "themes": ["<topic tag 1>", "<topic tag 2>"],
  "emotions": ["<emotion tag 1>"]
}

Rules:
- title: 5–10 Chinese characters, noun phrase. If the conversation is in English, use an English noun phrase.
- themes: 1–3 Chinese noun strings (e.g. 工作压力, 自我认知, 关系). Reuse existing tags when a close match exists.
- emotions: 1–2 Chinese adjective/state strings (e.g. 焦虑, 平静, 迷茫). Reuse existing tags when a close match exists.
- If the conversation is primarily in English, tags may be English.
${existingThemes}
${existingEmotions}

Conversation:
${conversation}`
}

export async function autoTagConversation(messages: Message[]): Promise<TagResult> {
  const fallback: TagResult = { title: '对话', themes: [], emotions: [] }
  if (messages.length < 2) return fallback

  try {
    const raw = await callUtility(buildTaggingPrompt(messages))
    const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as TagResult
    mergeIntoVocabulary(parsed.themes ?? [], parsed.emotions ?? [])
    return {
      title: parsed.title ?? fallback.title,
      themes: parsed.themes ?? [],
      emotions: parsed.emotions ?? [],
    }
  } catch {
    return fallback
  }
}
