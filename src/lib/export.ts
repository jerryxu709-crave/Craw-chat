import type { Conversation, Message } from '../types'

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0]
}

export function buildMarkdownExport(conv: Conversation, messages: Message[]): string {
  const frontmatter = [
    '---',
    `title: "${conv.title}"`,
    `date: ${formatDate(conv.createdAt)}`,
    `source: crow-writing-pwa`,
    `themes: [${conv.themes.join(', ')}]`,
    `emotions: [${conv.emotions.join(', ')}]`,
    `mode: ${conv.languageMode}`,
    '---',
    '',
    `# ${conv.title}`,
    '',
  ].join('\n')

  const body = messages
    .map((m) => {
      const speaker = m.role === 'user' ? '**Jerry**' : '**乌鸦**'
      return `${speaker}\n${m.content}`
    })
    .join('\n\n---\n\n')

  const footer = `\n\n---\n*Exported from 乌鸦 · ${formatDate(Date.now())}*`

  return frontmatter + body + footer
}

export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
