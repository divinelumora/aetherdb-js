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
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http.js.map