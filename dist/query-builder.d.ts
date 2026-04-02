import { HttpClient } from './http';
import { QueryResult, ColumnDef } from './types';
/**
 * QueryBuilder provides a fluent interface for building and executing queries.
 *
 * Usage:
 *   const rows = await db.from('products').select('title, price').eq('price', 29.99).execute()
 */
export declare class QueryBuilder {
    private http;
    private tableName;
    private selectedColumns;
    private conditions;
    private limitValue?;
    private orderByColumn?;
    private orderDirection;
    private isScoped;
    constructor(http: HttpClient, table: string, scoped?: boolean);
    select(columns: string): this;
    eq(column: string, value: unknown): this;
    neq(column: string, value: unknown): this;
    gt(column: string, value: unknown): this;
    gte(column: string, value: unknown): this;
    lt(column: string, value: unknown): this;
    lte(column: string, value: unknown): this;
    like(column: string, pattern: string): this;
    ilike(column: string, pattern: string): this;
    order(column: string, direction?: 'ASC' | 'DESC'): this;
    limit(n: number): this;
    private buildSQL;
    execute<T = Record<string, unknown>>(): Promise<QueryResult<T>>;
    insert(data: Record<string, unknown>): Promise<{
        id: number;
    }>;
    createTable(columns: ColumnDef[]): Promise<{
        table: string;
        schema: string;
        status: string;
    }>;
}
//# sourceMappingURL=query-builder.d.ts.map