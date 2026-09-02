// components/PrintView.tsx
'use client'

import { useMemo, useRef, useState } from 'react'
import { EncounterPrintCard } from '@/components/EncounterPrintCard'
import { EncounterPrintCardFull } from '@/components/EncounterPrintCardFull'
import { captureNodeAsWebp, downloadBlob, exportEncountersAsWebpZip } from '@/lib/webp-export'
import type { Encounter } from '@/types/encounters'

type Mode = 'compact' | 'single' | 'preview'
type ExportWidth = 'wide' | 'thin'

// Capture rig dimensions per export width. "Wide" matches a desktop/print
// reading measure (same 816px the export always used before). "Thin"
// targets a phone screen read at 1x — narrow enough to read one column
// without pinch-zooming, with tighter padding since there's less width to
// spend on margin.
const CAPTURE_DIMS: Record<ExportWidth, { width: number; padding: string }> = {
  wide: { width: 816, padding: '2.5rem' },
  thin: { width: 420, padding: '1rem' },
}

const BASE_CSS = `
  @media print {
    html, body { background: #fff !important; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
  .print-keep, .print-keep-head {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  h2.print-keep, h3.print-keep, h4 {
    break-after: avoid;
    page-break-after: avoid;
  }
`

const COMPACT_CSS = `
  @page { size: letter; margin: 0.55in; }
  .print-columns {
    column-count: 2;
    column-gap: 2rem;
    column-fill: auto;
  }
`

const SINGLE_CSS = `
  @page { size: letter; margin: 0.65in; }
  .print-page {
    break-after: page;
    page-break-after: always;
  }
  .print-page:last-child {
    break-after: auto;
    page-break-after: auto;
  }
`

const PREVIEW_CSS = `
  .print-page {
    break-after: auto;
    page-break-after: auto;
  }
`

const MODE_CSS: Record<Mode, string> = {
  compact: COMPACT_CSS,
  single: SINGLE_CSS,
  preview: PREVIEW_CSS,
}

export function PrintView({ encounters }: { encounters: Encounter[] }) {
  const [mode, setMode] = useState<Mode>('compact')
  const [selected, setSelected] = useState<Set<string>>(() => new Set(encounters.map(e => e.id)))
  const [pickerOpen, setPickerOpen] = useState(false)

  const [exportWidth, setExportWidth] = useState<ExportWidth>('wide')
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<{ done: number; total: number } | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const captureRef = useRef<HTMLDivElement>(null)
  const [captureEncounter, setCaptureEncounter] = useState<Encounter | null>(null)

  const byId = useMemo(() => new Map(encounters.map(e => [e.id, e])), [encounters])
  const filtered = useMemo(() => encounters.filter(e => selected.has(e.id)), [encounters, selected])

  const allSelected = selected.size === encounters.length
  const noneSelected = selected.size === 0

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleExportWebp() {
    if (filtered.length === 0 || exporting) return
    setExporting(true)
    setExportError(null)
    setExportProgress({ done: 0, total: filtered.length })

    try {
      const zipBlob = await exportEncountersAsWebpZip(
        filtered.map(e => ({ id: e.id, title: e.title })),
        async id => {
          const encounter = byId.get(id)
          if (!encounter) throw new Error(`Missing encounter ${id}`)

          setCaptureEncounter(encounter)
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
          if (document.fonts?.ready) await document.fonts.ready

          const node = captureRef.current
          if (!node) throw new Error('Capture node not mounted')
          return captureNodeAsWebp(node)
        },
        p => setExportProgress({ done: p.done, total: p.total })
      )

      const suffix = exportWidth === 'thin' ? 'mobile' : 'wide'
      downloadBlob(zipBlob, `supernatural-encounters-webp-${suffix}.zip`)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setCaptureEncounter(null)
      setExporting(false)
      setExportProgress(null)
    }
  }

  const printCss = BASE_CSS + MODE_CSS[mode]
  const canPrint = mode !== 'preview'
  const dims = CAPTURE_DIMS[exportWidth]

  return (
    <main className='text-ink mx-auto max-w-4xl bg-white px-6 py-10 print:max-w-none print:px-0 print:py-0'>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static/derived string, not user input */}
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      <div className='border-border mb-6 border-b pb-4 print:hidden'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='font-display text-ink text-2xl'>Printable Reference</h1>
            <p className='text-ink-muted mt-1 text-sm'>
              {filtered.length} of {encounters.length} encounters selected.
              {mode === 'preview' &&
                ' Preview mode — continuous, not paginated. Switch to Single to print.'}
            </p>
          </div>
          <button
            type='button'
            onClick={() => window.print()}
            disabled={!canPrint}
            title={
              canPrint
                ? undefined
                : 'Preview mode is screen-only — switch to Compact or Single to print'
            }
            className='border-border bg-surface text-ink hover:border-accent border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40'
          >
            Print / Save as PDF
          </button>
        </div>

        <div className='mt-4 flex flex-wrap items-center gap-4'>
          <div className='border-border inline-flex border text-sm'>
            {(
              [
                { key: 'compact', label: 'Compact' },
                { key: 'single', label: 'One per page' },
                { key: 'preview', label: 'Preview (continuous)' },
              ] as const
            ).map(opt => (
              <button
                key={opt.key}
                type='button'
                onClick={() => setMode(opt.key)}
                aria-pressed={mode === opt.key}
                className={`px-3 py-1.5 transition-colors ${
                  mode === opt.key ? 'bg-accent/10 text-accent' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type='button'
            onClick={() => setPickerOpen(v => !v)}
            className='border-border text-ink-muted hover:text-ink border px-3 py-1.5 text-sm'
            aria-expanded={pickerOpen}
          >
            Choose encounters {pickerOpen ? '▲' : '▼'}
          </button>
        </div>

        {/* WebP export controls, separated visually from print mode since
            width here only affects the exported images, not the on-screen
            layout above. */}
        <div className='border-border bg-surface mt-4 flex flex-wrap items-center gap-3 border px-3 py-2.5'>
          <span className='text-ink-muted text-xs font-medium tracking-wide uppercase'>
            WebP export
          </span>

          <div className='border-border inline-flex border text-sm'>
            {(
              [
                { key: 'wide', label: 'Wide (desktop)' },
                { key: 'thin', label: 'Thin (mobile)' },
              ] as const
            ).map(opt => (
              <button
                key={opt.key}
                type='button'
                onClick={() => setExportWidth(opt.key)}
                aria-pressed={exportWidth === opt.key}
                className={`px-3 py-1 transition-colors ${
                  exportWidth === opt.key
                    ? 'bg-accent/10 text-accent'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type='button'
            onClick={handleExportWebp}
            disabled={exporting || noneSelected}
            className='border-border bg-canvas text-ink hover:border-accent ml-auto border px-4 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40'
          >
            {exporting
              ? `Exporting ${exportProgress?.done ?? 0}/${exportProgress?.total ?? filtered.length}…`
              : `Download as WebP (${filtered.length})`}
          </button>
        </div>

        {exportError && (
          <p className='text-danger mt-2 text-xs'>
            {exportError} — your browser may not support WebP export; try a recent Chrome, Firefox,
            or Edge.
          </p>
        )}
      </div>

      {mode === 'compact' && (
        <h1 className='font-display text-ink mb-4 hidden text-xl print:block'>
          Supernatural Encounters — Printable Reference
        </h1>
      )}

      {noneSelected && (
        <p className='text-ink-muted mt-8 text-center text-sm print:hidden'>
          No encounters selected — pick at least one above.
        </p>
      )}

      {mode === 'compact' && (
        <div className='print-columns'>
          {filtered.map(e => (
            <EncounterPrintCard key={e.id} encounter={e} />
          ))}
        </div>
      )}

      {mode === 'single' && (
        <div className='flex flex-col'>
          {filtered.map(e => (
            <EncounterPrintCardFull key={e.id} encounter={e} />
          ))}
        </div>
      )}

      {mode === 'preview' && (
        <div className='divide-border flex flex-col divide-y divide-dashed'>
          {filtered.map(e => (
            <div key={e.id} className='py-8 first:pt-0'>
              <EncounterPrintCardFull encounter={e} />
            </div>
          ))}
        </div>
      )}

      {/* Off-screen capture rig. Width/padding switch with the Wide/Thin
          toggle above — this is the one thing that actually changes what
          gets exported; EncounterPrintCardFull's own max-w-2xl is wider
          than either capture width, so it just fills whatever container
          it's handed rather than needing a separate narrow variant. */}
      <div
        aria-hidden='true'
        className='pointer-events-none fixed top-0 left-0 -z-50 opacity-0'
        style={{ transform: 'translateX(-200vw)' }}
      >
        <div
          ref={captureRef}
          className='bg-white'
          style={{ width: `${dims.width}px`, padding: dims.padding }}
        >
          {captureEncounter && <EncounterPrintCardFull encounter={captureEncounter} />}
        </div>
      </div>
    </main>
  )
}
