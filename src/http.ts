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

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      method: 'PUT',
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

  /** Upload a file using multipart/form-data. */
  async upload<T>(path: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    // Do NOT set Content-Type — browser sets it with boundary automatically.
    const res = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error((data['error'] as string) || `HTTP ${res.status}`)
    return data as unknown as T
  }

  /** Download a file and return a Blob. */
  async download(path: string): Promise<Blob> {
    const headers: Record<string, string> = {}
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await fetch(`${this.baseURL}${path}`, { method: 'GET', headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.blob()
  }
}