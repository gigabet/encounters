// lib/badges.ts
import type { Prep, Threat } from '@/types/encounters'

export const THREAT_STYLE: Record<Threat, { label: string; dot: string; text: string }> = {
  safe: { label: 'Safe', dot: 'bg-safe', text: 'text-safe' },
  nuisance: { label: 'Nuisance', dot: 'bg-caution', text: 'text-caution' },
  deadly: { label: 'Deadly', dot: 'bg-danger', text: 'text-danger' },
}

// Prep effort rendered as filled/empty dots rather than another text label.
export const PREP_STYLE: Record<Prep, { label: string; effort: number }> = {
  'drop-in': { label: 'Drop-in', effort: 1 },
  short: { label: 'Short', effort: 2 },
  quest: { label: 'Quest', effort: 3 },
}
