'use client'
import { useState, useEffect, useCallback } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) apply(saved)
  }, [])

  const apply = (t: Theme) => {
    setTheme(t)
    document.documentElement.classList.toggle('light', t === 'light')
    localStorage.setItem('theme', t)
  }

  const toggle = useCallback(() => {
    apply(theme === 'dark' ? 'light' : 'dark')
  }, [theme])

  return { theme, toggle }
}
