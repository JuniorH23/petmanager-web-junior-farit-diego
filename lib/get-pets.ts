import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { Pet } from '@/lib/pets'

type Row = {
  id: number
  code: string
  name: string
  born_year: number
  color: string
  health_status: string
  tb_dog: { breed: string; pedigree: boolean }[] | null
  tb_cat: { breed: string }[] | null
}

export async function getPets(): Promise<Pet[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('tb_pet')
    .select('id, code, name, born_year, color, health_status, tb_dog(breed, pedigree), tb_cat(breed)')
    .order('id', { ascending: true })

  if (error) throw new Error(`Could not load pets: ${error.message}`)

  return (data as unknown as Row[]).map((row) => {
    const dog = row.tb_dog?.[0]
    const cat = row.tb_cat?.[0]
    return {
      id: row.id,
      kind: dog ? 'dog' : cat ? 'cat' : null,
      code: row.code,
      name: row.name,
      bornYear: row.born_year,
      color: row.color,
      healthStatus: row.health_status,
      breed: dog?.breed ?? cat?.breed ?? '',
      pedigree: dog ? dog.pedigree : null,
    }
  })
}
