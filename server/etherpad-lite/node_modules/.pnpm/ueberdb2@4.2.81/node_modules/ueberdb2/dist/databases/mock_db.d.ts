import { Settings } from '../lib/AbstractDatabase';
import events from 'events';
export default class extends events.EventEmitter {
    settings: Settings;
    mock: any;
    constructor(settings: Settings);
    close(cb: () => {}): void;
    doBulk(ops: string, cb: () => {}): void;
    findKeys(key: string, notKey: string, cb: () => {}): void;
    get(key: string, cb: () => {}): void;
    init(cb: () => {}): Promise<void>;
    remove(key: string, cb: () => {}): void;
    set(key: string, value: string, cb: () => {}): void;
}
//# sourceMappingURL=mock_db.d.ts.map