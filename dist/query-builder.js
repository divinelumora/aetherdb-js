"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
/**
 * QueryBuilder provides a fluent interface for building and executing queries.
 *
 * Usage:
 *   const rows = await db.from('products').select('title, price').eq('price', 29.99).execute()
 */
class QueryBuilder {
    constructor(http, table, scoped = true) {
        this.selectedColumns = '*';
        this.conditions = [];
        this.orderDirection = 'ASC';
        this.http = http;
        this.tableName = table;
        this.isScoped = scoped;
    }
    // ── Selection ─────────────────────────────────────────────────────────────
    select(columns) {
        this.selectedColumns = columns;
        return this;
    }
    // ── Filters ───────────────────────────────────────────────────────────────
    eq(column, value) {
        this.conditions.push(`${column} = '${value}'`);
        return this;
    }
    neq(column, value) {
        this.conditions.push(`${column} != '${value}'`);
        return this;
    }
    gt(column, value) {
        this.conditions.push(`${column} > '${value}'`);
        return this;
    }
    gte(column, value) {
        this.conditions.push(`${column} >= '${value}'`);
        return this;
    }
    lt(column, value) {
        this.conditions.push(`${column} < '${value}'`);
        return this;
    }
    lte(column, value) {
        this.conditions.push(`${column} <= '${value}'`);
        return this;
    }
    like(column, pattern) {
        this.conditions.push(`${column} LIKE '${pattern}'`);
        return this;
    }
    ilike(column, pattern) {
        this.conditions.push(`${column} ILIKE '${pattern}'`);
        return this;
    }
    // ── Ordering + Limiting ───────────────────────────────────────────────────
    order(column, direction = 'ASC') {
        this.orderByColumn = column;
        this.orderDirection = direction;
        return this;
    }
    limit(n) {
        this.limitValue = n;
        return this;
    }
    // ── Build SQL ─────────────────────────────────────────────────────────────
    buildSQL() {
        var _a;
        let sql = `SELECT ${this.selectedColumns} FROM ${this.tableName}`;
        if (this.conditions.length > 0) {
            sql += ` WHERE ${this.conditions.join(' AND ')}`;
        }
        if (this.orderByColumn) {
            sql += ` ORDER BY ${this.orderByColumn} ${this.orderDirection}`;
        }
        sql += ` LIMIT ${(_a = this.limitValue) !== null && _a !== void 0 ? _a : 100}`;
        return sql;
    }
    // ── Execute ───────────────────────────────────────────────────────────────
    async execute() {
        const sql = this.buildSQL();
        const endpoint = this.isScoped ? '/tenant/query' : '/db/query';
        return this.http.post(endpoint, { sql });
    }
    // ── Insert ────────────────────────────────────────────────────────────────
    async insert(data) {
        const endpoint = this.isScoped ? '/tenant/insert' : '/db/insert';
        return this.http.post(endpoint, {
            table: this.tableName,
            data,
        });
    }
    // ── Create table ──────────────────────────────────────────────────────────
    async createTable(columns) {
        return this.http.post('/tenant/tables', {
            name: this.tableName,
            columns,
        });
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=query-builder.js.map