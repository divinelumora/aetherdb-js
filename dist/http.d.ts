export declare class HttpClient {
    private baseURL;
    private token;
    constructor(baseURL: string);
    setToken(token: string): void;
    private headers;
    get<T>(path: string): Promise<T>;
    post<T>(path: string, body?: unknown): Promise<T>;
    delete<T>(path: string): Promise<T>;
}
//# sourceMappingURL=http.d.ts.map