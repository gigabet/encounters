'use client'

import { useMemo, useState } from 'react'
import { THREAT_STYLE } from '@/lib/badges'
import { buildHaystackIndex } from '@/lib/search'
import type { Encounter } from '@/types/encounters'
import { EncounterCard } from './EncounterCard'
import { FilterBar, type Filters } from './FilterBar'
import { ThemeToggle } from './ThemeToggle'

const DEFAULT_FILTERS: Filters = {
  search: '',
  partyLevel: 5,
  pillars: new Set(),
  threat: new Set(),
  environment: new Set(),
  tags: new Set(),
}

const THREAT_LEGEND = [
  { key: 'safe', note: 'no inherent danger' },
  { key: 'nuisance', note: 'can injure, curse, or cost time/resources' },
  { key: 'deadly', note: 'can kill or remove from play' },
] as const

function activeFilterCount(f: Filters): number {
  return f.pillars.size + f.threat.size + f.environment.size + f.tags.size
}

export function EncounterBrowser({
  encounters,
  initialDark,
}: {
  encounters: Encounter[]
  initialDark: boolean
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const environments = useMemo(() => {
    const set = new Set<string>()
    for (const e of encounters) for (const env of e.environment) if (env !== 'any') set.add(env)
    return Array.from(set).sort()
  }, [encounters])

  // Every tag + creature_type across the corpus, for a tag cloud that's
  // always visible rather than only appearing once something's selected.
  const tags = useMemo(() => {
    const set = new Set<string>()
    for (const e of encounters) {
      for (const t of e.tags) set.add(t)
      for (const c of e.creature_type ?? []) set.add(c)
    }
    return Array.from(set).sort()
  }, [encounters])

  // Full-corpus search index (premise, section bodies, checks, dm_notes —
  // not just title/tags), rebuilt only when the encounter list changes.
  const haystacks = useMemo(() => buildHaystackIndex(encounters), [encounters])

  const toggleTag = (tag: string) => {
    setFilters(f => {
      const next = new Set(f.tags)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return { ...f, tags: next }
    })
  }

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return encounters
      .filter(e => {
        if (filters.pillars.size > 0 && !e.pillars.some(p => filters.pillars.has(p))) return false
        if (filters.threat.size > 0 && !filters.threat.has(e.threat)) return false
        if (
          filters.environment.size > 0 &&
          !e.environment.includes('any') &&
          !e.environment.some(env => filters.environment.has(env))
        )
          return false
        if (filters.tags.size > 0) {
          const keywords = new Set([...(e.creature_type ?? []), ...e.tags])
          if (![...filters.tags].some(tag => keywords.has(tag))) return false
        }
        if (q && !(haystacks.get(e.id) ?? '').includes(q)) return false
        return true
      })
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [encounters, filters, haystacks])

  const activeCount = activeFilterCount(filters)

  return (
    <div className='mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:flex lg:max-w-6xl lg:items-start lg:gap-12'>
      {/* Mobile filter toggle */}
      <div className='mb-4 lg:hidden'>
        <button
          type='button'
          onClick={() => setMobileFiltersOpen(v => !v)}
          className='border-border bg-surface text-ink flex w-full items-center justify-between border px-4 py-2.5 text-sm'
          aria-expanded={mobileFiltersOpen}
        >
          <span>
            Filters
            {activeCount > 0 && <span className='text-accent ml-2'>({activeCount})</span>}
          </span>
          <span aria-hidden className='text-ink-muted'>
            {mobileFiltersOpen ? '−' : '+'}
          </span>
        </button>
        {mobileFiltersOpen && (
          <div className='border-border bg-surface border border-t-0 p-4'>
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              environments={environments}
              tags={tags}
            />
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className='hidden scrollbar-thin lg:sticky lg:top-8 lg:block lg:max-h-[calc(100vh-4rem)] lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:pr-3'>
        <h2 className='font-display text-ink mb-4 text-lg'>Filters</h2>
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          environments={environments}
          tags={tags}
        />
      </aside>

      {/* Main content */}
      <div className='min-w-0 flex-1'>
        <header className='mb-8'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-ink-muted font-mono text-[11px] tracking-[0.2em] uppercase'>
                Hexcrawl Catalogue
              </p>
              <h1 className='font-display text-ink mt-1 text-3xl tracking-tight'>
                Supernatural Encounters
              </h1>
              <p className='text-ink-muted mt-1 text-sm'>
                {filtered.length} {filtered.length === 1 ? 'encounter' : 'encounters'} · select
                party level to scale
              </p>
            </div>
            <ThemeToggle initialDark={initialDark} />
          </div>

          <dl className='border-border text-ink-muted mt-5 flex flex-wrap gap-x-6 gap-y-1.5 border-t pt-3 text-[11px]'>
            <div className='flex items-baseline gap-1.5'>
              <dt className='text-ink font-mono'>DC:</dt>
              <dd>12 + half the party's average level</dd>
            </div>
            <div className='flex items-baseline gap-1.5'>
              <dt className='text-ink'>Ability to cast:</dt>
              <dd>knows the spell or has prepared it before</dd>
            </div>
            {THREAT_LEGEND.map(({ key, note }) => (
              <div key={key} className='flex items-center gap-1.5'>
                <span className={`h-1.5 w-1.5 rounded-full ${THREAT_STYLE[key].dot}`} />
                <dt className={THREAT_STYLE[key].text}>{THREAT_STYLE[key].label}</dt>
                <dd>— {note}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div>
          {filtered.map(e => (
            <EncounterCard
              key={e.id}
              encounter={e}
              partyLevel={filters.partyLevel}
              activeTags={filters.tags}
              onToggleTag={toggleTag}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className='text-ink-muted mt-12 text-center text-sm'>
            Nothing matches those filters. Try clearing a few.
          </p>
        )}
      </div>
    </div>
  )
}
