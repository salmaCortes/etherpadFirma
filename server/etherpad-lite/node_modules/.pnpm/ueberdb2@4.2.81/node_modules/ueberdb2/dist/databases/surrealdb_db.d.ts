/**
 * 2023 Samuel Schwanzer
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import AbstractDatabase, { Settings } from '../lib/AbstractDatabase';
import Surreal from 'surrealdb.js';
import { BulkObject } from "./cassandra_db";
import { QueryResult } from "surrealdb.js/script/types";
type StoreVal = {
    key: string;
    value: string;
    raw: string;
};
export default class SurrealDB extends AbstractDatabase {
    _client: Surreal | null;
    constructor(settings: Settings);
    get isAsync(): boolean;
    init(): Promise<void>;
    get(key: string): Promise<string | null>;
    findKeys(key: string, notKey: string): Promise<string[] | null>;
    transformWildcard(key: string, keyExpr: string): string;
    transformWildcardNegative(key: string, keyExpr: string): string;
    transformResult(res: QueryResult<StoreVal[]>[], originalKey: string): string[];
    set(key: string, value: string): Promise<null | undefined>;
    remove(key: string): Promise<import("surrealdb.js/script/types").RawQueryResult[] | null>;
    doBulk(bulk: BulkObject[]): Promise<null | undefined>;
    close(): Promise<null | undefined>;
}
export {};
//# sourceMappingURL=surrealdb_db.d.ts.map