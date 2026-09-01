'use client'

import { useEffect, useState } from 'react'

const THEMES = {
  light: { label: 'Niflheim' },
  dark: { label: 'Pluton' },
} as const

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))

    // Only auto-follow the system while the person hasn't made an
    // explicit choice — once they toggle, that choice sticks.
    if (localStorage.getItem('theme')) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      setDark(e.matches)
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const current = dark ? THEMES.dark : THEMES.light

  return (
    <div className='flex w-20 flex-col items-end gap-1'>
      <span className='text-xs font-medium uppercase'>Theme</span>
      <button
        type='button'
        onClick={toggle}
        className='border-border bg-surface text-ink hover:border-ink-muted inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs transition-colors'
        aria-label={`Switch to ${dark ? THEMES.light.label : THEMES.dark.label}`}
      >
        <span className='font-medium'>{current.label}</span>
      </button>
    </div>
  )
}
