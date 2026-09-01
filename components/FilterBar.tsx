'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { THREAT_STYLE } from '@/lib/badges'
import { MAX_LEVEL, MIN_LEVEL, TIERS, tierIndexForLevel } from '@/lib/tiers'
import type { Genre, Pillar, Threat } from '@/types/encounters'
import { ComboboxFilter } from './ComboboxFilter'

export interface Filters {
  search: string
  partyLevel: number
  pillars: Set<Pillar>
  threat: Set<Threat>
  environment: Set<string>
  genre: Set<string>
  tags: Set<string>
}

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
  tags,
  genres,
}: {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  environments: string[]
  tags: string[]
  genres: string[]
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
        placeholder='Search everything…'
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

      <div>
        <ComboboxFilter
          label='Terrain'
          placeholder='Search terrain…'
          options={environments}
          selected={filters.environment}
          onChange={next => setFilters(f => ({ ...f, environment: next }))}
        />
      </div>

      <div>
        <ComboboxFilter
          label='Genre'
          placeholder='Search genres…'
          options={genres}
          selected={filters.genre}
          onChange={next => setFilters(f => ({ ...f, genre: next }))}
        />
      </div>

      {/* Every tag in the corpus, searchable — same underlying selection a
          keyword click on a card toggles, so the field and the cards stay
          in sync no matter which side you filter from. */}
      {tags.length > 0 && (
        <div>
          <ComboboxFilter
            label='Tags'
            placeholder='Search tags…'
            options={tags}
            selected={filters.tags}
            onChange={next => setFilters(f => ({ ...f, tags: next }))}
          />
        </div>
      )}
    </div>
  )
}
