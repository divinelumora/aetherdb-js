import { HttpClient } from './http';
import { QueryResult, ColumnDef } from './types';
/**
 * QueryBuilder provides a fluent interface for building and executing queries.
 * All filter values are passed as parameterized arguments — never interpolated
 * into the SQL string — to prevent SQL injection.
 *
 * @example
 * const { rows } = await db.from('products').select('title, price').eq('price', 29.99).execute()
 */
export declare class QueryBuilder {
    private http;
    private tableName;
    private selectedColumns;
    private conditions;
    private args;
    private limitValue?;
    private offsetValue?;
    private orderByColumn?;
    private orderDirection;
    private isScoped;
    constructor(http: HttpClient, table: string, scoped?: boolean);
    select(columns: string): this;
    /** WHERE column = value */
    eq(column: string, value: unknown): this;
    /** WHERE column != value */
    neq(column: string, value: unknown): this;
    /** WHERE column > value */
    gt(column: string, value: unknown): this;
    /** WHERE column >= value */
    gte(column: string, value: unknown): this;
    /** WHERE column < value */
    lt(column: string, value: unknown): this;
    /** WHERE column <= value */
    lte(column: string, value: unknown): this;
    /** WHERE column LIKE pattern  (use % as wildcard) */
    like(column: string, pattern: string): this;
    /** WHERE column ILIKE pattern  (case-insensitive LIKE) */
    ilike(column: string, pattern: string): this;
    /** WHERE column IN (v1, v2, ...) */
    in(column: string, values: unknown[]): this;
    /** WHERE column IS NULL */
    isNull(column: string): this;
    /** WHERE column IS NOT NULL */
    isNotNull(column: string): this;
    /**
     * Generic filter — alias kept for convenience.
     * Prefer the typed methods (eq, gt, etc.) over this.
     */
    where(column: string, operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'ILIKE', value: unknown): this;
    order(column: string, direction?: 'ASC' | 'DESC'): this;
    limit(n: number): this;
    offset(n: number): this;
    private buildSQL;
    execute<T = Record<string, unknown>>(): Promise<QueryResult<T>>;
    /**
     * Insert a row into this table.
     * Returns the new row's id.
     */
    insert(data: Record<string, unknown>): Promise<{
        id: number;
    }>;
    /**
     * Update rows that match the current WHERE conditions.
     * Requires at least one filter to be set (safety guard).
     *
     * @example
     * await db.from('products').eq('id', 5).update({ price: 24.99 })
     */
    update(data: Record<string, unknown>): Promise<{
        updated: number;
    }>;
    /**
     * Delete rows that match the current WHERE conditions.
     * Requires at least one filter (safety guard).
     *
     * @example
     * await db.from('products').eq('id', 5).delete()
     */
    delete(): Promise<{
        deleted: number;
    }>;
    createTable(columns: ColumnDef[]): Promise<{
        table: string;
        schema: string;
        status: string;
    }>;
    /**
     * Build a plain key→value map from eq() conditions for structured endpoints.
     * Only works when all conditions are simple equality checks.
     */
    private _buildWhereMap;
}
//# sourceMappingURL=query-builder.d.ts.map