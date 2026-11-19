'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { BREEDS, HEALTH_STATUSES, type ActionResult, type PetInput, type PetKind } from '@/lib/pets'

function validate(kind: PetKind, input: PetInput): string | null {
  if (kind !== 'dog' && kind !== 'cat') return 'Invalid pet type.'
  const code = String(input.code ?? '').trim()
  const name = String(input.name ?? '').trim()
  const color = String(input.color ?? '').trim()
  const year = Number(input.bornYear)
  const currentYear = new Date().getFullYear()
  if (!code || code.length > 30) return 'Code is required (max 30 characters).'
  if (!name || name.length > 60) return 'Name is required (max 60 characters).'
  if (!color || color.length > 40) return 'Color is required (max 40 characters).'
  if (!Number.isInteger(year) || year < 1980 || year > currentYear)
    return `Born year must be between 1980 and ${currentYear}.`
  if (!(HEALTH_STATUSES as readonly string[]).includes(input.healthStatus))
    return 'Select a valid health status.'
  if (!BREEDS[kind].includes(input.breed)) return 'Select a valid breed.'
  return null
}

function petRow(input: PetInput) {
  return {
    code: input.code.trim(),
    name: input.name.trim(),
    born_year: Number(input.bornYear),
    color: input.color.trim(),
    health_status: input.healthStatus,
  }
}

function detailRow(kind: PetKind, input: PetInput) {
  return kind === 'dog'
    ? { breed: input.breed, pedigree: Boolean(input.pedigree) }
    : { breed: input.breed }
}

async function codeTaken(code: string, excludeId?: number) {
  let query = getSupabaseAdmin().from('tb_pet').select('id').eq('code', code.trim()).limit(1)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query
  return (data?.length ?? 0) > 0
}

export async function createPet(kind: PetKind, input: PetInput): Promise<ActionResult> {
  const invalid = validate(kind, input)
  if (invalid) return { ok: false, error: invalid }
  if (await codeTaken(input.code)) return { ok: false, error: 'A pet with this code already exists.' }

  const supabase = getSupabaseAdmin()
  const { data: pet, error } = await supabase.from('tb_pet').insert(petRow(input)).select('id').single()
  if (error || !pet) return { ok: false, error: 'Could not save the pet.' }

  const table = kind === 'dog' ? 'tb_dog' : 'tb_cat'
  const { error: detailError } = await supabase.from(table).insert({ ...detailRow(kind, input), id_pet: pet.id })
  if (detailError) {
    await supabase.from('tb_pet').delete().eq('id', pet.id)
    return { ok: false, error: 'Could not save the pet details.' }
  }

  revalidatePath('/')
  return { ok: true }
}

export async function updatePet(id: number, kind: PetKind, input: PetInput): Promise<ActionResult> {
  if (!Number.isInteger(id)) return { ok: false, error: 'Invalid pet.' }
  const invalid = validate(kind, input)
  if (invalid) return { ok: false, error: invalid }
  if (await codeTaken(input.code, id)) return { ok: false, error: 'Another pet already uses this code.' }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('tb_pet').update(petRow(input)).eq('id', id)
  if (error) return { ok: false, error: 'Could not update the pet.' }

  const table = kind === 'dog' ? 'tb_dog' : 'tb_cat'
  const { error: detailError } = await supabase.from(table).update(detailRow(kind, input)).eq('id_pet', id)
  if (detailError) return { ok: false, error: 'Could not update the pet details.' }

  revalidatePath('/')
  return { ok: true }
}

export async function deletePet(id: number): Promise<ActionResult> {
  if (!Number.isInteger(id)) return { ok: false, error: 'Invalid pet.' }
  const supabase = getSupabaseAdmin()
  await supabase.from('tb_pet_hospital').delete().eq('id_pet', id)
  const { error } = await supabase.from('tb_pet').delete().eq('id', id)
  if (error) return { ok: false, error: 'Could not delete the pet.' }
  revalidatePath('/')
  return { ok: true }
}
