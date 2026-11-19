'use client'

import { useMemo, useState } from 'react'
import { PawPrint } from 'lucide-react'
import type { Pet, PetKind } from '@/lib/pets'
import { HealthSummary } from '@/components/health-summary'
import { PetForm } from '@/components/pet-form'
import { PetTable } from '@/components/pet-table'
import { cn } from '@/lib/utils'

type Tab = PetKind | 'all'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dog', label: 'Dogs' },
  { id: 'cat', label: 'Cats' },
  { id: 'all', label: 'All pets' },
]

export function PetDashboard({ pets }: { pets: Pet[] }) {
  const [tab, setTab] = useState<Tab>('dog')
  const [editing, setEditing] = useState<Pet | null>(null)

  const visible = useMemo(() => (tab === 'all' ? pets : pets.filter((p) => p.kind === tab)), [pets, tab])

  function selectTab(next: Tab) {
    setTab(next)
    setEditing(null)
  }

  function startEdit(pet: Pet) {
    if (pet.kind) {
      setTab(pet.kind)
      setEditing(pet)
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 md:px-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-balance">Pet Manager</h1>
            <p className="text-sm text-muted-foreground">Register and track dogs and cats in one place</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
        <HealthSummary pets={pets} />

        <div role="tablist" aria-label="Pet type" className="flex w-fit gap-1 rounded-lg bg-muted p-1">
          {TABS.map((t) => {
            const count = t.id === 'all' ? pets.length : pets.filter((p) => p.kind === t.id).length
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => selectTab(t.id)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label} <span className="ml-1 tabular-nums text-muted-foreground">{count}</span>
              </button>
            )
          })}
        </div>

        <div className={cn('grid gap-6', tab !== 'all' && 'lg:grid-cols-[340px_1fr]')}>
          {tab !== 'all' && (
            <PetForm key={`${tab}-${editing?.id ?? 'new'}`} kind={tab} pet={editing} onDone={() => setEditing(null)} />
          )}
          <PetTable
            pets={visible}
            label={tab === 'all' ? 'pet' : tab}
            showType={tab === 'all'}
            editingId={editing?.id ?? null}
            onEdit={startEdit}
          />
        </div>
      </main>
    </div>
  )
}
