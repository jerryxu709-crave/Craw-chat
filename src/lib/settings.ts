import type { AppSettings, TagVocabulary } from '../types'

const SETTINGS_KEY = 'crow-settings'
const VOCAB_KEY = 'crow-vocabulary'

const defaultSettings: AppSettings = {
  languageMode: 'life',
  familiarityLevel: 1,
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

const defaultVocab: TagVocabulary = { themes: [], emotions: [], lastUpdated: 0 }

export function loadVocabulary(): TagVocabulary {
  try {
    const raw = localStorage.getItem(VOCAB_KEY)
    return raw ? JSON.parse(raw) : defaultVocab
  } catch {
    return defaultVocab
  }
}

export function saveVocabulary(vocab: TagVocabulary): void {
  localStorage.setItem(VOCAB_KEY, JSON.stringify(vocab))
}

export function mergeIntoVocabulary(newThemes: string[], newEmotions: string[]): void {
  const existing = loadVocabulary()
  const themes = Array.from(new Set([...existing.themes, ...newThemes]))
  const emotions = Array.from(new Set([...existing.emotions, ...newEmotions]))
  saveVocabulary({ themes, emotions, lastUpdated: Date.now() })
}
