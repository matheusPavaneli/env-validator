import { toNumber, toBool } from './coerce'
import type { Result, Validator } from './types'

const ok = <T>(value: T): Result<T> => ({ ok: true, value })
const fail = (error: string): Result<never> => ({ ok: false, error })

// ---- Interfaces ----

export interface StrBuilder<T extends string | undefined = string> extends Validator<T> {
  optional(): StrBuilder<string | undefined>
  default(val: string): StrBuilder<string>
  oneOf<V extends string>(vals: readonly V[]): StrBuilder<T extends undefined ? V | undefined : V>
  min(n: number): StrBuilder<T>
  max(n: number): StrBuilder<T>
}

export interface NumBuilder<T extends number | undefined = number> extends Validator<T> {
  optional(): NumBuilder<number | undefined>
  default(val: number): NumBuilder<number>
  min(n: number): NumBuilder<T>
  max(n: number): NumBuilder<T>
  int(): NumBuilder<T>
}

export interface BoolBuilder<T extends boolean | undefined = boolean> extends Validator<T> {
  optional(): BoolBuilder<boolean | undefined>
  default(val: boolean): BoolBuilder<boolean>
}

export interface SimpleBuilder<T> extends Validator<T> {
  optional(): SimpleBuilder<T | undefined>
}

// ---- str() ----

export function str(): StrBuilder {
  let _opt = false, _def: string | undefined
  let _oneOf: readonly string[] | undefined
  let _min: number | undefined, _max: number | undefined

  function run(raw: string | undefined): Result<any> {
    const val = (raw !== undefined && raw !== '') ? raw : _def
    if (val === undefined) return _opt ? ok(undefined) : fail('required')
    if (_min != null && val.length < _min) return fail(`min length: ${_min}`)
    if (_max != null && val.length > _max) return fail(`max length: ${_max}`)
    if (_oneOf && !_oneOf.includes(val))
      return fail(`must be one of: ${_oneOf.join(', ')}`)
    return ok(val)
  }
  run.optional = (): StrBuilder<any> => { _opt = true; return run as any }
  run.default  = (d: string): StrBuilder<any> => { _def = d; return run as any }
  run.oneOf    = (vals: readonly string[]): StrBuilder<any> => { _oneOf = vals; return run as any }
  run.min      = (n: number): StrBuilder<any> => { _min = n; return run as any }
  run.max      = (n: number): StrBuilder<any> => { _max = n; return run as any }

  return run as unknown as StrBuilder
}

// ---- num() ----

export function num(): NumBuilder {
  let _opt = false, _def: number | undefined
  let _min: number | undefined, _max: number | undefined
  let _int = false

  function run(raw: string | undefined): Result<any> {
    if (raw === undefined || raw === '') {
      if (_def !== undefined) return ok(_def)
      return _opt ? ok(undefined) : fail('required')
    }
    const n = toNumber(raw)
    if (n === undefined) return fail('must be a number')
    if (_int && !Number.isInteger(n)) return fail('must be an integer')
    if (_min != null && n < _min) return fail(`min: ${_min}`)
    if (_max != null && n > _max) return fail(`max: ${_max}`)
    return ok(n)
  }
  run.optional = (): NumBuilder<any> => { _opt = true; return run as any }
  run.default  = (d: number): NumBuilder<any> => { _def = d; return run as any }
  run.min      = (n: number): NumBuilder<any> => { _min = n; return run as any }
  run.max      = (n: number): NumBuilder<any> => { _max = n; return run as any }
  run.int      = (): NumBuilder<any> => { _int = true; return run as any }

  return run as unknown as NumBuilder
}

// ---- bool() ----

export function bool(): BoolBuilder {
  let _opt = false, _def: boolean | undefined

  function run(raw: string | undefined): Result<any> {
    if (raw === undefined || raw === '') {
      if (_def !== undefined) return ok(_def)
      return _opt ? ok(undefined) : fail('required')
    }
    const b = toBool(raw)
    if (b === undefined) return fail('must be true/false/1/0/yes/no')
    return ok(b)
  }
  run.optional = (): BoolBuilder<any> => { _opt = true; return run as any }
  run.default  = (d: boolean): BoolBuilder<any> => { _def = d; return run as any }

  return run as unknown as BoolBuilder
}

// ---- url() ----

export function url(): SimpleBuilder<string> {
  let _opt = false

  function run(raw: string | undefined): Result<any> {
    if (!raw) return _opt ? ok(undefined) : fail('required')
    try { new URL(raw); return ok(raw) }
    catch { return fail('invalid URL') }
  }
  run.optional = (): SimpleBuilder<any> => { _opt = true; return run as any }

  return run as unknown as SimpleBuilder<string>
}

// ---- email() ----

export function email(): SimpleBuilder<string> {
  let _opt = false

  function run(raw: string | undefined): Result<any> {
    if (!raw) return _opt ? ok(undefined) : fail('required')
    const at = raw.indexOf('@')
    if (at < 1 || raw.lastIndexOf('.') <= at + 1) return fail('invalid email')
    return ok(raw)
  }
  run.optional = (): SimpleBuilder<any> => { _opt = true; return run as any }

  return run as unknown as SimpleBuilder<string>
}

// ---- json() ----

export function json<T = unknown>(): SimpleBuilder<T> {
  let _opt = false

  function run(raw: string | undefined): Result<any> {
    if (!raw) return _opt ? ok(undefined) : fail('required')
    try { return ok(JSON.parse(raw)) }
    catch { return fail('invalid JSON') }
  }
  run.optional = (): SimpleBuilder<any> => { _opt = true; return run as any }

  return run as unknown as SimpleBuilder<T>
}

// ---- port() ----

export const port = (): NumBuilder<number> => num().min(1).max(65535).int()
