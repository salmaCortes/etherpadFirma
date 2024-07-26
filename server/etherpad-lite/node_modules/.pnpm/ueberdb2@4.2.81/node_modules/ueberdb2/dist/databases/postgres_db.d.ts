/**
 * 2011 Peter 'Pita' Martischka
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
import * as pg from 'pg';
import { BulkObject } from './cassandra_db';
export default class extends AbstractDatabase {
    db: pg.Pool;
    upsertStatement: string | null | undefined;
    constructor(settings: Settings | string);
    init(callback: (err: Error) => {}): void;
    get(key: string, callback: (err: Error | null, value: any) => {}): void;
    findKeys(key: string, notKey: string, callback: (err: Error | null, value: any) => {}): void;
    set(key: string, value: string, callback: (err: Error, result: pg.QueryResult) => void): void;
    remove(key: string, callback: () => {}): void;
    doBulk(bulk: BulkObject[], callback: () => {}): void;
    close(callback: () => {}): void;
}
//# sourceMappingURL=postgres_db.d.ts.map