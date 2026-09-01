// lib/tokens.tsx
//
// Renders the inline `$type:value$` / `$type:a|b|c|d$` syntax used in
// premise, sections, checks, and dm_notes. A single value never changes
// with the level slider (unique creatures, named spells). A piped list is
// read positionally against the current tier index.

import type { ReactNode } from 'react'
import { evalFormula } from '@/lib/formula'
import { TIERS, tierIndexForLevel } from './tiers'

const TOKEN_RE = /\$(monster|spell|dc|gp|scale|formula):([^$]+)\$/g

const STYLE: Record<string, string> = {
  monster: 'text-danger border-b border-dotted border-danger/50',
  dc: 'font-mono text-accent',
  gp: 'font-mono text-caution',
  spell: 'italic text-safe font-medium',
  scale: 'font-medium',
  formula: 'border-b border-dotted',
}

function formatValue(kind: string, raw: string): string {
  if (kind === 'gp' && /^\d+$/.test(raw)) {
    return `${Number(raw).toLocaleString()} gp`
  }
  return raw
}

export function renderTokens(text: string, partyLevel: number): ReactNode[] {
  const tierIndex = tierIndexForLevel(partyLevel)
  const nodes: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  TOKEN_RE.lastIndex = 0
  // biome-ignore lint/suspicious/noAssignInExpressions: idc
  while ((match = TOKEN_RE.exec(text))) {
    const [full, kind, body] = match
    if (match.index > last) nodes.push(text.slice(last, match.index))

    const className = STYLE[kind] ?? ''

    if (kind === 'formula') {
      let display: string
      try {
        display = String(evalFormula(body, partyLevel))
      } catch (err) {
        // Fails loud in the UI rather than silently, so a typo in the
        // YAML gets noticed during prep instead of at the table.
        display = `⚠ ${(err as Error).message}`
      }
      nodes.push(
        <span key={key++} className={className} title={`DC formula: ${body.trim()}`}>
          {display}
        </span>
      )
      last = match.index + full.length
      continue
    }

    const options = body.split('|').map(s => s.trim())
    const resolved = options[Math.min(tierIndex, options.length - 1)]

    if (options.length > 1) {
      const title = options
        .map((opt, i) => `${TIERS[i]?.label ?? `Tier ${i + 1}`}: ${formatValue(kind, opt)}`)
        .join('\n')
      nodes.push(
        <span key={key++} className={className} title={title}>
          {formatValue(kind, resolved)}
        </span>
      )
    } else {
      nodes.push(
        <span key={key++} className={className}>
          {formatValue(kind, resolved)}
        </span>
      )
    }
    last = match.index + full.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}
