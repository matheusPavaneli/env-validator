# @azlabs/env-validator

Tiny, typed environment variable validator for Node.js.

**Zero dependencies · < 1.5 KB gzipped · TypeScript-first**

## Install

```bash
npm install @azlabs/env-validator
```

## Usage

```typescript
import { env, str, num, bool, port } from '@azlabs/env-validator'

export const config = env({
  PORT:         port().default(3000),
  DATABASE_URL: str(),
  NODE_ENV:     str().oneOf(['development', 'production', 'test'] as const),
  API_KEY:      str().min(32),
  DEBUG:        bool().optional(),
})

// Fully typed — no `as` casts needed:
// config.PORT         → number
// config.NODE_ENV     → "development" | "production" | "test"
// config.DEBUG        → boolean | undefined
```

If any variable is missing or invalid, a descriptive error is thrown **after collecting all errors**:

```
Error: Invalid environment variables:
  PORT: must be a number
  DATABASE_URL: required
  API_KEY: min length: 32
```

## Validators

### `str()`

| Method | Description |
|---|---|
| `.optional()` | Allows `undefined` |
| `.default(val)` | Fallback when not set |
| `.oneOf(vals)` | Restrict to specific values — narrows TypeScript type |
| `.min(n)` | Minimum string length |
| `.max(n)` | Maximum string length |

### `num()`

Coerces string → number automatically.

| Method | Description |
|---|---|
| `.optional()` | Allows `undefined` |
| `.default(val)` | Fallback when not set |
| `.min(n)` | Minimum value |
| `.max(n)` | Maximum value |
| `.int()` | Must be an integer |

### `bool()`

Accepts `true`, `false`, `1`, `0`, `yes`, `no` (case-insensitive).

| Method | Description |
|---|---|
| `.optional()` | Allows `undefined` |
| `.default(val)` | Fallback when not set |

### `url()`

Validates via the native `URL` constructor.

| Method | Description |
|---|---|
| `.optional()` | Allows `undefined` |

### `email()`

Lightweight format check (not RFC 5321 — use `str()` with a custom regex for strict validation).

| Method | Description |
|---|---|
| `.optional()` | Allows `undefined` |

### `json<T>()`

Parses a JSON string value, optionally typed.

```typescript
json<{ host: string; port: number }>()
```

| Method | Description |
|---|---|
| `.optional()` | Allows `undefined` |

### `port()`

Shorthand for `num().min(1).max(65535).int()`.

## Custom source

Reads from `process.env` by default. Pass a second argument for a custom source (useful in tests):

```typescript
const config = env(schema, { PORT: '3000', DATABASE_URL: '...' })
```

## License

MIT
