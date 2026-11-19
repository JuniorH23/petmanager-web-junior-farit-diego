'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { createPet, updatePet } from '@/app/actions'
import { BREEDS, HEALTH_STATUSES, type Pet, type PetKind } from '@/lib/pets'
import { Button } from '@/components/ui/button'

const fieldClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40'

export function PetForm({ kind, pet, onDone }: { kind: PetKind; pet: Pet | null; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const noun = kind === 'dog' ? 'dog' : 'cat'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const input = {
      code: String(data.get('code') ?? ''),
      name: String(data.get('name') ?? ''),
      bornYear: Number(data.get('bornYear')),
      color: String(data.get('color') ?? ''),
      healthStatus: String(data.get('healthStatus') ?? ''),
      breed: String(data.get('breed') ?? ''),
      pedigree: data.get('pedigree') === 'on',
    }
    startTransition(async () => {
      const result = pet ? await updatePet(pet.id, kind, input) : await createPet(kind, input)
      if (!result.ok) {
        setMessage({ type: 'error', text: result.error })
        return
      }
      if (pet) {
        onDone()
      } else {
        form.reset()
        setMessage({ type: 'success', text: `The ${noun} was registered.` })
      }
    })
  }

  return (
    <section className="h-fit rounded-xl border border-border bg-card p-5" aria-labelledby="pet-form-title">
      <h2 id="pet-form-title" className="font-semibold">
        {pet ? `Edit ${noun}` : `Register ${noun}`}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {pet ? `Updating ${pet.name} (${pet.code})` : 'All fields are required.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code" htmlFor="code">
            <input id="code" name="code" required maxLength={30} defaultValue={pet?.code} className={fieldClass} />
          </Field>
          <Field label="Born year" htmlFor="bornYear">
            <input
              id="bornYear"
              name="bornYear"
              type="number"
              required
              min={1980}
              max={new Date().getFullYear()}
              defaultValue={pet?.bornYear}
              className={fieldClass}
            />
          </Field>
        </div>
        <Field label="Name" htmlFor="name">
          <input id="name" name="name" required maxLength={60} defaultValue={pet?.name} className={fieldClass} />
        </Field>
        <Field label="Color" htmlFor="color">
          <input id="color" name="color" required maxLength={40} defaultValue={pet?.color} className={fieldClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Health status" htmlFor="healthStatus">
            <select id="healthStatus" name="healthStatus" required defaultValue={pet?.healthStatus ?? ''} className={fieldClass}>
              <option value="" disabled>
                Select
              </option>
              {HEALTH_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Breed" htmlFor="breed">
            <select id="breed" name="breed" required defaultValue={pet?.breed ?? ''} className={fieldClass}>
              <option value="" disabled>
                Select
              </option>
              {BREEDS[kind].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {kind === 'dog' && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="pedigree"
              defaultChecked={pet?.pedigree ?? false}
              className="size-4 accent-[var(--primary)]"
            />
            Has pedigree
          </label>
        )}

        {message && (
          <p
            role={message.type === 'error' ? 'alert' : 'status'}
            className={message.type === 'error' ? 'text-sm text-destructive' : 'text-sm text-chart-2'}
          >
            {message.text}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? 'Saving...' : pet ? 'Save changes' : `Register ${noun}`}
          </Button>
          {pet && (
            <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
