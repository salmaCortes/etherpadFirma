import AbstractDatabase, { Settings } from '../lib/AbstractDatabase';
export default class MemoryDB extends AbstractDatabase {
    _data: any;
    constructor(settings: Settings);
    get isAsync(): boolean;
    close(): void;
    findKeys(key: string, notKey: string): any[];
    get(key: string): any;
    init(): void;
    remove(key: string): void;
    set(key: string, value: string): void;
}
//# sourceMappingURL=memory_db.d.ts.map