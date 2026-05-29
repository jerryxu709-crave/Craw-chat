import Anthropic from '@anthropic-ai/sdk'
import type { Message as AppMessage, LanguageMode, FamiliarityLevel } from '../types'
import { buildSystemPrompt } from '../prompts/crow'
import { buildLanguageHint } from './language'

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const CHAT_MODEL = 'claude-sonnet-4-5'
const UTIL_MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 1024

export async function* streamCrowResponse(
  conversationMessages: AppMessage[],
  userText: string,
  mode: LanguageMode,
  familiarityLevel: FamiliarityLevel,
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = buildSystemPrompt(mode, familiarityLevel)
  const languageHint = buildLanguageHint(userText)
  const fullSystem = `${systemPrompt}\n\n${languageHint}`

  const history = conversationMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const stream = anthropic.messages.stream({
    model: CHAT_MODEL,
    max_tokens: MAX_TOKENS,
    system: fullSystem,
    messages: history,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}

export async function callUtility(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: UTIL_MODEL,
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}
