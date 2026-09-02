// components/PrintButton.tsx
'use client'

export function PrintButton() {
  return (
    <button
      type='button'
      onClick={() => window.print()}
      className='border-border bg-surface text-ink hover:border-accent border px-4 py-2 text-sm'
    >
      Print / Save as PDF
    </button>
  )
}
