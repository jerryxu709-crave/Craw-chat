export type DetectedLanguage = 'zh' | 'en' | 'mixed'

export function detectCJKRatio(text: string): number {
  const noSpace = text.replace(/\s/g, '')
  if (noSpace.length === 0) return 0
  const cjkCount = (noSpace.match(/[㐀-鿿豈-﫿]/g) ?? []).length
  return cjkCount / noSpace.length
}

export function detectLanguage(text: string): DetectedLanguage {
  const ratio = detectCJKRatio(text)
  if (ratio > 0.5) return 'zh'
  if (ratio > 0.15) return 'mixed'
  return 'en'
}

export function buildLanguageHint(text: string): string {
  const lang = detectLanguage(text)
  if (lang === 'zh') return 'The user wrote primarily in Chinese. Respond in Chinese.'
  if (lang === 'en') return 'The user wrote in English. Respond in English.'
  return 'The user mixed Chinese and English. Match the dominant language.'
}
