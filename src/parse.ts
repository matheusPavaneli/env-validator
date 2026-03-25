import type { Schema, Infer } from './types'

export function env<S extends Schema>(
  schema: S,
  source: Record<string, string | undefined> = process.env
): Infer<S> {
  const result: Record<string, unknown> = {}
  const errors: string[] = []

  for (const key in schema) {
    const out = schema[key](source[key])
    if (out.ok) result[key] = out.value
    else errors.push(`  ${key}: ${out.error}`)
  }

  if (errors.length)
    throw new Error(`Invalid environment variables:\n${errors.join('\n')}`)

  return result as Infer<S>
}
