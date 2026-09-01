import { getEncounters } from '@/app/helpers'
import { EncounterBrowser } from '@/components/EncounterBrowser'

export default function Page() {
  const { encounters } = getEncounters()
  return (
    <main className='bg-ink-950 min-h-screen'>
      <EncounterBrowser encounters={encounters} />
    </main>
  )
}
