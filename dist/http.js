"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
class HttpClient {
    constructor(baseURL) {
        this.token = null;
        this.baseURL = baseURL.replace(/\/$/, '');
    }
    setToken(token) {
        this.token = token;
    }
    headers() {
        const h = { 'Content-Type': 'application/json' };
        if (this.token)
            h['Authorization'] = `Bearer ${this.token}`;
        return h;
    }
    async get(path) {
        const res = await fetch(`${this.baseURL}${path}`, {
            method: 'GET',
            headers: this.headers(),
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data['error'] || `HTTP ${res.status}`);
        return data;
    }
    async post(path, body) {
        const res = await fetch(`${this.baseURL}${path}`, {
            method: 'POST',
            headers: this.headers(),
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data['error'] || `HTTP ${res.status}`);
        return data;
    }
    async put(path, body) {
        const res = await fetch(`${this.baseURL}${path}`, {
            method: 'PUT',
            headers: this.headers(),
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data['error'] || `HTTP ${res.status}`);
        return data;
    }
    async delete(path) {
        const res = await fetch(`${this.baseURL}${path}`, {
            method: 'DELETE',
            headers: this.headers(),
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data['error'] || `HTTP ${res.status}`);
        return data;
    }
    async patch(path, body) {
        const res = await fetch(`${this.baseURL}${path}`, {
            method: 'PATCH',
            headers: this.headers(),
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data['error'] || `HTTP ${res.status}`);
        return data;
    }
    /** Upload a file using multipart/form-data. */
    async upload(path, formData) {
        const headers = {};
        if (this.token)
            headers['Authorization'] = `Bearer ${this.token}`;
        // Do NOT set Content-Type — browser sets it with boundary automatically.
        const res = await fetch(`${this.baseURL}${path}`, {
            method: 'POST',
            headers,
            body: formData,
        });
        const data = await res.json();
        if (!res.ok)
            throw new Error(data['error'] || `HTTP ${res.status}`);
        return data;
    }
    /** Download a file and return a Blob. */
    async download(path) {
        const headers = {};
        if (this.token)
            headers['Authorization'] = `Bearer ${this.token}`;
        const res = await fetch(`${this.baseURL}${path}`, { method: 'GET', headers });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        return res.blob();
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http.js.map