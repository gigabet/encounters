import { cookies } from 'next/headers'
import { getEncounters } from '@/app/helpers'
import { EncounterBrowser } from '@/components/EncounterBrowser'

export default async function Page() {
  const { encounters } = getEncounters()
  const cookieStore = await cookies()
  const initialDark = cookieStore.get('theme')?.value === 'dark'

  return (
    <main className='bg-ink-950 min-h-screen'>
      <EncounterBrowser encounters={encounters} initialDark={initialDark} />
    </main>
  )
}
