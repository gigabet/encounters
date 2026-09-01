// lib/search.ts
//
// The old search only looked at title/pitch/genre/creature_type/tags/
// environment. This flattens *everything* searchable on an encounter —
// premise, section bodies, examples, check text, dm_notes — into one
// lowercase string per encounter, so a search for e.g. "petrif" or
// "shadowfell" finds encounters that only mention it in the fine print.

import type { Encounter } from '@/types/encounters'

// $type:value$ / $type:a|b|c|d$ tokens shouldn't leak their sigils into the
// search index, but the words inside them should still be searchable.
const TOKEN_RE = /\$(?:monster|spell|dc|gp|scale|formula):([^$]+)\$/g

function stripTokens(text: string): string {
  return text.replace(TOKEN_RE, (_match, body: string) => body.split('|').join(' '))
}

export function buildHaystack(e: Encounter): string {
  const parts: string[] = [e.title, e.category, e.pitch, e.premise, e.dm_notes ?? '']

  parts.push(...e.genre, ...(e.creature_type ?? []), ...e.tags, ...e.environment)

  for (const section of e.sections) {
    parts.push(section.title, section.description)
    if (section.examples) parts.push(...section.examples)
  }

  for (const check of e.checks) {
    parts.push(check.check, check.detail)
  }

  return stripTokens(parts.join(' \u0000 ')).toLowerCase()
}

/** Precomputed id -> haystack lookup for a full encounter list. */
export function buildHaystackIndex(encounters: Encounter[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const e of encounters) map.set(e.id, buildHaystack(e))
  return map
}
