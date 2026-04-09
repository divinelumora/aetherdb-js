export interface AetherDBConfig {
  url: string
  token?: string
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[]
  count: number
  error?: string
}

export interface AIQueryResult<T = Record<string, unknown>> {
  question: string
  generated_sql: string
  rows: T[]
  row_count: number
  /** Execution time in milliseconds */
  execution_time_ms: number
  error?: string
}

export interface TenantInfo {
  user_id: number
  schema: string
  connection_string: string
  note: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: {
    id: number
    email: string
    role: string
    schema: string
  }
}

export interface TableColumn {
  name: string
  type: string
  nullable: boolean
  primary_key: boolean
}

export interface TableSchema {
  name: string
  columns: TableColumn[]
}

export interface ColumnDef {
  name: string
  type: string
  nullable?: boolean
  default?: string
}

export interface Project {
  id: number
  name: string
  description?: string
  owner_id: number
  created_at: string
}

export interface APIKey {
  id: number
  project_id: number
  name: string
  key_prefix: string
  created_at: string
  expires_at?: string
}

export interface UserProfile {
  id: number
  email: string
  role: string
  schema: string
}

export interface FileRecord {
  id: number
  filename: string
  content_type: string
  size: number
  created_at: string
}

export interface SavedQuery {
  id: number
  user_id: number
  name: string
  description?: string
  sql: string
  is_public: boolean
  tags: string[]
  run_count: number
  last_run?: string
  created_at: string
  updated_at: string
}

export interface Webhook {
  id: number
  user_id: number
  table_name: string
  events: string[]
  url: string
  secret?: string
  is_active: boolean
  fail_count: number
  last_fired?: string
  created_at: string
}

export interface ImportResult {
  table: string
  columns: string[]
  imported: number
}

export interface Metrics {
  queries_24h: number
  queries_1h: number
  avg_duration_ms: number
  errors_24h: number
  error_rate: number
  db_size_bytes: number
  db_size_pretty: string
  active_connections: number
  total_files: number
  storage_used_bytes: number
  top_paths: Array<{ path: string; count: number; avg_ms: number }>
}

export interface Plan {
  id: number
  name: string
  price_monthly: number
  query_limit: number
  storage_limit_mb: number
  file_limit_mb: number
  ai_calls_limit: number
  stripe_price_id: string | null
}

export interface Subscription {
  id: number
  user_id: number
  plan_id: number
  plan_name: string
  price_monthly: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  query_limit: number
  storage_limit_mb: number
  file_limit_mb: number
  ai_calls_limit: number
}

export interface UsageStats {
  period_start: string
  period_end: string
  queries_used: number
  api_calls: number
  ai_calls: number
  storage_mb: number
  file_size_mb: number
  query_limit: number
  storage_limit_mb: number
  file_limit_mb: number
  ai_calls_limit: number
}

export interface AdminUser {
  id: number
  email: string
  role: string
  is_admin: boolean
  suspended: boolean
  email_verified: boolean
  created_at: string
  plan_name: string
  sub_status: string
  queries_month: number
  api_calls_month: number
  file_size_mb: number
  last_active: string | null
}

export interface AdminStats {
  total_users: number
  active_users: number
  suspended_users: number
  total_queries_today: number
  total_api_calls_today: number
  pro_subscribers: number
  team_subscribers: number
  total_file_size_mb: number
}
