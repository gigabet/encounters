// lib/tokens.tsx
//
// Renders the inline `$type:value$` / `$type:a|b|c|d$` syntax used in
// premise, sections, checks, and dm_notes. A single value never changes
// with the level slider (unique creatures, named spells). A piped list is
// read positionally against the current tier index.

import type { ReactNode } from 'react'
import * as link from '@/data/gameplay'
import { evalFormula } from '@/lib/formula'
import { TIERS, tierIndexForLevel } from './tiers'

const TOKEN_RE = /\$(monster|spell|dc|gp|scale|formula):([^$]+)\$/g

const STYLE: Record<string, string> = {
  monster: 'text-danger border-b border-dotted border-danger/50 hover:border-solid cursor-pointer',
  dc: 'font-mono text-accent',
  gp: 'text-caution',
  spell: 'text-safe font-medium hover:border-b border-safe/50 cursor-pointer',
  scale: 'font-medium',
  formula: 'border-b border-dotted',
}

function formatValue(kind: string, raw: string): string {
  if (kind === 'gp' && /^\d+$/.test(raw)) {
    return `${Number(raw).toLocaleString()} gp`
  }
  return raw
    .split('_')
    .map(e => `${e[0].toLocaleUpperCase()}${e.substring(1)}`)
    .join(' ')
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
    let title: string | undefined

    if (options.length > 1) {
      title = options
        .map((opt, i) => `${TIERS[i]?.label ?? `Tier ${i + 1}`}: ${formatValue(kind, opt)}`)
        .join('\n')
    }

    if (kind === 'monster' || kind === 'spell')
      nodes.push(
        <a
          key={key++}
          // @ts-expect-error
          // biome-ignore lint/performance/noDynamicNamespaceImportAccess: false positive
          href={link[kind]?.[resolved]?.href}
          className={className}
          title={title}
          target='_blank'
        >
          {/* biome-ignore lint/performance/noDynamicNamespaceImportAccess: false positive
          @ts-expect-error */}
          {link[kind]?.[resolved]?.name}
        </a>
      )
    else
      nodes.push(
        <span key={key++} className={className} title={title}>
          {formatValue(kind, resolved)}
        </span>
      )

    last = match.index + full.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}
