import { describe, it, expect } from 'vitest'
import { env } from '../src/parse'
import { str, num, bool } from '../src/validators'

describe('env()', () => {
  it('parses a valid schema', () => {
    const result = env(
      { PORT: num().default(3000), HOST: str() },
      { HOST: 'localhost' }
    )
    expect(result).toEqual({ PORT: 3000, HOST: 'localhost' })
  })

  it('collects all errors before throwing', () => {
    expect(() =>
      env({ PORT: num(), HOST: str(), DEBUG: bool() }, {})
    ).toThrow(/PORT[\s\S]*HOST[\s\S]*DEBUG/)
  })

  it('includes variable name in error message', () => {
    expect(() =>
      env({ DATABASE_URL: str() }, {})
    ).toThrow('DATABASE_URL')
  })

  it('throws with descriptive header', () => {
    expect(() =>
      env({ X: str() }, {})
    ).toThrow('Invalid environment variables')
  })

  it('uses process.env by default', () => {
    process.env['_TEST_HOST'] = 'myhost'
    const result = env({ _TEST_HOST: str() })
    expect(result._TEST_HOST).toBe('myhost')
    delete process.env['_TEST_HOST']
  })

  it('infers output types from schema', () => {
    const result = env(
      {
        NAME:   str(),
        AGE:    num(),
        ACTIVE: bool().optional(),
        ENV:    str().oneOf(['dev', 'prod'] as const),
      },
      { NAME: 'Alice', AGE: '30', ENV: 'dev' }
    )

    // Runtime assertions
    expect(result.NAME).toBe('Alice')
    expect(result.AGE).toBe(30)
    expect(result.ACTIVE).toBeUndefined()
    expect(result.ENV).toBe('dev')

    // TypeScript type check (compile-time — must not error):
    const name: string = result.NAME
    const age: number = result.AGE
    const active: boolean | undefined = result.ACTIVE
    const env2: 'dev' | 'prod' = result.ENV

    expect(name).toBe('Alice')
    expect(age).toBe(30)
    expect(active).toBeUndefined()
    expect(env2).toBe('dev')
  })

  it('does not throw when all variables are valid', () => {
    expect(() =>
      env(
        { HOST: str(), PORT: num(), SSL: bool() },
        { HOST: 'localhost', PORT: '5432', SSL: 'true' }
      )
    ).not.toThrow()
  })
})
