import { describe, it, expect } from 'vitest'
import { str, num, bool, url, email, json, port } from '../src/validators'

describe('str()', () => {
  it('returns value when set', () => {
    expect(str()('hello')).toEqual({ ok: true, value: 'hello' })
  })

  it('fails when undefined', () => {
    expect(str()(undefined)).toEqual({ ok: false, error: 'required' })
  })

  it('fails when empty string', () => {
    expect(str()('')).toEqual({ ok: false, error: 'required' })
  })

  it('.optional() allows undefined', () => {
    expect(str().optional()(undefined)).toEqual({ ok: true, value: undefined })
    expect(str().optional()('')).toEqual({ ok: true, value: undefined })
  })

  it('.default() uses fallback when undefined', () => {
    expect(str().default('foo')(undefined)).toEqual({ ok: true, value: 'foo' })
    expect(str().default('foo')('')).toEqual({ ok: true, value: 'foo' })
  })

  it('.default() does not override a provided value', () => {
    expect(str().default('foo')('bar')).toEqual({ ok: true, value: 'bar' })
  })

  it('.min() enforces minimum length', () => {
    expect(str().min(5)('abc')).toEqual({ ok: false, error: 'min length: 5' })
    expect(str().min(3)('abc')).toEqual({ ok: true, value: 'abc' })
  })

  it('.max() enforces maximum length', () => {
    expect(str().max(3)('abcd')).toEqual({ ok: false, error: 'max length: 3' })
    expect(str().max(3)('abc')).toEqual({ ok: true, value: 'abc' })
  })

  it('.oneOf() restricts to valid values', () => {
    const v = str().oneOf(['a', 'b', 'c'] as const)
    expect(v('a')).toEqual({ ok: true, value: 'a' })
    expect(v('d')).toEqual({ ok: false, error: 'must be one of: a, b, c' })
  })

  it('supports method chaining', () => {
    const v = str().min(2).max(10).default('hi')
    expect(v(undefined)).toEqual({ ok: true, value: 'hi' })
    expect(v('x')).toEqual({ ok: false, error: 'min length: 2' })
    expect(v('hello')).toEqual({ ok: true, value: 'hello' })
  })
})

describe('num()', () => {
  it('coerces string to number', () => {
    expect(num()('42')).toEqual({ ok: true, value: 42 })
    expect(num()('3.14')).toEqual({ ok: true, value: 3.14 })
    expect(num()('-5')).toEqual({ ok: true, value: -5 })
  })

  it('fails on non-numeric string', () => {
    expect(num()('abc')).toEqual({ ok: false, error: 'must be a number' })
    expect(num()('12px')).toEqual({ ok: false, error: 'must be a number' })
  })

  it('fails when undefined', () => {
    expect(num()(undefined)).toEqual({ ok: false, error: 'required' })
    expect(num()('')).toEqual({ ok: false, error: 'required' })
  })

  it('.optional() allows undefined', () => {
    expect(num().optional()(undefined)).toEqual({ ok: true, value: undefined })
  })

  it('.default() uses fallback', () => {
    expect(num().default(3000)(undefined)).toEqual({ ok: true, value: 3000 })
  })

  it('.min() enforces minimum', () => {
    expect(num().min(10)('5')).toEqual({ ok: false, error: 'min: 10' })
    expect(num().min(10)('10')).toEqual({ ok: true, value: 10 })
  })

  it('.max() enforces maximum', () => {
    expect(num().max(100)('101')).toEqual({ ok: false, error: 'max: 100' })
    expect(num().max(100)('100')).toEqual({ ok: true, value: 100 })
  })

  it('.int() rejects floats', () => {
    expect(num().int()('3.14')).toEqual({ ok: false, error: 'must be an integer' })
    expect(num().int()('3')).toEqual({ ok: true, value: 3 })
  })
})

describe('bool()', () => {
  it.each([
    ['true', true], ['1', true], ['yes', true],
    ['false', false], ['0', false], ['no', false],
    ['TRUE', true], ['FALSE', false], ['YES', true], ['NO', false],
  ])('coerces %s → %s', (raw, expected) => {
    expect(bool()(raw)).toEqual({ ok: true, value: expected })
  })

  it('fails on unrecognized value', () => {
    expect(bool()('maybe')).toEqual({ ok: false, error: 'must be true/false/1/0/yes/no' })
    expect(bool()('on')).toEqual({ ok: false, error: 'must be true/false/1/0/yes/no' })
  })

  it('fails when undefined', () => {
    expect(bool()(undefined)).toEqual({ ok: false, error: 'required' })
  })

  it('.optional() allows undefined', () => {
    expect(bool().optional()(undefined)).toEqual({ ok: true, value: undefined })
  })

  it('.default() uses fallback', () => {
    expect(bool().default(true)(undefined)).toEqual({ ok: true, value: true })
    expect(bool().default(false)(undefined)).toEqual({ ok: true, value: false })
  })
})

describe('url()', () => {
  it('accepts valid URLs', () => {
    expect(url()('https://example.com')).toEqual({ ok: true, value: 'https://example.com' })
    expect(url()('http://localhost:3000/path')).toEqual({ ok: true, value: 'http://localhost:3000/path' })
    expect(url()('postgresql://user:pass@host/db')).toEqual({ ok: true, value: 'postgresql://user:pass@host/db' })
  })

  it('rejects invalid URLs', () => {
    expect(url()('not-a-url')).toEqual({ ok: false, error: 'invalid URL' })
    expect(url()('example.com')).toEqual({ ok: false, error: 'invalid URL' })
  })

  it('fails when undefined', () => {
    expect(url()(undefined)).toEqual({ ok: false, error: 'required' })
  })

  it('.optional() allows undefined', () => {
    expect(url().optional()(undefined)).toEqual({ ok: true, value: undefined })
  })
})

describe('email()', () => {
  it('accepts valid emails', () => {
    expect(email()('user@example.com')).toEqual({ ok: true, value: 'user@example.com' })
    expect(email()('a@b.co')).toEqual({ ok: true, value: 'a@b.co' })
  })

  it('rejects invalid emails', () => {
    expect(email()('notanemail')).toEqual({ ok: false, error: 'invalid email' })
    expect(email()('@example.com')).toEqual({ ok: false, error: 'invalid email' })
    expect(email()('user@')).toEqual({ ok: false, error: 'invalid email' })
  })

  it('fails when undefined', () => {
    expect(email()(undefined)).toEqual({ ok: false, error: 'required' })
  })

  it('.optional() allows undefined', () => {
    expect(email().optional()(undefined)).toEqual({ ok: true, value: undefined })
  })
})

describe('json()', () => {
  it('parses valid JSON', () => {
    expect(json()('{"key":"value"}')).toEqual({ ok: true, value: { key: 'value' } })
    expect(json()('[1,2,3]')).toEqual({ ok: true, value: [1, 2, 3] })
    expect(json()('42')).toEqual({ ok: true, value: 42 })
  })

  it('rejects invalid JSON', () => {
    expect(json()('{invalid}')).toEqual({ ok: false, error: 'invalid JSON' })
  })

  it('fails when undefined', () => {
    expect(json()(undefined)).toEqual({ ok: false, error: 'required' })
  })

  it('.optional() allows undefined', () => {
    expect(json().optional()(undefined)).toEqual({ ok: true, value: undefined })
  })
})

describe('port()', () => {
  it('accepts valid ports', () => {
    expect(port()('3000')).toEqual({ ok: true, value: 3000 })
    expect(port()('1')).toEqual({ ok: true, value: 1 })
    expect(port()('65535')).toEqual({ ok: true, value: 65535 })
  })

  it('rejects out-of-range ports', () => {
    expect(port()('0')).toEqual({ ok: false, error: 'min: 1' })
    expect(port()('65536')).toEqual({ ok: false, error: 'max: 65535' })
  })

  it('rejects non-integers', () => {
    expect(port()('3000.5')).toEqual({ ok: false, error: 'must be an integer' })
  })

  it('rejects non-numeric', () => {
    expect(port()('http')).toEqual({ ok: false, error: 'must be a number' })
  })
})
