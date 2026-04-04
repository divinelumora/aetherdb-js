"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AetherDB = void 0;
const http_1 = require("./http");
const query_builder_1 = require("./query-builder");
/**
 * AetherDB JavaScript Client
 *
 * @example
 * const db = new AetherDB({ url: 'https://app.aetherdb.cloud', token: 'your-jwt-token' })
 * const { rows } = await db.from('products').select('*').execute()
 * const result = await db.ai('how many products cost more than $20?')
 */
class AetherDB {
    constructor(config) {
        this.config = config;
        this.http = new http_1.HttpClient(config.url);
        if (config.token) {
            this.http.setToken(config.token);
        }
    }
    // ── Auth ──────────────────────────────────────────────────────────────────
    /**
     * Register a new user account.
     * The user's isolated database schema is auto-provisioned.
     */
    async register(email, password) {
        return this.http.post('/auth/register', { email, password });
    }
    /**
     * Sign in and get an access + refresh token.
     * The access token is automatically used for all subsequent requests.
     */
    async signIn(email, password) {
        const res = await this.http.post('/auth/login', { email, password });
        this.http.setToken(res.access_token);
        return res;
    }
    /**
     * Set a JWT token directly (e.g. after loading from storage).
     */
    setToken(token) {
        this.http.setToken(token);
    }
    /**
     * Get the current authenticated user's profile.
     */
    async getUser() {
        return this.http.get('/db/me');
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
    from(table) {
        return new query_builder_1.QueryBuilder(this.http, table, true);
    }
    /**
     * Get your tenant connection info including the postgres:// connection string.
     */
    async getTenantInfo() {
        return this.http.get('/tenant/info');
    }
    /**
     * Get the live schema of your isolated database — all tables and columns.
     */
    async getSchema() {
        return this.http.get('/tenant/schema');
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
    async createTable(name, columns) {
        return this.http.post('/tenant/tables', { name, columns });
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
    async ai(question) {
        return this.http.post('/tenant/ai/query', { question });
    }
    // ── Raw SQL ───────────────────────────────────────────────────────────────
    /**
     * Run a raw parameterized SELECT in your isolated schema.
     *
     * @example
     * const { rows } = await db.query('SELECT * FROM products WHERE price > $1', [20])
     */
    async query(sql, args) {
        return this.http.post('/tenant/query', { sql, args });
    }
    // ── Projects + API keys ───────────────────────────────────────────────────
    /**
     * List all your projects.
     */
    async listProjects() {
        return this.http.get('/db/projects');
    }
    /**
     * Create a new project.
     */
    async createProject(name, description) {
        return this.http.post('/db/projects', { name, description });
    }
    /**
     * List API keys for a project.
     */
    async listAPIKeys(projectId) {
        return this.http.get(`/db/projects/${projectId}/keys`);
    }
    /**
     * Generate an API key for a project.
     * The raw key is returned only once — save it immediately.
     */
    async createAPIKey(projectId, name) {
        return this.http.post(`/db/projects/${projectId}/keys`, { name });
    }
    /**
     * Revoke an API key.
     */
    async revokeAPIKey(projectId, keyId) {
        return this.http.delete(`/db/projects/${projectId}/keys/${keyId}`);
    }
    // ── Token refresh ─────────────────────────────────────────────────────────
    /**
     * Refresh an expired access token using a refresh token.
     * The new access token is automatically applied to all future requests.
     */
    async refreshToken(refreshToken) {
        const res = await this.http.post('/auth/refresh', { refresh_token: refreshToken });
        this.http.setToken(res.access_token);
        return res;
    }
    // ── File storage ──────────────────────────────────────────────────────────
    /**
     * List all files you have uploaded.
     */
    async listFiles() {
        return this.http.get('/db/files');
    }
    /**
     * Upload a file. Pass a browser File or a Node.js FormData.
     * Returns the stored file record (without the binary content).
     *
     * @example
     * const input = document.querySelector('input[type=file]')
     * const record = await db.uploadFile(input.files[0])
     */
    async uploadFile(file, filename) {
        const form = new FormData();
        form.append('file', file, filename);
        return this.http.upload('/db/files/upload', form);
    }
    /**
     * Download a file by id and return its Blob.
     *
     * @example
     * const blob = await db.downloadFile(42)
     * const url = URL.createObjectURL(blob)
     */
    async downloadFile(id) {
        return this.http.download(`/db/files/${id}`);
    }
    /**
     * Delete a file by id.
     */
    async deleteFile(id) {
        return this.http.delete(`/db/files/${id}`);
    }
    // ── Saved queries ─────────────────────────────────────────────────────────
    /**
     * List your saved queries (and public ones from other users).
     */
    async listSavedQueries() {
        return this.http.get('/db/queries/saved');
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
    async saveQuery(q) {
        return this.http.post('/db/queries/saved', q);
    }
    /**
     * Update an existing saved query (owner only).
     */
    async updateSavedQuery(id, q) {
        return this.http.put(`/db/queries/saved/${id}`, q);
    }
    /**
     * Delete a saved query (owner only).
     */
    async deleteSavedQuery(id) {
        return this.http.delete(`/db/queries/saved/${id}`);
    }
    /**
     * Execute a saved query by id and return its results.
     * Also increments the query's run_count.
     */
    async runSavedQuery(id) {
        return this.http.post(`/db/queries/saved/${id}/run`);
    }
    // ── Webhooks ──────────────────────────────────────────────────────────────
    /**
     * List all webhooks registered on your tenant tables.
     */
    async listWebhooks() {
        return this.http.get('/tenant/webhooks');
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
    async createWebhook(wh) {
        return this.http.post('/tenant/webhooks', wh);
    }
    /**
     * Enable or disable a webhook.
     */
    async toggleWebhook(id, active) {
        return this.http.post(`/tenant/webhooks/${id}/toggle`, { active });
    }
    /**
     * Delete a webhook.
     */
    async deleteWebhook(id) {
        return this.http.delete(`/tenant/webhooks/${id}`);
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
    async importData(file, tableName, format) {
        const form = new FormData();
        form.append('file', file);
        if (tableName)
            form.append('table', tableName);
        if (format)
            form.append('format', format);
        return this.http.upload('/tenant/import', form);
    }
    /**
     * Export a tenant table as CSV or JSON and return a Blob.
     * Automatically triggers a browser download when called with `download: true`.
     *
     * @example
     * const blob = await db.exportData('customers', 'csv')
     * const url = URL.createObjectURL(blob)
     */
    async exportData(tableName, format = 'csv') {
        return this.http.download(`/tenant/export?table=${encodeURIComponent(tableName)}&format=${format}`);
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
    async aiMigrate(instruction) {
        return this.http.post('/db/ai/migrate', { instruction });
    }
    /**
     * Sample rows from a tenant table and get AI-generated analysis and recommendations.
     *
     * @example
     * const insights = await db.aiInsights('orders')
     * console.log(insights.insights) // "Column 'amount' has outliers at rows 12, 45..."
     */
    async aiInsights(table, sampleSize = 200) {
        return this.http.post('/tenant/ai/insights', { table, sample_size: sampleSize });
    }
    // ── Metrics ───────────────────────────────────────────────────────────────
    /**
     * Get usage metrics for your account: query counts, error rate, DB size, storage used.
     */
    async getMetrics() {
        return this.http.get('/db/metrics');
    }
    // ── Audit logs ────────────────────────────────────────────────────────────
    /**
     * Retrieve your request audit log (last N entries).
     */
    async getAuditLogs(limit = 100, offset = 0) {
        return this.http.get(`/db/audit?limit=${limit}&offset=${offset}`);
    }
    // ── Health ────────────────────────────────────────────────────────────────
    /**
     * Check if AetherDB is reachable and the database is healthy.
     */
    async health() {
        return this.http.get('/health');
    }
}
exports.AetherDB = AetherDB;
//# sourceMappingURL=client.js.map