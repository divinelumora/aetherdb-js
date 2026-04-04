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

  // ── Health ────────────────────────────────────────────────────────────────

  /**
   * Check if AetherDB is reachable and the database is healthy.
   */
  async health(): Promise<{ status: string; service: string }> {
    return this.http.get('/health')
  }
}
