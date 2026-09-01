'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="border border-border px-2.5 py-1 text-xs text-ink-muted hover:text-ink"
      aria-label="Toggle dark mode"
    >
      {dark ? 'Deadwood' : 'Tundra'}
    </button>
  )
}
