import type { Pet } from '@/lib/pets'

function cell(value: string | number) {
  const text = String(value)
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

export function exportPetsCsv(pets: Pet[], label: string) {
  const includePedigree = pets.some((p) => p.kind === 'dog')
  const header = ['Code', 'Name', 'Type', 'Born year', 'Color', 'Health status', 'Breed']
  if (includePedigree) header.push('Pedigree')

  const rows = pets.map((p) => {
    const row: (string | number)[] = [p.code, p.name, p.kind ?? '-', p.bornYear, p.color, p.healthStatus, p.breed]
    if (includePedigree) row.push(p.pedigree === null ? '-' : p.pedigree ? 'Yes' : 'No')
    return row.map(cell).join(',')
  })

  const csv = '\uFEFF' + [header.map(cell).join(','), ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const link = document.createElement('a')
  link.href = url
  link.download = `${label}_list_report_${stamp}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
