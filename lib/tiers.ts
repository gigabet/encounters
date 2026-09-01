// lib/tiers.ts
//
// Your encounters.yaml doesn't currently define `tiers` as data (and
// encounters.d.ts has no matching field), so this is hardcoded to match the
// 4-band scheme implied by the `$monster:a|b|c|d$` / `$dc:a|b|c|d$` syntax
// in the source file. If you ever add a `tiers:` block to the YAML, delete
// this and derive TIERS from `getEncounters().tiers` instead — single
// source of truth beats a second hardcoded copy.

export interface Tier {
  label: string
  min: number
  max: number
}

export const TIERS: Tier[] = [
  { label: 'Tier 1', min: 1, max: 4 },
  { label: 'Tier 2', min: 5, max: 10 },
  { label: 'Tier 3', min: 11, max: 16 },
  { label: 'Tier 4', min: 17, max: 20 },
]

export const MIN_LEVEL = TIERS[0].min
export const MAX_LEVEL = TIERS[TIERS.length - 1].max

/** Party level (1-20) -> tier index (0-3). */
export function tierIndexForLevel(level: number): number {
  const idx = TIERS.findIndex((t) => level >= t.min && level <= t.max)
  return idx === -1 ? TIERS.length - 1 : idx
}
