/**
 * Cache with Least Recently Used eviction policy.
 */
export declare class LRU {
    /**
     * @param evictable Optional predicate that dictates whether it is permissable to evict the entry
     *     if it is old and the cache is over capacity. The predicate is passed two arguments (key,
     *     value). If no predicate is provided, all entries are evictable. Warning: Non-evictable
     *     entries can cause the cache to go over capacity. If the number of non-evictable entries is
     *     greater than or equal to the capacity, all new evictable entries will be evicted
     *     immediately.
     */
    constructor(capacity: any, evictable?: (k: any, v: any) => boolean);
    /**
     * The entries accessed via this iterator are not considered to have been "used" (for purposes of
     * determining least recently used).
     */
    [Symbol.iterator](): any;
    /**
     * @param isUse Optional boolean indicating whether this get() should be considered a "use" of the
     *     entry (for determining least recently used). Defaults to true.
     * @returns undefined if there is no entry matching the given key.
     */
    get(k: any, isUse?: boolean): any;
    /**
     * Adds or updates an entry in the cache. This marks the entry as the most recently used entry.
     */
    set(k: any, v: any): void;
    /**
     * Evicts the oldest evictable entries until the number of entries is equal to or less than the
     * cache's capacity. This method is automatically called by set(). Call this if you need to evict
     * newly evictable entries before the next call to set().
     */
    evictOld(): void;
}
export declare const Database: {
    new (wrappedDB: any, settings: any, logger: any): {
        _lock(key: any): Promise<void>;
        _unlock(key: any): Promise<void>;
        _pauseFlush(): void;
        _resumeFlush(): void;
        /**
         * wraps the init function of the original DB
         */
        init(): Promise<void>;
        /**
         * wraps the close function of the original DB
         */
        close(): Promise<void>;
        /**
         * Gets the value trough the wrapper.
         */
        get(key: any): Promise<any>;
        _getLocked(key: any): Promise<any>;
        /**
         * Find keys function searches the db sets for matching entries and
         * returns the key entries via callback.
         */
        findKeys(key: any, notKey: any): Promise<any>;
        /**
         * Remove a record from the database
         */
        remove(key: any): Promise<void>;
        /**
         * Sets the value trough the wrapper
         */
        set(key: any, value: any): Promise<void>;
        _setLocked(key: any, value: any): Promise<void>;
        /**
         * Sets a subvalue
         */
        setSub(key: any, sub: any, value: any): Promise<void>;
        /**
         * Returns a sub value of the object
         * @param sub is a array, for example if you want to access object.test.bla, the array is ["test",
         *     "bla"]
         */
        getSub(key: any, sub: any): Promise<any>;
        /**
         * Writes all dirty values to the database
         */
        flush(): Promise<void>;
        _write(dirtyEntries: any): Promise<void>;
    };
};
export declare const exportedForTesting: {
    LRU: typeof LRU;
};
//# sourceMappingURL=CacheAndBufferLayer.d.ts.map