// components/EncounterPrintCardFull.tsx
//
// Full-page single-encounter layout. Previously used CSS Grid for a
// content/rail split (mirroring the on-screen card), but Grid tracks
// don't fragment reliably across a print page break — browsers anchor a
// grid row to whichever page it started on, which orphaned the rail
// (DM notes floating alone on page 2, no checks, no scaling). Switched to
// a single flowing column instead, which paginates correctly — same
// approach as the compact card, just at full-page type size.
//
// "Full width" here means the *page* is full width, not that body text
// stretches edge to edge — text is centered in a constrained measure so
// it stays readable, same as a book page has margins.

import { PREP_STYLE, THREAT_STYLE } from '@/lib/badges'
import { environmentLabel } from '@/lib/environment-icons'
import { collectScalingEntries } from '@/lib/scaling'
import { renderTokensPrint } from '@/lib/tokens-print'
import type { Encounter } from '@/types/encounters'

export function EncounterPrintCardFull({ encounter }: { encounter: Encounter }) {
  const threat = THREAT_STYLE[encounter.threat]
  const prep = PREP_STYLE[encounter.prep]
  const envList = encounter.environment.includes('any') ? ['any'] : encounter.environment
  const keywords = [...(encounter.creature_type ?? []), ...encounter.tags].sort()
  const scaling = collectScalingEntries(encounter)

  return (
    <div className='print-page mx-auto max-w-2xl text-[14px] leading-[1.55]'>
      <h2 className='print-keep font-display text-ink text-2xl leading-tight'>{encounter.title}</h2>
      <p className='text-ink-muted mt-1 text-[12.5px] italic'>
        {encounter.category}
        {encounter.genre.length > 0 && <> — {[...encounter.genre].sort().join(', ')}</>}
        {' · '}
        {envList.map(environmentLabel).join(', ')}
      </p>

      <div className='text-ink-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]'>
        <span className={`inline-flex items-center gap-1.5 ${threat.text}`}>
          <span className={`h-2 w-2 rounded-full ${threat.dot}`} />
          {threat.label}
        </span>
        <span>Prep: {prep.label}</span>
        {encounter.pillars.length > 0 && <span>{encounter.pillars.join(', ')}</span>}
      </div>

      <p className='print-keep text-ink mt-3 leading-snug font-medium'>
        {renderTokensPrint(encounter.pitch)}
      </p>

      <p className='border-border text-ink-muted mt-4 border-l-2 pl-4 leading-relaxed italic'>
        {renderTokensPrint(encounter.premise)}
      </p>

      <div className='mt-4 flex flex-col gap-4'>
        {encounter.sections.map(s => (
          <div key={s.title} className='print-keep-head'>
            <h4 className='font-display text-ink text-base font-semibold'>{s.title}</h4>
            <p className='text-ink-muted mt-0.5 leading-snug'>{renderTokensPrint(s.description)}</p>
            {s.examples && s.examples.length > 0 && (
              <ul className='border-border mt-1.5 space-y-1 border-l pl-4 text-[13px]'>
                {s.examples.map((ex, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static print list
                  <li key={i} className='text-ink-muted'>
                    {renderTokensPrint(ex)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Tinted reference block — same treatment as the compact card, so
          "this is lookup data" reads distinctly from the narrative prose
          above it, and dt/dd sit on one line instead of stacking into
          their own oversized paragraphs. */}
      {(encounter.checks.length > 0 || scaling.length > 0) && (
        <div className='bg-surface/60 border-border mt-4 space-y-3 border px-4 py-3'>
          {encounter.checks.length > 0 && (
            <div>
              <h4 className='text-ink-muted text-[11px] font-semibold tracking-wider uppercase'>
                Checks &amp; Clues
              </h4>
              <dl className='mt-1.5 space-y-1.5'>
                {encounter.checks.map((c, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static print list
                  <div key={i} className='print-keep text-[13px] leading-snug'>
                    <dt className='text-ink inline font-mono text-[12px]'>
                      {renderTokensPrint(c.check)}
                    </dt>
                    <dd className='text-ink-muted inline'>
                      {' — '}
                      {renderTokensPrint(c.detail)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {scaling.length > 0 && (
            <div className='print-keep'>
              <h4 className='text-ink-muted text-[11px] font-semibold tracking-wider uppercase'>
                Scaling
              </h4>
              <dl className='mt-1.5 space-y-1 text-[13px] leading-snug'>
                {scaling.map(s => (
                  <div key={s.key}>
                    <dt className='text-ink inline font-medium'>{s.label}:</dt>{' '}
                    <dd className='text-ink-muted inline'>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}

      {keywords.length > 0 && (
        <div className='print-keep mt-4 flex flex-wrap gap-1.5 text-[11px]'>
          {keywords.map(kw => (
            <span key={kw} className='border-border text-ink-muted rounded-sm border px-2 py-0.5'>
              {kw}
            </span>
          ))}
        </div>
      )}

      {encounter.dm_notes && (
        <p className='print-keep text-ink-muted mt-3 text-[12.5px] leading-snug'>
          <span className='text-ink font-medium'>DM notes: </span>
          {encounter.dm_notes}
        </p>
      )}
    </div>
  )
}
