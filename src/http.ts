declare function fetch(url: string, init?: Record<string, unknown>): Promise<{ok: boolean; status: number; json(): Promise<Record<string, unknown>>}>

export class HttpClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '')
  }

  setToken(token: string) {
    this.token = token
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.token) h['Authorization'] = `Bearer ${this.token}`
    return h
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      method: 'GET',
      headers: this.headers(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data['error'] as string) || `HTTP ${res.status}`)
    return data as unknown as T
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data['error'] as string) || `HTTP ${res.status}`)
    return data as unknown as T
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      method: 'DELETE',
      headers: this.headers(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data['error'] as string) || `HTTP ${res.status}`)
    return data as unknown as T
  }
}