export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
export type Validator<T> = (raw: string | undefined) => Result<T>
export type Schema = Record<string, Validator<unknown>>
export type Infer<S extends Schema> = {
  [K in keyof S]: S[K] extends Validator<infer T> ? T : never
}
