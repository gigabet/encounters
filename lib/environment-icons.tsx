// lib/environment-icons.tsx
//
// Quiet little glyphs for the environment tags, meant to sit tucked into a
// card's header rather than compete with the title or the search/filter
// UI. Unmapped environment strings (a new terrain added to the YAML)
// still render — as a plain dot — instead of breaking.

import type { JSX, SVGProps } from 'react'
import { BsSnow } from 'react-icons/bs'
import { GiHighGrass, GiHills, GiHouse, GiIsland, GiSwamp, GiUndergroundCave } from 'react-icons/gi'
import { MdForest } from 'react-icons/md'
import { PiCactusFill, PiMountainsFill } from 'react-icons/pi'
import { SlGlobe } from 'react-icons/sl'

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
  forest: props => <MdForest {...props} />,
  grassland: props => <GiHighGrass {...props} />,
  hill: props => <GiHills {...props} />,
  mountain: props => <PiMountainsFill {...props} />,
  desert: props => <PiCactusFill {...props} />,
  swamp: props => <GiSwamp {...props} />,
  underdark: props => <GiUndergroundCave {...props} />,
  arctic: props => <BsSnow {...props} />,
  urban: props => <GiHouse {...props} />,
  coastal: props => <GiIsland {...props} />,
  any: props => <SlGlobe {...props} />,
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
