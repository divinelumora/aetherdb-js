import { HttpClient } from './http'
import { QueryBuilder } from './query-builder'
import {
  AetherDBConfig,
  AuthResponse,
  TenantInfo,
  TableSchema,
  AIQueryResult,
  ColumnDef,
  Project,
  APIKey,
  UserProfile,
  FileRecord,
  SavedQuery,
  Webhook,
  ImportResult,
  Metrics,
  Plan,
  Subscription,
  UsageStats,
  AdminUser,
  AdminStats,
} from './types'

/**
 * AetherDB JavaScript Client
 *
 * @example
 * const db = new AetherDB({ url: 'https://app.aetherdb.cloud', token: 'your-jwt-token' })
 * const { rows } = await db.from('products').select('*').execute()
 * const result = await db.ai('how many products cost more than $20?')
 */
export class AetherDB {
  private http: HttpClient
  private config: AetherDBConfig

  constructor(config: AetherDBConfig) {
    this.config = config
    this.http = new HttpClient(config.url)
    if (config.token) {
      this.http.setToken(config.token)
    }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  /**
   * Register a new user account.
   * The user's isolated database schema is auto-provisioned.
   */
  async register(email: string, password: string): Promise<{ id: number; email: string; schema: string }> {
    return this.http.post('/auth/register', { email, password })
  }

  /**
   * Sign in and get an access + refresh token.
   * The access token is automatically used for all subsequent requests.
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const res = await this.http.post<AuthResponse>('/auth/login', { email, password })
    this.http.setToken(res.access_token)
    return res
  }

  /**
   * Set a JWT token directly (e.g. after loading from storage).
   */
  setToken(token: string): void {
    this.http.setToken(token)
  }

  /**
   * Get the current authenticated user's profile.
   */
  async getUser(): Promise<UserProfile> {
    return this.http.get('/db/me')
  }

  // ── Tenant database ───────────────────────────────────────────────────────

  /**
   * Start building a query on a table in your isolated schema.
   *
   * @example
   * const { rows } = await db.from('products').select('title, price').eq('price', 29.99).execute()
   * await db.from('products').eq('id', 5).update({ price: 24.99 })
   * await db.from('products').eq('id', 5).delete()
   */
  from(table: string): QueryBuilder {
    return new QueryBuilder(this.http, table, true)
  }

  /**
   * Get your tenant connection info including the postgres:// connection string.
   */
  async getTenantInfo(): Promise<TenantInfo> {
    return this.http.get('/tenant/info')
  }

  /**
   * Get the live schema of your isolated database — all tables and columns.
   */
  async getSchema(): Promise<{ schema: string; tables: TableSchema[]; table_count: number }> {
    return this.http.get('/tenant/schema')
  }

  /**
   * Create a new table in your isolated schema.
   *
   * @example
   * await db.createTable('products', [
   *   { name: 'title', type: 'TEXT', nullable: false },
   *   { name: 'price', type: 'NUMERIC', nullable: false },
   * ])
   */
  async createTable(name: string, columns: ColumnDef[]): Promise<{ table: string; schema: string }> {
    return this.http.post('/tenant/tables', { name, columns })
  }

  // ── AI ────────────────────────────────────────────────────────────────────

  /**
   * Ask a natural language question about your data.
   * AetherDB generates and runs the SQL automatically.
   *
   * @example
   * const result = await db.ai('how many products cost more than $20?')
   * console.log(result.generated_sql) // SELECT COUNT(*) FROM products WHERE price > 20
   * console.log(result.rows)          // [{ count: 5 }]
   */
  async ai<T = Record<string, unknown>>(question: string): Promise<AIQueryResult<T>> {
    return this.http.post<AIQueryResult<T>>('/tenant/ai/query', { question })
  }

  // ── Raw SQL ───────────────────────────────────────────────────────────────

  /**
   * Run a raw parameterized SELECT in your isolated schema.
   *
   * @example
   * const { rows } = await db.query('SELECT * FROM products WHERE price > $1', [20])
   */
  async query<T = Record<string, unknown>>(sql: string, args?: unknown[]): Promise<{ rows: T[]; count: number }> {
    return this.http.post('/tenant/query', { sql, args })
  }

  // ── Projects + API keys ───────────────────────────────────────────────────

  /**
   * List all your projects.
   */
  async listProjects(): Promise<{ projects: Project[]; count: number }> {
    return this.http.get('/db/projects')
  }

  /**
   * Create a new project.
   */
  async createProject(name: string, description?: string): Promise<Project> {
    return this.http.post('/db/projects', { name, description })
  }

  /**
   * List API keys for a project.
   */
  async listAPIKeys(projectId: number): Promise<{ keys: APIKey[]; count: number }> {
    return this.http.get(`/db/projects/${projectId}/keys`)
  }

  /**
   * Generate an API key for a project.
   * The raw key is returned only once — save it immediately.
   */
  async createAPIKey(projectId: number, name: string): Promise<{ key: string; key_prefix: string; warning: string }> {
    return this.http.post(`/db/projects/${projectId}/keys`, { name })
  }

  /**
   * Revoke an API key.
   */
  async revokeAPIKey(projectId: number, keyId: number): Promise<{ status: string }> {
    return this.http.delete(`/db/projects/${projectId}/keys/${keyId}`)
  }

  // ── Token refresh ─────────────────────────────────────────────────────────

  /**
   * Refresh an expired access token using a refresh token.
   * The new access token is automatically applied to all future requests.
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const res = await this.http.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken })
    this.http.setToken(res.access_token)
    return res
  }

  // ── File storage ──────────────────────────────────────────────────────────

  /**
   * List all files you have uploaded.
   */
  async listFiles(): Promise<{ files: FileRecord[]; count: number }> {
    return this.http.get('/db/files')
  }

  /**
   * Upload a file. Pass a browser File or a Node.js FormData.
   * Returns the stored file record (without the binary content).
   *
   * @example
   * const input = document.querySelector('input[type=file]')
   * const record = await db.uploadFile(input.files[0])
   */
  async uploadFile(file: File | Blob, filename?: string): Promise<FileRecord> {
    const form = new FormData()
    form.append('file', file, filename)
    return this.http.upload<FileRecord>('/db/files/upload', form)
  }

  /**
   * Download a file by id and return its Blob.
   *
   * @example
   * const blob = await db.downloadFile(42)
   * const url = URL.createObjectURL(blob)
   */
  async downloadFile(id: number): Promise<Blob> {
    return this.http.download(`/db/files/${id}`)
  }

  /**
   * Delete a file by id.
   */
  async deleteFile(id: number): Promise<{ status: string }> {
    return this.http.delete(`/db/files/${id}`)
  }

  // ── Saved queries ─────────────────────────────────────────────────────────

  /**
   * List your saved queries (and public ones from other users).
   */
  async listSavedQueries(): Promise<{ queries: SavedQuery[]; count: number }> {
    return this.http.get('/db/queries/saved')
  }

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
  async saveQuery(q: {
    name: string
    sql: string
    description?: string
    is_public?: boolean
    tags?: string[]
  }): Promise<SavedQuery> {
    return this.http.post('/db/queries/saved', q)
  }

  /**
   * Update an existing saved query (owner only).
   */
  async updateSavedQuery(id: number, q: {
    name: string
    sql: string
    description?: string
    is_public?: boolean
    tags?: string[]
  }): Promise<SavedQuery> {
    return this.http.put(`/db/queries/saved/${id}`, q)
  }

  /**
   * Delete a saved query (owner only).
   */
  async deleteSavedQuery(id: number): Promise<{ status: string }> {
    return this.http.delete(`/db/queries/saved/${id}`)
  }

  /**
   * Execute a saved query by id and return its results.
   * Also increments the query's run_count.
   */
  async runSavedQuery<T = Record<string, unknown>>(id: number): Promise<{ rows: T[]; count: number }> {
    return this.http.post(`/db/queries/saved/${id}/run`)
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  /**
   * List all webhooks registered on your tenant tables.
   */
  async listWebhooks(): Promise<{ webhooks: Webhook[]; count: number }> {
    return this.http.get('/tenant/webhooks')
  }

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
  async createWebhook(wh: {
    table_name: string
    events?: string[]
    url: string
    secret?: string
  }): Promise<Webhook> {
    return this.http.post('/tenant/webhooks', wh)
  }

  /**
   * Enable or disable a webhook.
   */
  async toggleWebhook(id: number, active: boolean): Promise<{ active: boolean }> {
    return this.http.post(`/tenant/webhooks/${id}/toggle`, { active })
  }

  /**
   * Delete a webhook.
   */
  async deleteWebhook(id: number): Promise<{ status: string }> {
    return this.http.delete(`/tenant/webhooks/${id}`)
  }

  // ── Import / Export ───────────────────────────────────────────────────────

  /**
   * Bulk-import data from a CSV or JSON file into your tenant database.
   * The target table is auto-created with TEXT columns if it does not exist.
   *
   * @example
   * const input = document.querySelector('input[type=file]')
   * const result = await db.importData(input.files[0], 'customers')
   * console.log(`Imported ${result.imported} rows into ${result.table}`)
   */
  async importData(file: File | Blob, tableName?: string, format?: 'csv' | 'json'): Promise<ImportResult> {
    const form = new FormData()
    form.append('file', file)
    if (tableName) form.append('table', tableName)
    if (format) form.append('format', format)
    return this.http.upload<ImportResult>('/tenant/import', form)
  }

  /**
   * Export a tenant table as CSV or JSON and return a Blob.
   * Automatically triggers a browser download when called with `download: true`.
   *
   * @example
   * const blob = await db.exportData('customers', 'csv')
   * const url = URL.createObjectURL(blob)
   */
  async exportData(tableName: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    return this.http.download(`/tenant/export?table=${encodeURIComponent(tableName)}&format=${format}`)
  }

  // ── AI advanced ───────────────────────────────────────────────────────────

  /**
   * Convert a plain-English instruction into DDL SQL (ALTER TABLE, ADD COLUMN, etc.).
   * The generated SQL is returned for review — it is NOT automatically executed.
   *
   * @example
   * const result = await db.aiMigrate('Add an email column to the products table')
   * console.log(result.generated_sql) // ALTER TABLE products ADD COLUMN email TEXT;
   * // Review it, then run: await db.rawQuery(result.generated_sql)
   */
  async aiMigrate(instruction: string): Promise<{ instruction: string; generated_sql: string; warning: string }> {
    return this.http.post('/db/ai/migrate', { instruction })
  }

  /**
   * Sample rows from a tenant table and get AI-generated analysis and recommendations.
   *
   * @example
   * const insights = await db.aiInsights('orders')
   * console.log(insights.insights) // "Column 'amount' has outliers at rows 12, 45..."
   */
  async aiInsights(table: string, sampleSize = 200): Promise<{ table: string; sample_rows: number; insights: string }> {
    return this.http.post('/tenant/ai/insights', { table, sample_size: sampleSize })
  }

  // ── Metrics ───────────────────────────────────────────────────────────────

  /**
   * Get usage metrics for your account: query counts, error rate, DB size, storage used.
   */
  async getMetrics(): Promise<Metrics> {
    return this.http.get('/db/metrics')
  }

  // ── Audit logs ────────────────────────────────────────────────────────────

  /**
   * Retrieve your request audit log (last N entries).
   */
  async getAuditLogs(limit = 100, offset = 0): Promise<{
    logs: Array<{ id: number; method: string; path: string; status: number; duration_ms: number; created_at: string }>
    count: number
  }> {
    return this.http.get(`/db/audit?limit=${limit}&offset=${offset}`)
  }

  // ── Billing ───────────────────────────────────────────────────────────────

  /**
   * List all available plans (free, pro, team) with their limits and pricing.
   */
  async listPlans(): Promise<Plan[]> {
    return this.http.get('/billing/plans')
  }

  /**
   * Get your current subscription details (plan, status, period dates, limits).
   * A free subscription is auto-created on first call.
   */
  async getSubscription(): Promise<Subscription> {
    return this.http.get('/billing/subscription')
  }

  /**
   * Get live usage stats for the current billing period (queries, AI calls, storage).
   */
  async getUsageStats(): Promise<UsageStats> {
    return this.http.get('/billing/usage')
  }

  /**
   * Start a Stripe Checkout session to upgrade to pro or team.
   * Returns a redirect URL — navigate the user there to complete payment.
   *
   * @example
   * const { url } = await db.createCheckoutSession('pro')
   * window.location.href = url
   */
  async createCheckoutSession(plan: 'pro' | 'team'): Promise<{ url: string }> {
    return this.http.post('/billing/checkout', { plan })
  }

  /**
   * Open the Stripe Customer Portal so the user can manage or cancel their subscription.
   * Returns a redirect URL.
   */
  async createPortalSession(): Promise<{ url: string }> {
    return this.http.post('/billing/portal')
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  // All admin methods require an account with role="admin".

  /**
   * Get platform-wide aggregate stats (total users, queries today, subscribers).
   * Requires admin role.
   */
  async adminGetStats(): Promise<AdminStats> {
    return this.http.get('/admin/stats')
  }

  /**
   * List all users with enriched subscription and usage data.
   * Requires admin role.
   */
  async adminListUsers(limit = 50, offset = 0): Promise<{ users: AdminUser[]; total: number }> {
    return this.http.get(`/admin/users?limit=${limit}&offset=${offset}`)
  }

  /**
   * Suspend a user account. Suspended users cannot authenticate.
   * Requires admin role.
   */
  async adminSuspendUser(userID: number): Promise<{ status: string }> {
    return this.http.post(`/admin/users/${userID}/suspend`)
  }

  /**
   * Lift a user suspension.
   * Requires admin role.
   */
  async adminUnsuspendUser(userID: number): Promise<{ status: string }> {
    return this.http.post(`/admin/users/${userID}/unsuspend`)
  }

  /**
   * Override a user plan without going through Stripe (e.g., grant free trial of pro).
   * Requires admin role.
   */
  async adminChangePlan(userID: number, plan: 'free' | 'pro' | 'team'): Promise<{ plan: string }> {
    return this.http.patch(`/admin/users/${userID}/plan`, { plan })
  }

  /**
   * Permanently delete a user and all their data.
   * Requires admin role. Irreversible.
   */
  async adminDeleteUser(userID: number): Promise<void> {
    return this.http.delete(`/admin/users/${userID}`)
  }

  // ── Health ────────────────────────────────────────────────────────────────

  /**
   * Check if AetherDB is reachable and the database is healthy.
   */
  async health(): Promise<{ status: string; service: string }> {
    return this.http.get('/health')
  }
}
