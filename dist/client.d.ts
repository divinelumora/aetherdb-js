import { QueryBuilder } from './query-builder';
import { AetherDBConfig, AuthResponse, TenantInfo, TableSchema, AIQueryResult, ColumnDef } from './types';
/**
 * AetherDB JavaScript Client
 *
 * @example
 * const db = new AetherDB({ url: 'https://aetherdb.cloud', token: 'your-jwt-token' })
 * const { rows } = await db.from('products').select('*').execute()
 * const result = await db.ai('how many products cost more than $20?')
 */
export declare class AetherDB {
    private http;
    private config;
    constructor(config: AetherDBConfig);
    /**
     * Register a new user account.
     * The user's isolated database schema is auto-provisioned.
     */
    register(email: string, password: string): Promise<{
        id: number;
        email: string;
        schema: string;
    }>;
    /**
     * Sign in and get an access token.
     * The token is automatically used for all subsequent requests.
     */
    signIn(email: string, password: string): Promise<AuthResponse>;
    /**
     * Set a JWT token directly (if you already have one).
     */
    setToken(token: string): void;
    /**
     * Get the current user's profile and schema info.
     */
    getUser(): Promise<{
        id: number;
        email: string;
        role: string;
        schema: string;
    }>;
    /**
     * Start building a query on a table in your isolated schema.
     *
     * @example
     * const { rows } = await db.from('products').select('title, price').eq('price', 29.99).execute()
     */
    from(table: string): QueryBuilder;
    /**
     * Get your tenant connection info including the postgres:// connection string.
     */
    getTenantInfo(): Promise<TenantInfo>;
    /**
     * Get the schema of your isolated database — all tables and columns.
     */
    getSchema(): Promise<{
        schema: string;
        tables: TableSchema[];
        table_count: number;
    }>;
    /**
     * Create a new table in your isolated schema.
     *
     * @example
     * await db.createTable('products', [
     *   { name: 'title', type: 'TEXT', nullable: false },
     *   { name: 'price', type: 'NUMERIC', nullable: false },
     * ])
     */
    createTable(name: string, columns: ColumnDef[]): Promise<{
        table: string;
        schema: string;
    }>;
    /**
     * Ask a natural language question about your data.
     * AetherDB generates and executes the SQL automatically.
     *
     * @example
     * const result = await db.ai('how many products cost more than $20?')
     * console.log(result.generated_sql) // SELECT COUNT(*) FROM products WHERE price > 20
     * console.log(result.rows)          // [{ count: 5 }]
     */
    ai<T = Record<string, unknown>>(question: string): Promise<AIQueryResult<T>>;
    /**
     * Run a raw SELECT query in your isolated schema.
     */
    query<T = Record<string, unknown>>(sql: string): Promise<{
        rows: T[];
        count: number;
    }>;
    /**
     * List all your projects.
     */
    listProjects(): Promise<{
        projects: unknown[];
        count: number;
    }>;
    /**
     * Create a new project.
     */
    createProject(name: string, description?: string): Promise<unknown>;
    /**
     * Generate an API key for a project.
     * The raw key is returned only once — save it immediately.
     */
    createAPIKey(projectId: number, name: string): Promise<{
        key: string;
        key_prefix: string;
        warning: string;
    }>;
    /**
     * Check if AetherDB is running.
     */
    health(): Promise<{
        status: string;
        service: string;
    }>;
}
//# sourceMappingURL=client.d.ts.map