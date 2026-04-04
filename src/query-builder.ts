import { HttpClient } from './http'
import { QueryResult, ColumnDef } from './types'

/**
 * QueryBuilder provides a fluent interface for building and executing queries.
 * All filter values are passed as parameterized arguments — never interpolated
 * into the SQL string — to prevent SQL injection.
 *
 * @example
 * const { rows } = await db.from('products').select('title, price').eq('price', 29.99).execute()
 */
export class QueryBuilder {
  private http: HttpClient
  private tableName: string
  private selectedColumns: string = '*'
  private conditions: string[] = []
  private args: unknown[] = []
  private limitValue?: number
  private offsetValue?: number
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

  // ── Filters (parameterized) ───────────────────────────────────────────────

  /** WHERE column = value */
  eq(column: string, value: unknown): this {
    this.args.push(value)
    this.conditions.push(`"${column}" = $${this.args.length}`)
    return this
  }

  /** WHERE column != value */
  neq(column: string, value: unknown): this {
    this.args.push(value)
    this.conditions.push(`"${column}" != $${this.args.length}`)
    return this
  }

  /** WHERE column > value */
  gt(column: string, value: unknown): this {
    this.args.push(value)
    this.conditions.push(`"${column}" > $${this.args.length}`)
    return this
  }

  /** WHERE column >= value */
  gte(column: string, value: unknown): this {
    this.args.push(value)
    this.conditions.push(`"${column}" >= $${this.args.length}`)
    return this
  }

  /** WHERE column < value */
  lt(column: string, value: unknown): this {
    this.args.push(value)
    this.conditions.push(`"${column}" < $${this.args.length}`)
    return this
  }

  /** WHERE column <= value */
  lte(column: string, value: unknown): this {
    this.args.push(value)
    this.conditions.push(`"${column}" <= $${this.args.length}`)
    return this
  }

  /** WHERE column LIKE pattern  (use % as wildcard) */
  like(column: string, pattern: string): this {
    this.args.push(pattern)
    this.conditions.push(`"${column}" LIKE $${this.args.length}`)
    return this
  }

  /** WHERE column ILIKE pattern  (case-insensitive LIKE) */
  ilike(column: string, pattern: string): this {
    this.args.push(pattern)
    this.conditions.push(`"${column}" ILIKE $${this.args.length}`)
    return this
  }

  /** WHERE column IN (v1, v2, ...) */
  in(column: string, values: unknown[]): this {
    const placeholders = values.map(v => {
      this.args.push(v)
      return `$${this.args.length}`
    })
    this.conditions.push(`"${column}" IN (${placeholders.join(', ')})`)
    return this
  }

  /** WHERE column IS NULL */
  isNull(column: string): this {
    this.conditions.push(`"${column}" IS NULL`)
    return this
  }

  /** WHERE column IS NOT NULL */
  isNotNull(column: string): this {
    this.conditions.push(`"${column}" IS NOT NULL`)
    return this
  }

  /**
   * Generic filter — alias kept for convenience.
   * Prefer the typed methods (eq, gt, etc.) over this.
   */
  where(column: string, operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'ILIKE', value: unknown): this {
    this.args.push(value)
    this.conditions.push(`"${column}" ${operator} $${this.args.length}`)
    return this
  }

  // ── Ordering + Pagination ─────────────────────────────────────────────────

  order(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByColumn = column
    this.orderDirection = direction
    return this
  }

  limit(n: number): this {
    this.limitValue = n
    return this
  }

  offset(n: number): this {
    this.offsetValue = n
    return this
  }

  // ── Build SQL ─────────────────────────────────────────────────────────────

  private buildSQL(): string {
    let sql = `SELECT ${this.selectedColumns} FROM "${this.tableName}"`
    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`
    }
    if (this.orderByColumn) {
      sql += ` ORDER BY "${this.orderByColumn}" ${this.orderDirection}`
    }
    sql += ` LIMIT ${this.limitValue ?? 100}`
    if (this.offsetValue !== undefined) {
      sql += ` OFFSET ${this.offsetValue}`
    }
    return sql
  }

  // ── Execute (SELECT) ──────────────────────────────────────────────────────

  async execute<T = Record<string, unknown>>(): Promise<QueryResult<T>> {
    const sql = this.buildSQL()
    const endpoint = this.isScoped ? '/tenant/query' : '/db/query'
    return this.http.post<QueryResult<T>>(endpoint, { sql, args: this.args })
  }

  // ── Mutate ────────────────────────────────────────────────────────────────

  /**
   * Insert a row into this table.
   * Returns the new row's id.
   */
  async insert(data: Record<string, unknown>): Promise<{ id: number }> {
    const endpoint = this.isScoped ? '/tenant/insert' : '/db/insert'
    return this.http.post<{ id: number }>(endpoint, { table: this.tableName, data })
  }

  /**
   * Update rows that match the current WHERE conditions.
   * Requires at least one filter to be set (safety guard).
   *
   * @example
   * await db.from('products').eq('id', 5).update({ price: 24.99 })
   */
  async update(data: Record<string, unknown>): Promise<{ updated: number }> {
    if (this.conditions.length === 0) {
      throw new Error('update() requires at least one filter (eq, where, etc.) to prevent accidental full-table updates')
    }
    const endpoint = this.isScoped ? '/tenant/update' : '/db/update'
    // Build a where map from the first eq condition if possible.
    // For the parameterized /tenant/update endpoint we send structured data.
    return this.http.post<{ updated: number }>(endpoint, {
      table: this.tableName,
      data,
      where: this._buildWhereMap(),
    })
  }

  /**
   * Delete rows that match the current WHERE conditions.
   * Requires at least one filter (safety guard).
   *
   * @example
   * await db.from('products').eq('id', 5).delete()
   */
  async delete(): Promise<{ deleted: number }> {
    if (this.conditions.length === 0) {
      throw new Error('delete() requires at least one filter (eq, where, etc.) to prevent accidental full-table deletes')
    }
    const endpoint = this.isScoped ? '/tenant/delete' : '/db/delete'
    return this.http.post<{ deleted: number }>(endpoint, {
      table: this.tableName,
      where: this._buildWhereMap(),
    })
  }

  // ── Create table ──────────────────────────────────────────────────────────

  async createTable(columns: ColumnDef[]): Promise<{ table: string; schema: string; status: string }> {
    return this.http.post('/tenant/tables', { name: this.tableName, columns })
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  /**
   * Build a plain key→value map from eq() conditions for structured endpoints.
   * Only works when all conditions are simple equality checks.
   */
  private _buildWhereMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {}
    let argIdx = 0
    for (const cond of this.conditions) {
      const m = cond.match(/^"([^"]+)" = \$(\d+)$/)
      if (m) {
        map[m[1]] = this.args[parseInt(m[2]) - 1]
        argIdx++
      }
    }
    return map
  }
}
