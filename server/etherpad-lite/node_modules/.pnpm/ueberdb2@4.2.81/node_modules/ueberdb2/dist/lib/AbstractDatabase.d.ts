export type Settings = {
    data?: any;
    table?: string;
    db?: string;
    idleTimeoutMillis?: any;
    min?: any;
    max?: any;
    engine?: string;
    charset?: string;
    server?: string | undefined;
    requestTimeout?: number;
    bulkLimit?: number;
    queryTimeout?: number;
    connectionString?: string;
    parseJSON?: boolean;
    dbName?: string;
    collection?: string;
    url?: string;
    mock?: any;
    base_index?: string;
    migrate_to_newer_schema?: boolean;
    api?: string;
    filename?: string;
    database?: string;
    password?: string;
    user?: string;
    port?: number | string;
    host?: string;
    maxListeners?: number | undefined;
    json?: boolean;
    cache?: number;
    writeInterval?: number;
    logger?: any;
    columnFamily?: any;
    clientOptions?: any;
};
declare class AbstractDatabase {
    logger: any;
    settings: Settings;
    constructor(settings: Settings);
    /**
     * For findKey regex. Used by document dbs like mongodb or dirty.
     */
    createFindRegex(key: string, notKey?: string): RegExp;
    doBulk(operations: any, cb: () => {}): void;
    get isAsync(): boolean;
}
export default AbstractDatabase;
//# sourceMappingURL=AbstractDatabase.d.ts.map