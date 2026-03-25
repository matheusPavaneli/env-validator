export function toNumber(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const n = Number(raw)
  return Number.isNaN(n) ? undefined : n
}

export function toBool(raw: string): boolean | undefined {
  switch (raw.toLowerCase()) {
    case 'true': case '1': case 'yes': return true
    case 'false': case '0': case 'no': return false
    default: return undefined
  }
}
