"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AetherDB = void 0;
const http_1 = require("./http");
const query_builder_1 = require("./query-builder");
/**
 * AetherDB JavaScript Client
 *
 * @example
 * const db = new AetherDB({ url: 'https://aetherdb.cloud', token: 'your-jwt-token' })
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
     * Sign in and get an access token.
     * The token is automatically used for all subsequent requests.
     */
    async signIn(email, password) {
        const res = await this.http.post('/auth/login', { email, password });
        this.http.setToken(res.access_token);
        return res;
    }
    /**
     * Set a JWT token directly (if you already have one).
     */
    setToken(token) {
        this.http.setToken(token);
    }
    /**
     * Get the current user's profile and schema info.
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
     * Get the schema of your isolated database — all tables and columns.
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
     * AetherDB generates and executes the SQL automatically.
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
     * Run a raw SELECT query in your isolated schema.
     */
    async query(sql) {
        return this.http.post('/tenant/query', { sql });
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
     * Generate an API key for a project.
     * The raw key is returned only once — save it immediately.
     */
    async createAPIKey(projectId, name) {
        return this.http.post(`/db/projects/${projectId}/keys`, { name });
    }
    // ── Health ────────────────────────────────────────────────────────────────
    /**
     * Check if AetherDB is running.
     */
    async health() {
        return this.http.get('/health');
    }
}
exports.AetherDB = AetherDB;
//# sourceMappingURL=client.js.map