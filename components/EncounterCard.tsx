'use client'

import { useState } from 'react'
import { PREP_STYLE, THREAT_STYLE } from '@/lib/badges'
import { renderTokens } from '@/lib/tokens'
import type { Encounter } from '@/types/encounters'

function PrepDots({ effort }: { effort: number }) {
  return (
    <span className='font-light'>Effort:</span>
    // <span className='inline-flex items-center gap-0.5 align-middle' aria-hidden>
    //   {[1, 2, 3].map(n => (
    //     <span
    //       key={n}
    //       className={`h-1.5 w-1.5 rounded-full ${n <= effort ? 'bg-ink-muted' : 'bg-border'}`}
    //     />
    //   ))}
    // </span>
  )
}

export function EncounterCard({
  encounter,
  partyLevel,
}: {
  encounter: Encounter
  partyLevel: number
}) {
  const [open, setOpen] = useState(false)
  const threat = THREAT_STYLE[encounter.threat]
  const prep = PREP_STYLE[encounter.prep]

  return (
    <article className='border-border border-b py-8 first:pt-0'>
      <button
        type='button'
        onClick={() => setOpen(v => !v)}
        className='flex w-full flex-col gap-2 text-left'
      >
        <h3 className='font-display text-ink text-2xl leading-tight'>{encounter.title}</h3>

        <p className='text-ink-muted text-sm italic'>
          {encounter.category}
          {encounter.genre.length > 0 && <> — {encounter.genre.sort().join(', ')}</>}
        </p>

        <p className='text-ink max-w-2xl text-[15px] leading-snug'>
          {renderTokens(encounter.pitch, partyLevel)}
        </p>

        <div className='text-ink-muted mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
          <span className={`inline-flex items-center gap-1.5 ${threat.text}`}>
            <span className={`h-2 w-2 rounded-full ${threat.dot}`} />
            {threat.label}
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <PrepDots effort={prep.effort} />
            {prep.label}
          </span>
          {encounter.pillars.length > 0 && <span>{encounter.pillars.join(', ')}</span>}
        </div>
      </button>

      {open && (
        <div className='mt-6 text-sm lg:grid lg:grid-cols-3 lg:gap-10'>
          {/* Content column */}
          <div className='flex flex-col gap-5 lg:col-span-2'>
            <p className='border-border text-ink border-l pl-4 leading-relaxed italic'>
              {renderTokens(encounter.premise, partyLevel)}
            </p>

            {encounter.sections.map(s => (
              <div key={s.title}>
                <h4 className='font-display text-ink mb-1 text-base'>{s.title}</h4>
                <p className='text-ink-muted leading-relaxed'>
                  {renderTokens(s.description, partyLevel)}
                </p>
                {s.examples && s.examples.length > 0 && (
                  <ul className='border-border mt-2 space-y-1 border-l pl-4'>
                    <div className='text-xs font-medium'>Examples</div>
                    {s.examples.map((ex, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: .
                      <li key={i} className='text-ink-muted'>
                        {renderTokens(ex, partyLevel)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className='mt-auto'>
              <h4 className='text-ink-muted mb-1.5 text-xs'>Keywords</h4>
              <p className='text-ink-muted text-xs leading-relaxed'>
                {[...(encounter.creature_type ?? []), ...encounter.tags].join(', ')}
              </p>
            </div>
          </div>

          {/* Reference rail */}
          <div className='lg:border-border mt-6 flex flex-col space-y-5 lg:mt-0 lg:border-l lg:pl-8'>
            {encounter.checks.length > 0 && (
              <div>
                <h4 className='text-ink-muted mb-2 text-xs'>Checks &amp; Clues</h4>
                <dl className='space-y-4'>
                  {encounter.checks.map((c, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: .
                    <div key={i}>
                      <dt className='text-ink font-mono text-xs'>
                        {renderTokens(c.check, partyLevel)}
                      </dt>
                      <dd className='text-ink-muted mt-0.5'>
                        {renderTokens(c.detail, partyLevel)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {encounter.dm_notes && (
              <div className='mt-auto'>
                <h4 className='text-ink-muted mb-1.5 text-xs'>DM notes</h4>
                <p className='text-ink-muted'>{encounter.dm_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
