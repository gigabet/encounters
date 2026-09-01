'use client'

import { useEffect, useState } from 'react'

// Foggy conifer for Niflheim (light), gnarled dead tree for Pluton (dark).
function ConiferIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 20 20'
      width='16'
      height='16'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.3'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M10 2c-1.8 2.6-3.3 4.7-3.3 4.7h6.6S11.8 4.6 10 2z' />
      <path d='M10 6.3c-2.2 3-4 5.5-4 5.5h8S12.2 9.3 10 6.3z' />
      <path d='M10 11.2c-2.6 3.4-4.7 6.3-4.7 6.3h9.4s-2.1-2.9-4.7-6.3z' />
      <path d='M10 17.5v1' />
      <path d='M2.5 6.2c.9 1.5 1.4 2.8 1.4 2.8M17.5 6.2c-.9 1.5-1.4 2.8-1.4 2.8' opacity='0.5' />
    </svg>
  )
}

function DeadTreeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 20 20'
      width='16'
      height='16'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.3'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M10 18v-9' />
      <path d='M10 9 6.3 5.3M10 9l4-3.4' />
      <path d='M10 12.8 6.8 10M10 12.8l3.6-2.5' />
      <path d='M7.2 6.1 5.6 3.7M13.1 5.7l1.5-2.3' />
    </svg>
  )
}

const THEMES = {
  light: { label: 'Niflheim', Icon: ConiferIcon },
  dark: { label: 'Pluton', Icon: DeadTreeIcon },
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
  const Icon = current.Icon

  return (
    <div className='flex w-25 flex-col'>
      <span className='text-xs font-medium uppercase'>Theme</span>
      <button
        type='button'
        onClick={toggle}
        className='border-border bg-surface text-ink hover:border-ink-muted inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs transition-colors'
        aria-label={`Switch to ${dark ? THEMES.light.label : THEMES.dark.label}`}
      >
        <Icon className='text-ink-muted' />
        <span className='font-medium'>{current.label}</span>
      </button>
    </div>
  )
}
