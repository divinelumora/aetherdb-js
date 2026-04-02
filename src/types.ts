export interface AetherDBConfig {
  url: string
  token?: string
  email?: string
  password?: string
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
  execution_time_ms: string
  error?: string
}

export interface TenantInfo {
  user_id: number
  schema: string
  connection_string: string
  host: string
  port: number
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
