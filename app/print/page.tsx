// app/print/page.tsx
import { getEncounters } from '@/app/helpers'
import { PrintView } from '@/components/PrintView'

export const metadata = {
  title: 'Supernatural Encounters — Printable Reference',
}

export default function PrintPage() {
  const { encounters } = getEncounters()
  const sorted = [...encounters].sort((a, b) => a.title.localeCompare(b.title))

  return <PrintView encounters={sorted} />
}
