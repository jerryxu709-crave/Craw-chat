import { useState, useCallback } from 'react'
import { loadSettings, saveSettings } from '../lib/settings'
import type { AppSettings, LanguageMode } from '../types'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  const setMode = useCallback((mode: LanguageMode) => {
    setSettings((prev) => {
      const next = { ...prev, languageMode: mode }
      saveSettings(next)
      return next
    })
  }, [])

  return { settings, setMode }
}
