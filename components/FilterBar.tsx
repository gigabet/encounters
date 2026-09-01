'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { THREAT_STYLE } from '@/lib/badges'
import { MAX_LEVEL, MIN_LEVEL, TIERS, tierIndexForLevel } from '@/lib/tiers'
import type { Category, Pillar, Threat } from '@/types/encounters'

export interface Filters {
  search: string
  partyLevel: number
  category: Category | 'all'
  pillars: Set<Pillar>
  threat: Set<Threat>
  environment: Set<string>
}

const CATEGORIES: Category[] = ['Location', 'NPC', 'Object', 'Phenomenon']
const PILLARS: Pillar[] = ['exploration', 'social', 'combat']
const THREATS: Threat[] = ['safe', 'nuisance', 'deadly']

function FacetLabel({ children }: { children: ReactNode }) {
  return <p className='text-ink-muted mb-1.5 text-xs'>{children}</p>
}

function ToggleGroup<T extends string>({
  options,
  active,
  onToggle,
  render,
}: {
  options: T[]
  active: Set<T>
  onToggle: (v: T) => void
  render?: (v: T) => ReactNode
}) {
  return (
    <div className='flex flex-wrap gap-1.5'>
      {options.map(opt => {
        const isActive = active.has(opt)
        return (
          <button
            type='button'
            key={opt}
            onClick={() => onToggle(opt)}
            aria-pressed={isActive}
            className={`rounded-sm border px-2 py-1 text-xs transition-colors ${
              isActive
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-ink-muted hover:border-ink-muted hover:text-ink'
            }`}
          >
            {render ? render(opt) : opt}
          </button>
        )
      })}
    </div>
  )
}

// Vertical stack meant for a sidebar column. The parent decides whether
// that column is always-visible (desktop) or toggled behind a button
// (mobile) — this component just renders the controls.
export function FilterBar({
  filters,
  setFilters,
  environments,
}: {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  environments: string[]
}) {
  const toggleIn = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set)
    next.has(value) ? next.delete(value) : next.add(value)
    return next
  }

  const tier = TIERS[tierIndexForLevel(filters.partyLevel)]

  return (
    <div className='space-y-5'>
      <input
        type='text'
        placeholder='Search title, pitch, tags…'
        value={filters.search}
        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        className='border-border bg-surface text-ink placeholder:text-ink-muted/60 focus:border-accent w-full border px-3 py-1.5 text-sm focus:outline-none'
      />

      <div>
        <div className='text-ink-muted mb-1.5 flex items-baseline justify-between text-xs'>
          <span>Party level</span>
          <span className='text-accent font-mono'>
            {filters.partyLevel} · {tier.label}
          </span>
        </div>
        <input
          type='range'
          min={MIN_LEVEL}
          max={MAX_LEVEL}
          value={filters.partyLevel}
          onChange={e => setFilters(f => ({ ...f, partyLevel: Number(e.target.value) }))}
          className='accent-accent w-full'
        />
        <p className='text-ink-muted mt-1 text-[11px]'>
          {tier.min}–{tier.max}
        </p>
      </div>

      <div>
        <FacetLabel>Terrain</FacetLabel>
        <ToggleGroup
          options={environments}
          active={filters.environment}
          onToggle={v =>
            setFilters(f => ({
              ...f,
              environment: toggleIn(f.environment, v),
            }))
          }
        />
      </div>

      <div>
        <FacetLabel>Category</FacetLabel>
        <div className='flex flex-wrap gap-1.5'>
          {(['all', ...CATEGORIES] as const).map(c => (
            <button
              type='button'
              key={c}
              onClick={() => setFilters(f => ({ ...f, category: c }))}
              aria-pressed={filters.category === c}
              className={`rounded-sm border px-2 py-1 text-xs transition-colors ${
                filters.category === c
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-ink-muted hover:border-ink-muted hover:text-ink'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FacetLabel>Pillar</FacetLabel>
        <ToggleGroup
          options={PILLARS}
          active={filters.pillars}
          onToggle={v => setFilters(f => ({ ...f, pillars: toggleIn(f.pillars, v) }))}
        />
      </div>

      <div>
        <FacetLabel>Danger</FacetLabel>
        <ToggleGroup
          options={THREATS}
          active={filters.threat}
          onToggle={v => setFilters(f => ({ ...f, threat: toggleIn(f.threat, v) }))}
          render={v => (
            <span className='inline-flex items-center gap-1.5'>
              <span className={`h-1.5 w-1.5 rounded-full ${THREAT_STYLE[v].dot}`} />
              {THREAT_STYLE[v].label}
            </span>
          )}
        />
      </div>
    </div>
  )
}
