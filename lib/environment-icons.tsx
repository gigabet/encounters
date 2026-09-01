// lib/environment-icons.tsx
//
// Quiet little glyphs for the environment tags, meant to sit tucked into a
// card's header rather than compete with the title or the search/filter
// UI. Unmapped environment strings (a new terrain added to the YAML)
// still render — as a plain dot — instead of breaking.

import type { JSX, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const BASE: IconProps = {
  viewBox: '0 0 16 16',
  width: 14,
  height: 14,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  forest: props => (
    <svg {...BASE} {...props}>
      <title>forest</title>
      <path d='M8 1 4.5 6h7L8 1z' />
      <path d='M8 4.5 3.5 10.5h9L8 4.5z' />
      <path d='M8 10.5v4' />
    </svg>
  ),
  grassland: props => (
    <svg {...BASE} {...props}>
      <title>grassland</title>
      <path d='M2 14c1-3 1-7 1-7M5 14c1-4 1-9 1-9M8 14c1-3 1-6 1-6M11 14c1-4 1-8 1-8M14 14c1-3 1-6 1-6' />
    </svg>
  ),
  hill: props => (
    <svg {...BASE} {...props}>
      <title>hill</title>
      <path d='M1 12c2-3 3.5-4 5-4s3 1.5 4.5 3S13.5 12 15 12' />
      <path d='M1 14h14' />
    </svg>
  ),
  mountain: props => (
    <svg {...BASE} {...props}>
      <title>mountain</title>
      <path d='M1 13 5.5 5l3 4.5L11 6l4 7z' />
    </svg>
  ),
  desert: props => (
    <svg {...BASE} {...props}>
      <title>desert</title>
      <circle cx='11.5' cy='4' r='1.5' />
      <path d='M1 13c1.5-2.5 3-3.5 4.5-3.5 1 0 1.5.6 2.5.6s1.5-1.6 3-1.6 2.5 1.8 4 4.5' />
    </svg>
  ),
  swamp: props => (
    <svg {...BASE} {...props}>
      <title>swamp</title>
      <path d='M1 8.5c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0' />
      <path d='M1 13c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0' />
      <path d='M6.5 8.5V4.5' />
    </svg>
  ),
  underdark: props => (
    <svg {...BASE} {...props}>
      <title>underdark</title>
      <path d='M1 13c0-5 2.5-9 7-9s7 4 7 9' />
      <path d='M4 13c0-3 1.5-5.5 4-5.5s4 2.5 4 5.5' />
    </svg>
  ),
  arctic: props => (
    <svg {...BASE} {...props}>
      <title>arctic</title>
      <path d='M8 1v14M2.5 4.2l11 7.6M13.5 4.2l-11 7.6' />
    </svg>
  ),
  urban: props => (
    <svg {...BASE} {...props}>
      <title>urban</title>
      <path d='M2 14V4h4v10M9 14V7h5v7M4 6.5h1.2M4 9h1.2M4 11.5h1.2M11 9h1.5M11 11.5h1.5' />
    </svg>
  ),
  coastal: props => (
    <svg {...BASE} {...props}>
      <title>coastal</title>
      <path d='M1 10.5c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0' />
      <path d='M1 14c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0' />
    </svg>
  ),
  any: props => (
    <svg {...BASE} {...props}>
      <title>any</title>
      <circle cx='8' cy='8' r='6.5' />
      <path d='M1.5 8h13M8 1.5c2.2 2 2.2 11 0 13M8 1.5c-2.2 2-2.2 11 0 13' />
    </svg>
  ),
}

const FALLBACK = (props: IconProps) => (
  <svg {...BASE} {...props}>
    <title>?</title>
    <circle cx='8' cy='8' r='2' fill='currentColor' stroke='none' />
  </svg>
)

export function EnvironmentIcon({ env, className }: { env: string; className?: string }) {
  const Render = ICONS[env] ?? FALLBACK
  return <Render className={className} />
}

export function environmentLabel(env: string): string {
  return env.charAt(0).toUpperCase() + env.slice(1)
}
