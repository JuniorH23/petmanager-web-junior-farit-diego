import { getPets } from '@/lib/get-pets'
import { PetDashboard } from '@/components/pet-dashboard'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const pets = await getPets()
  return <PetDashboard pets={pets} />
}
