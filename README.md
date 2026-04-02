# aetherdb-js

Official JavaScript/TypeScript client for [AetherDB](https://aetherdb.cloud) — the AI-native database infrastructure.

## Installation

```bash
npm install aetherdb-js
```

## Quick start

```typescript
import { AetherDB } from 'aetherdb-js'

const db = new AetherDB({
  url: 'https://aetherdb.cloud',
  token: 'your-jwt-token'
})

// Query your isolated database
const { rows } = await db.from('products').select('*').execute()

// AI-powered queries — plain English
const result = await db.ai('how many products cost more than $20?')
console.log(result.generated_sql) // SELECT COUNT(*) FROM products WHERE price > 20
console.log(result.rows)          // [{ count: 5 }]
```

## Authentication

```typescript
const db = new AetherDB({ url: 'https://aetherdb.cloud' })

// Register — gets you an isolated database schema automatically
await db.register('you@example.com', 'your-password')

// Sign in
const { access_token, user } = await db.signIn('you@example.com', 'your-password')
console.log(user.schema) // tenant_42 — your isolated schema
```

## Create tables

```typescript
await db.createTable('products', [
  { name: 'title',       type: 'TEXT',    nullable: false },
  { name: 'price',       type: 'NUMERIC', nullable: false },
  { name: 'description', type: 'TEXT',    nullable: true  },
])
```

## Query builder

```typescript
// Select with filters
const { rows } = await db
  .from('products')
  .select('title, price')
  .gt('price', 10)
  .order('price', 'DESC')
  .limit(10)
  .execute()

// Insert
const { id } = await db.from('products').insert({
  title: 'Pro Plan',
  price: 29.99
})
```

## AI queries

```typescript
// Natural language → SQL → results
const result = await db.ai('which products were added this week?')
console.log(result.generated_sql)  // generated SQL
console.log(result.rows)           // query results
console.log(result.execution_time_ms) // how fast it ran
```

## Tenant info

```typescript
// Get your postgres connection string
const info = await db.getTenantInfo()
console.log(info.connection_string)
// postgres://user:pass@aetherdb.cloud:5432/aetherdb?search_path=tenant_42
```

## API reference

| Method | Description |
|--------|-------------|
| `db.register(email, password)` | Create account + provision schema |
| `db.signIn(email, password)` | Login and get token |
| `db.from(table)` | Start a query builder |
| `db.ai(question)` | Natural language query |
| `db.query(sql)` | Raw SQL query |
| `db.createTable(name, columns)` | Create a table |
| `db.getSchema()` | List all your tables |
| `db.getTenantInfo()` | Get connection string |
| `db.health()` | Check server status |

## License

MIT
