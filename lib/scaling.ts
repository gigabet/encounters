// lib/scaling.ts
//
// Print reference sheets don't have a level slider, so instead of picking
// one tier's value (screen) or a wall of "T1 x T2 y T3 z T4 w" chips
// (early print attempt — hard to parse), each printed card gets a single
// "Scaling" block listing the full progression once. Inline prose then
// just uses the lowest-tier option so sentences stay readable.
//
// $formula:...$ tokens are deliberately excluded here: they resolve to a
// single continuous expression of level (e.g. "12 + half party level"),
// not four discrete tier values, so the inline rendering in tokens-print
// already says the whole thing — repeating it under Scaling was pure
// duplication (same string, twice, per card).

import * as link from '@/data/gameplay'
import type { Encounter } from '@/types/encounters'

const TOKEN_RE = /\$(monster|spell|dc|gp|scale):([^$]+)\$/g

export interface ScalingEntry {
  key: string
  label: string
  value: string
}

function formatValue(kind: string, raw: string): string {
  if (kind === 'gp' && /^\d+$/.test(raw)) return `${Number(raw).toLocaleString()} gp`
  return raw
    .split('_')
    .map(e => `${e[0].toLocaleUpperCase()}${e.substring(1)}`)
    .join(' ')
}

function resolveName(kind: string, value: string): string {
  if (kind === 'monster' || kind === 'spell') {
    // @ts-expect-error
    // biome-ignore lint/performance/noDynamicNamespaceImportAccess: false positive
    return link[kind]?.[value]?.name ?? formatValue(kind, value)
  }
  return formatValue(kind, value)
}

const KIND_LABEL: Record<string, string> = {
  monster: 'Monsters',
  spell: 'Spells',
  gp: 'Treasure',
  scale: 'Spell level',
}

/** "12+floor(level/2)" -> "12 + half party level". Exported for inline use
 *  in tokens-print; only the exact shape used throughout encounters.yaml
 *  is special-cased for a clean phrase, anything else falls back to a
 *  readable-but-literal substitution. */
export function describeFormula(expr: string): string {
  const s = expr.replace(/\s+/g, '')
  const m = s.match(/^(\d+)\+floor\(level\/2\)$/)
  if (m) return `${m[1]} + half party level`
  return expr.replace(/floor\(([^)]+)\)/g, '⌊$1⌋').replace(/level/g, 'party level')
}

/** Every multi-value token used anywhere on the encounter, deduped by
 *  kind+options so a `$monster:a|b|c|d$` repeated 3x in one premise (like
 *  Black Lake) only produces one Scaling line, not three. Formula tokens
 *  are excluded — see file header. */
export function collectScalingEntries(e: Encounter): ScalingEntry[] {
  const text = [
    e.premise,
    ...e.sections.flatMap(s => [s.description, ...(s.examples ?? [])]),
    ...e.checks.flatMap(c => [c.check, c.detail]),
    e.dm_notes ?? '',
  ].join(' \u0000 ')

  const seen = new Map<string, ScalingEntry>()
  let match: RegExpExecArray | null
  TOKEN_RE.lastIndex = 0
  // biome-ignore lint/suspicious/noAssignInExpressions: mirrors renderTokens
  while ((match = TOKEN_RE.exec(text))) {
    const [, kind, body] = match
    const options = body.split('|').map(s => s.trim())
    if (options.length < 2) continue // single value, nothing to scale

    const key = `${kind}:${body}`
    if (seen.has(key)) continue

    const label = KIND_LABEL[kind] ?? kind
    const value =
      kind === 'monster' || kind === 'spell'
        ? options.map(o => resolveName(kind, o)).join(', ')
        : options.map(o => formatValue(kind, o)).join(' / ')

    seen.set(key, { key, label, value })
  }

  return Array.from(seen.values())
}
