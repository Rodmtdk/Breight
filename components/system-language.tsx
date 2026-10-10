'use client'

import { useEffect } from 'react'

const supportedLanguages = ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl']

export function SystemLanguage() {
  useEffect(() => {
    const language = navigator.language.toLowerCase().split('-')[0]
    const resolvedLanguage = supportedLanguages.includes(language) ? language : 'en'
    document.documentElement.lang = resolvedLanguage
    document.documentElement.dir = 'ltr'
  }, [])

  return null
}
