import AbstractDatabase, { Settings } from '../lib/AbstractDatabase';
export default class extends AbstractDatabase {
    db: any;
    constructor(settings: Settings);
    init(callback: () => void): void;
    get(key: string, callback: (err: string | any, value: string) => void): void;
    findKeys(key: string, notKey: string, callback: (v: any, keys: string[]) => {}): void;
    set(key: string, value: string, callback: () => {}): void;
    remove(key: string, callback: () => {}): void;
    close(callback: () => void): void;
}
//# sourceMappingURL=dirty_git_db.d.ts.map