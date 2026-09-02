// lib/tokens-print.tsx
//
// Print/PDF inline renderer. The interactive version resolves each
// $type:a|b|c|d$ token against the party-level slider; print has no
// slider, and printing all four tiers inline (an earlier attempt) reads
// as noise. This renders the lowest-tier option only, so prose stays
// readable, and pushes the full progression to the per-card "Scaling"
// block (lib/scaling.ts) that a DM checks once, the same way they'd
// already check a monster's CR in the manual.

import type { ReactNode } from 'react'
import * as link from '@/data/gameplay'
import { describeFormula } from '@/lib/scaling'

const TOKEN_RE = /\$(monster|spell|dc|gp|scale|formula):([^$]+)\$/g

const STYLE: Record<string, string> = {
  monster: 'text-danger',
  dc: 'font-mono text-accent',
  gp: 'text-caution',
  spell: 'text-safe font-medium',
  scale: 'font-medium',
  formula: 'border-b border-dotted',
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

export function renderTokensPrint(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  TOKEN_RE.lastIndex = 0
  // biome-ignore lint/suspicious/noAssignInExpressions: mirrors renderTokens
  while ((match = TOKEN_RE.exec(text))) {
    const [full, kind, body] = match
    if (match.index > last) nodes.push(text.slice(last, match.index))

    const className = STYLE[kind] ?? ''

    if (kind === 'formula') {
      nodes.push(
        <span key={key++} className={className} title='Full progression under Scaling'>
          {describeFormula(body)}
        </span>
      )
      last = match.index + full.length
      continue
    }

    const first = body.split('|')[0].trim()

    if (kind === 'monster' || kind === 'spell')
      nodes.push(
        <a
          key={key++}
          // @ts-expect-error
          // biome-ignore lint/performance/noDynamicNamespaceImportAccess: false positive
          href={link[kind]?.[first]?.href}
          className={className}
        >
          {resolveName(kind, first)}
        </a>
      )
    else
      nodes.push(
        <span key={key++} className={className}>
          {formatValue(kind, first)}
        </span>
      )

    last = match.index + full.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}
