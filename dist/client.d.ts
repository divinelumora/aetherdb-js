import { QueryBuilder } from './query-builder';
import { AetherDBConfig, AuthResponse, TenantInfo, TableSchema, AIQueryResult, ColumnDef, Project, APIKey, UserProfile, FileRecord, SavedQuery, Webhook, ImportResult, Metrics, Plan, Subscription, UsageStats, AdminUser, AdminStats } from './types';
/**
 * AetherDB JavaScript Client
 *
 * @example
 * const db = new AetherDB({ url: 'https://app.aetherdb.cloud', token: 'your-jwt-token' })
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
     * Sign in and get an access + refresh token.
     * The access token is automatically used for all subsequent requests.
     */
    signIn(email: string, password: string): Promise<AuthResponse>;
    /**
     * Set a JWT token directly (e.g. after loading from storage).
     */
    setToken(token: string): void;
    /**
     * Get the current authenticated user's profile.
     */
    getUser(): Promise<UserProfile>;
    /**
     * Start building a query on a table in your isolated schema.
     *
     * @example
     * const { rows } = await db.from('products').select('title, price').eq('price', 29.99).execute()
     * await db.from('products').eq('id', 5).update({ price: 24.99 })
     * await db.from('products').eq('id', 5).delete()
     */
    from(table: string): QueryBuilder;
    /**
     * Get your tenant connection info including the postgres:// connection string.
     */
    getTenantInfo(): Promise<TenantInfo>;
    /**
     * Get the live schema of your isolated database — all tables and columns.
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
     * AetherDB generates and runs the SQL automatically.
     *
     * @example
     * const result = await db.ai('how many products cost more than $20?')
     * console.log(result.generated_sql) // SELECT COUNT(*) FROM products WHERE price > 20
     * console.log(result.rows)          // [{ count: 5 }]
     */
    ai<T = Record<string, unknown>>(question: string): Promise<AIQueryResult<T>>;
    /**
     * Run a raw parameterized SELECT in your isolated schema.
     *
     * @example
     * const { rows } = await db.query('SELECT * FROM products WHERE price > $1', [20])
     */
    query<T = Record<string, unknown>>(sql: string, args?: unknown[]): Promise<{
        rows: T[];
        count: number;
    }>;
    /**
     * List all your projects.
     */
    listProjects(): Promise<{
        projects: Project[];
        count: number;
    }>;
    /**
     * Create a new project.
     */
    createProject(name: string, description?: string): Promise<Project>;
    /**
     * List API keys for a project.
     */
    listAPIKeys(projectId: number): Promise<{
        keys: APIKey[];
        count: number;
    }>;
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
     * Revoke an API key.
     */
    revokeAPIKey(projectId: number, keyId: number): Promise<{
        status: string;
    }>;
    /**
     * Refresh an expired access token using a refresh token.
     * The new access token is automatically applied to all future requests.
     */
    refreshToken(refreshToken: string): Promise<AuthResponse>;
    /**
     * List all files you have uploaded.
     */
    listFiles(): Promise<{
        files: FileRecord[];
        count: number;
    }>;
    /**
     * Upload a file. Pass a browser File or a Node.js FormData.
     * Returns the stored file record (without the binary content).
     *
     * @example
     * const input = document.querySelector('input[type=file]')
     * const record = await db.uploadFile(input.files[0])
     */
    uploadFile(file: File | Blob, filename?: string): Promise<FileRecord>;
    /**
     * Download a file by id and return its Blob.
     *
     * @example
     * const blob = await db.downloadFile(42)
     * const url = URL.createObjectURL(blob)
     */
    downloadFile(id: number): Promise<Blob>;
    /**
     * Delete a file by id.
     */
    deleteFile(id: number): Promise<{
        status: string;
    }>;
    /**
     * List your saved queries (and public ones from other users).
     */
    listSavedQueries(): Promise<{
        queries: SavedQuery[];
        count: number;
    }>;
    /**
     * Save a named SQL query for later reuse.
     *
     * @example
     * const q = await db.saveQuery({
     *   name: 'Monthly revenue',
     *   sql: 'SELECT sum(amount) FROM orders WHERE created_at > now() - interval \'30 days\'',
     *   tags: ['finance'],
     * })
     */
    saveQuery(q: {
        name: string;
        sql: string;
        description?: string;
        is_public?: boolean;
        tags?: string[];
    }): Promise<SavedQuery>;
    /**
     * Update an existing saved query (owner only).
     */
    updateSavedQuery(id: number, q: {
        name: string;
        sql: string;
        description?: string;
        is_public?: boolean;
        tags?: string[];
    }): Promise<SavedQuery>;
    /**
     * Delete a saved query (owner only).
     */
    deleteSavedQuery(id: number): Promise<{
        status: string;
    }>;
    /**
     * Execute a saved query by id and return its results.
     * Also increments the query's run_count.
     */
    runSavedQuery<T = Record<string, unknown>>(id: number): Promise<{
        rows: T[];
        count: number;
    }>;
    /**
     * List all webhooks registered on your tenant tables.
     */
    listWebhooks(): Promise<{
        webhooks: Webhook[];
        count: number;
    }>;
    /**
     * Register an HTTP webhook that fires when data changes.
     * Requests are signed with HMAC-SHA256 if a secret is provided.
     *
     * @example
     * await db.createWebhook({
     *   table_name: 'orders',
     *   events: ['insert', 'update'],
     *   url: 'https://your-app.com/webhook',
     *   secret: 'supersecret',
     * })
     */
    createWebhook(wh: {
        table_name: string;
        events?: string[];
        url: string;
        secret?: string;
    }): Promise<Webhook>;
    /**
     * Enable or disable a webhook.
     */
    toggleWebhook(id: number, active: boolean): Promise<{
        active: boolean;
    }>;
    /**
     * Delete a webhook.
     */
    deleteWebhook(id: number): Promise<{
        status: string;
    }>;
    /**
     * Bulk-import data from a CSV or JSON file into your tenant database.
     * The target table is auto-created with TEXT columns if it does not exist.
     *
     * @example
     * const input = document.querySelector('input[type=file]')
     * const result = await db.importData(input.files[0], 'customers')
     * console.log(`Imported ${result.imported} rows into ${result.table}`)
     */
    importData(file: File | Blob, tableName?: string, format?: 'csv' | 'json'): Promise<ImportResult>;
    /**
     * Export a tenant table as CSV or JSON and return a Blob.
     * Automatically triggers a browser download when called with `download: true`.
     *
     * @example
     * const blob = await db.exportData('customers', 'csv')
     * const url = URL.createObjectURL(blob)
     */
    exportData(tableName: string, format?: 'csv' | 'json'): Promise<Blob>;
    /**
     * Convert a plain-English instruction into DDL SQL (ALTER TABLE, ADD COLUMN, etc.).
     * The generated SQL is returned for review — it is NOT automatically executed.
     *
     * @example
     * const result = await db.aiMigrate('Add an email column to the products table')
     * console.log(result.generated_sql) // ALTER TABLE products ADD COLUMN email TEXT;
     * // Review it, then run: await db.rawQuery(result.generated_sql)
     */
    aiMigrate(instruction: string): Promise<{
        instruction: string;
        generated_sql: string;
        warning: string;
    }>;
    /**
     * Sample rows from a tenant table and get AI-generated analysis and recommendations.
     *
     * @example
     * const insights = await db.aiInsights('orders')
     * console.log(insights.insights) // "Column 'amount' has outliers at rows 12, 45..."
     */
    aiInsights(table: string, sampleSize?: number): Promise<{
        table: string;
        sample_rows: number;
        insights: string;
    }>;
    /**
     * Get usage metrics for your account: query counts, error rate, DB size, storage used.
     */
    getMetrics(): Promise<Metrics>;
    /**
     * Retrieve your request audit log (last N entries).
     */
    getAuditLogs(limit?: number, offset?: number): Promise<{
        logs: Array<{
            id: number;
            method: string;
            path: string;
            status: number;
            duration_ms: number;
            created_at: string;
        }>;
        count: number;
    }>;
    /**
     * List all available plans (free, pro, team) with their limits and pricing.
     */
    listPlans(): Promise<Plan[]>;
    /**
     * Get your current subscription details (plan, status, period dates, limits).
     * A free subscription is auto-created on first call.
     */
    getSubscription(): Promise<Subscription>;
    /**
     * Get live usage stats for the current billing period (queries, AI calls, storage).
     */
    getUsageStats(): Promise<UsageStats>;
    /**
     * Start a Stripe Checkout session to upgrade to pro or team.
     * Returns a redirect URL — navigate the user there to complete payment.
     *
     * @example
     * const { url } = await db.createCheckoutSession('pro')
     * window.location.href = url
     */
    createCheckoutSession(plan: 'pro' | 'team'): Promise<{
        url: string;
    }>;
    /**
     * Open the Stripe Customer Portal so the user can manage or cancel their subscription.
     * Returns a redirect URL.
     */
    createPortalSession(): Promise<{
        url: string;
    }>;
    /**
     * Get platform-wide aggregate stats (total users, queries today, subscribers).
     * Requires admin role.
     */
    adminGetStats(): Promise<AdminStats>;
    /**
     * List all users with enriched subscription and usage data.
     * Requires admin role.
     */
    adminListUsers(limit?: number, offset?: number): Promise<{
        users: AdminUser[];
        total: number;
    }>;
    /**
     * Suspend a user account. Suspended users cannot authenticate.
     * Requires admin role.
     */
    adminSuspendUser(userID: number): Promise<{
        status: string;
    }>;
    /**
     * Lift a user suspension.
     * Requires admin role.
     */
    adminUnsuspendUser(userID: number): Promise<{
        status: string;
    }>;
    /**
     * Override a user plan without going through Stripe (e.g., grant free trial of pro).
     * Requires admin role.
     */
    adminChangePlan(userID: number, plan: 'free' | 'pro' | 'team'): Promise<{
        plan: string;
    }>;
    /**
     * Permanently delete a user and all their data.
     * Requires admin role. Irreversible.
     */
    adminDeleteUser(userID: number): Promise<void>;
    /**
     * Check if AetherDB is reachable and the database is healthy.
     */
    health(): Promise<{
        status: string;
        service: string;
    }>;
}
//# sourceMappingURL=client.d.ts.map