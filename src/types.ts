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
