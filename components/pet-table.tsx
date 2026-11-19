'use client'

import { useMemo, useState, useTransition } from 'react'
import { Download, Pencil, Search, Trash2 } from 'lucide-react'
import { deletePet } from '@/app/actions'
import { exportPetsCsv } from '@/lib/export'
import type { Pet } from '@/lib/pets'
import { Button } from '@/components/ui/button'
import { HealthBadge } from '@/components/health-badge'
import { cn } from '@/lib/utils'

type Props = {
  pets: Pet[]
  label: string
  showType: boolean
  editingId: number | null
  onEdit: (pet: Pet) => void
}

export function PetTable({ pets, label, showType, editingId, onEdit }: Props) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()
  const showPedigree = label === 'dog'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pets
    return pets.filter((p) => [p.code, p.name, p.breed, p.color].some((v) => v.toLowerCase().includes(q)))
  }, [pets, query])

  function handleDelete(pet: Pet) {
    if (!window.confirm(`Delete ${pet.name} (${pet.code})? This cannot be undone.`)) return
    setPendingId(pet.id)
    setError(null)
    startTransition(async () => {
      const result = await deletePet(pet.id)
      if (!result.ok) setError(result.error)
      setPendingId(null)
    })
  }

  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-border bg-card" aria-label={`${label} list`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="pet-search" className="sr-only">
            Search pets
          </label>
          <input
            id="pet-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code, name, breed or color"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
        <Button variant="outline" onClick={() => exportPetsCsv(filtered, label)} disabled={filtered.length === 0}>
          <Download aria-hidden="true" />
          Export {label} list
        </Button>
      </div>

      {error && (
        <p role="alert" className="px-4 pt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Code</th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              {showType && <th className="px-4 py-2.5 font-medium">Type</th>}
              <th className="px-4 py-2.5 font-medium">Breed</th>
              <th className="px-4 py-2.5 font-medium">Year</th>
              <th className="px-4 py-2.5 font-medium">Color</th>
              <th className="px-4 py-2.5 font-medium">Health</th>
              {showPedigree && <th className="px-4 py-2.5 font-medium">Pedigree</th>}
              <th className="px-4 py-2.5 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  {query ? 'No pets match your search.' : `No ${label}s registered yet.`}
                </td>
              </tr>
            )}
            {filtered.map((pet) => (
              <tr
                key={pet.id}
                className={cn('border-b border-border last:border-0', editingId === pet.id && 'bg-primary/5')}
              >
                <td className="px-4 py-3 font-mono text-xs">{pet.code}</td>
                <td className="px-4 py-3 font-medium">{pet.name}</td>
                {showType && <td className="px-4 py-3 capitalize">{pet.kind ?? '-'}</td>}
                <td className="px-4 py-3">{pet.breed || '-'}</td>
                <td className="px-4 py-3 tabular-nums">{pet.bornYear}</td>
                <td className="px-4 py-3">{pet.color}</td>
                <td className="px-4 py-3">
                  <HealthBadge status={pet.healthStatus} />
                </td>
                {showPedigree && <td className="px-4 py-3">{pet.pedigree ? 'Yes' : 'No'}</td>}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(pet)}
                      disabled={!pet.kind}
                      aria-label={`Edit ${pet.name}`}
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(pet)}
                      disabled={pendingId === pet.id}
                      aria-label={`Delete ${pet.name}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
