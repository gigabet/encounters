// components/EncounterPrintCard.tsx
import { PREP_STYLE, THREAT_STYLE } from '@/lib/badges'
import { environmentLabel } from '@/lib/environment-icons'
import { collectScalingEntries } from '@/lib/scaling'
import { renderTokensPrint } from '@/lib/tokens-print'
import type { Encounter } from '@/types/encounters'

export function EncounterPrintCard({ encounter }: { encounter: Encounter }) {
  const threat = THREAT_STYLE[encounter.threat]
  const prep = PREP_STYLE[encounter.prep]
  const envList = encounter.environment.includes('any') ? ['any'] : encounter.environment
  const keywords = [...(encounter.creature_type ?? []), ...encounter.tags].sort()
  const scaling = collectScalingEntries(encounter)

  return (
    // No break-inside:avoid here — a card longer than one column/page (Jester,
    // Devil's Bargain) needs somewhere to split. What must NOT split are the
    // small units below (a heading orphaned from its text, a single check
    // pulled apart from its answer, the keyword row cut mid-line).
    <article className='border-border mb-6 border-b pb-6 text-[13.5px] leading-[1.55] last:border-b-0'>
      <h3 className='print-keep font-display text-ink text-xl leading-tight'>{encounter.title}</h3>

      <p className='text-ink-muted mt-0.5 text-[11.5px] italic'>
        {encounter.category}
        {encounter.genre.length > 0 && <> — {[...encounter.genre].sort().join(', ')}</>}
        {' · '}
        {envList.map(environmentLabel).join(', ')}
      </p>

      <div className='text-ink-muted mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]'>
        <span className={`inline-flex items-center gap-1 ${threat.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${threat.dot}`} />
          {threat.label}
        </span>
        <span>Prep: {prep.label}</span>
        {encounter.pillars.length > 0 && <span>{encounter.pillars.join(', ')}</span>}
      </div>

      <p className='print-keep text-ink mt-2 leading-snug font-medium'>
        {renderTokensPrint(encounter.pitch)}
      </p>

      <p className='border-border text-ink-muted mt-3 border-l-2 pl-3 leading-relaxed italic'>
        {renderTokensPrint(encounter.premise)}
      </p>

      <div className='mt-3 flex flex-col gap-3'>
        {encounter.sections.map(s => (
          <div key={s.title} className='print-keep-head'>
            <h4 className='font-display text-ink text-[13px] font-semibold'>{s.title}</h4>
            <p className='text-ink-muted mt-0.5 leading-snug'>{renderTokensPrint(s.description)}</p>
            {s.examples && s.examples.length > 0 && (
              <ul className='border-border mt-1.5 space-y-0.5 border-l pl-3 text-[12px]'>
                <div className='mb-1.5 text-[10px] font-medium'>Examples:</div>
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

      {/* Mechanical reference data (checks, scaling) gets a distinct tinted
          block instead of another same-weight heading, so it reads as "look
          this up" rather than continuing the narrative flow. */}
      {(encounter.checks.length > 0 || scaling.length > 0) && (
        <div className='bg-surface/60 border-border mt-3 space-y-2.5 border px-3 py-2.5'>
          {encounter.checks.length > 0 && (
            <div>
              <h4 className='text-ink-muted text-[10px] font-semibold tracking-wider uppercase'>
                Checks &amp; Clues
              </h4>
              <dl className='mt-1 space-y-1'>
                {encounter.checks.map((c, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static print list
                  <div key={i} className='print-keep text-[12px] leading-snug'>
                    <dt className='text-ink inline font-mono text-[11px]'>
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
              <h4 className='text-ink-muted text-[10px] font-semibold tracking-wider uppercase'>
                Scaling
              </h4>
              <dl className='mt-1 space-y-0.5 text-[12px] leading-snug'>
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
        <div className='print-keep mt-3 flex flex-wrap gap-1 text-[10px]'>
          {keywords.map(kw => (
            <span key={kw} className='border-border text-ink-muted rounded-sm border px-1.5 py-0.5'>
              {kw}
            </span>
          ))}
        </div>
      )}

      {encounter.dm_notes && (
        <p className='print-keep text-ink-muted mt-2.5 text-[11.5px] leading-snug'>
          <span className='text-ink font-medium'>DM notes: </span>
          {encounter.dm_notes}
        </p>
      )}
    </article>
  )
}
