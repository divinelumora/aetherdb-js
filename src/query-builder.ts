import { HttpClient } from './http'
import { QueryResult, AIQueryResult, ColumnDef } from './types'

/**
 * QueryBuilder provides a fluent interface for building and executing queries.
 *
 * Usage:
 *   const rows = await db.from('products').select('title, price').eq('price', 29.99).execute()
 */
export class QueryBuilder {
  private http: HttpClient
  private tableName: string
  private selectedColumns: string = '*'
  private conditions: string[] = []
  private limitValue?: number
  private orderByColumn?: string
  private orderDirection: 'ASC' | 'DESC' = 'ASC'
  private isScoped: boolean

  constructor(http: HttpClient, table: string, scoped = true) {
    this.http = http
    this.tableName = table
    this.isScoped = scoped
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  select(columns: string): this {
    this.selectedColumns = columns
    return this
  }

  // ── Filters ───────────────────────────────────────────────────────────────

  eq(column: string, value: unknown): this {
    this.conditions.push(`${column} = '${value}'`)
    return this
  }

  neq(column: string, value: unknown): this {
    this.conditions.push(`${column} != '${value}'`)
    return this
  }

  gt(column: string, value: unknown): this {
    this.conditions.push(`${column} > '${value}'`)
    return this
  }

  gte(column: string, value: unknown): this {
    this.conditions.push(`${column} >= '${value}'`)
    return this
  }

  lt(column: string, value: unknown): this {
    this.conditions.push(`${column} < '${value}'`)
    return this
  }

  lte(column: string, value: unknown): this {
    this.conditions.push(`${column} <= '${value}'`)
    return this
  }

  like(column: string, pattern: string): this {
    this.conditions.push(`${column} LIKE '${pattern}'`)
    return this
  }

  ilike(column: string, pattern: string): this {
    this.conditions.push(`${column} ILIKE '${pattern}'`)
    return this
  }

  // ── Ordering + Limiting ───────────────────────────────────────────────────

  order(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByColumn = column
    this.orderDirection = direction
    return this
  }

  limit(n: number): this {
    this.limitValue = n
    return this
  }

  // ── Build SQL ─────────────────────────────────────────────────────────────

  private buildSQL(): string {
    let sql = `SELECT ${this.selectedColumns} FROM ${this.tableName}`
    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`
    }
    if (this.orderByColumn) {
      sql += ` ORDER BY ${this.orderByColumn} ${this.orderDirection}`
    }
    sql += ` LIMIT ${this.limitValue ?? 100}`
    return sql
  }

  // ── Execute ───────────────────────────────────────────────────────────────

  async execute<T = Record<string, unknown>>(): Promise<QueryResult<T>> {
    const sql = this.buildSQL()
    const endpoint = this.isScoped ? '/tenant/query' : '/db/query'
    return this.http.post<QueryResult<T>>(endpoint, { sql })
  }

  // ── Insert ────────────────────────────────────────────────────────────────

  async insert(data: Record<string, unknown>): Promise<{ id: number }> {
    const endpoint = this.isScoped ? '/tenant/insert' : '/db/insert'
    return this.http.post<{ id: number }>(endpoint, {
      table: this.tableName,
      data,
    })
  }

  // ── Create table ──────────────────────────────────────────────────────────

  async createTable(columns: ColumnDef[]): Promise<{ table: string; schema: string; status: string }> {
    return this.http.post('/tenant/tables', {
      name: this.tableName,
      columns,
    })
  }
}
