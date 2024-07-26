import { Console } from 'console';
export declare class ConsoleLogger extends Console {
    constructor(opts?: {});
    isDebugEnabled(): boolean;
    isInfoEnabled(): boolean;
    isWarnEnabled(): boolean;
    isErrorEnabled(): boolean;
}
export declare const normalizeLogger: (logger: null | Function) => Function | null;
//# sourceMappingURL=logging.d.ts.map