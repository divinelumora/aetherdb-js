export declare class HttpClient {
    private baseURL;
    private token;
    constructor(baseURL: string);
    setToken(token: string): void;
    private headers;
    get<T>(path: string): Promise<T>;
    post<T>(path: string, body?: unknown): Promise<T>;
    put<T>(path: string, body?: unknown): Promise<T>;
    delete<T>(path: string): Promise<T>;
    patch<T>(path: string, body?: unknown): Promise<T>;
    /** Upload a file using multipart/form-data. */
    upload<T>(path: string, formData: FormData): Promise<T>;
    /** Download a file and return a Blob. */
    download(path: string): Promise<Blob>;
}
//# sourceMappingURL=http.d.ts.map