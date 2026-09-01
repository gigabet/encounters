'use client'

import { useEffect, useState } from 'react'
import { BsCloudFog2 } from 'react-icons/bs'
import { GiTreeBranch } from 'react-icons/gi'

const THEMES = {
  light: { label: 'Niflheim', desc: 'Light', Icon: BsCloudFog2 },
  dark: { label: 'Pluton', desc: 'Dark', Icon: GiTreeBranch },
} as const

const THEME_COOKIE = 'theme'
const ONE_YEAR = 60 * 60 * 24 * 365

function hasThemeCookie() {
  return document.cookie.split('; ').some(c => c.startsWith(`${THEME_COOKIE}=`))
}

function setThemeCookie(value: 'light' | 'dark') {
  // biome-ignore lint/suspicious/noDocumentCookie: theme cookie
  document.cookie = `${THEME_COOKIE}=${value}; path=/; max-age=${ONE_YEAR}; samesite=lax`
}

// `initialDark` comes from the server, which read the same cookie this
// component writes to — so the very first client render matches the HTML
// the server sent, and there's nothing left for React to reconcile.
export function ThemeToggle({ initialDark }: { initialDark: boolean }) {
  const [dark, setDark] = useState(initialDark)

  useEffect(() => {
    // Only auto-follow the system while the person has never made an
    // explicit choice — once a cookie exists, that choice sticks.
    if (hasThemeCookie()) return
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
    setThemeCookie(next ? 'dark' : 'light')
  }

  const current = dark ? THEMES.dark : THEMES.light

  return (
    <div className='flex flex-col items-end gap-1.5'>
      <span className='text-ink-muted text-xs font-medium tracking-wide uppercase'>Realm</span>

      <button
        type='button'
        onClick={toggle}
        role='switch'
        aria-checked={dark}
        aria-label={`Switch to ${dark ? THEMES.light.label : THEMES.dark.label}`}
        title={`${current.label} — ${current.desc}`}
        className='border-border bg-surface hover:border-ink-muted relative inline-flex h-8 w-[68px] shrink-0 items-center rounded-full border px-1 transition-colors'
      >
        <BsCloudFog2
          className={`absolute left-[7px] h-3.5 w-3.5 transition-opacity ${
            dark ? 'text-ink-muted opacity-30' : 'text-accent opacity-100'
          }`}
        />
        <GiTreeBranch
          className={`absolute right-[7px] h-3.5 w-3.5 transition-opacity ${
            dark ? 'text-accent opacity-100' : 'text-ink-muted opacity-30'
          }`}
        />

        <span
          className={`bg-accent relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-transform duration-200 ${
            dark ? 'translate-x-[36px]' : 'translate-x-0'
          }`}
        >
          <current.Icon className='h-3.5 w-3.5 text-white' />
        </span>
      </button>

      <span className='text-ink-muted text-[11px]'>
        {current.label} <span className='opacity-60'>· {current.desc}</span>
      </span>
    </div>
  )
}
