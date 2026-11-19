export type PetKind = 'dog' | 'cat'

export const HEALTH_STATUSES = ['Healthy', 'Sick', 'In Surgery'] as const
export type HealthStatus = (typeof HEALTH_STATUSES)[number]

export const BREEDS: Record<PetKind, readonly string[]> = {
  dog: ['Criollo', 'Schnauzer', 'German shepherd', 'Pincher'],
  cat: ['Birman', 'British', 'Bombay', 'Abyssinian'],
}

export type Pet = {
  id: number
  kind: PetKind | null
  code: string
  name: string
  bornYear: number
  color: string
  healthStatus: string
  breed: string
  pedigree: boolean | null
}

export type PetInput = {
  code: string
  name: string
  bornYear: number
  color: string
  healthStatus: string
  breed: string
  pedigree: boolean
}

export type ActionResult = { ok: true } | { ok: false; error: string }
