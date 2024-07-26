/**
 * 2016 Remi Arnaud
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
import r from 'rethinkdb';
import { BulkObject } from './cassandra_db';
export default class Rethink_db extends AbstractDatabase {
    host: string;
    db: string;
    port: number | string;
    table: string;
    connection: r.Connection | null;
    constructor(settings: Settings);
    init(callback: (p: any, cursor: any) => {}): void;
    get(key: string, callback: (err: Error, p: any) => {}): void;
    findKeys(key: string, notKey: string, callback: () => {}): void;
    set(key: string, value: string, callback: () => {}): void;
    doBulk(bulk: BulkObject[], callback: () => {}): void;
    remove(key: string, callback: () => {}): void;
    close(callback: () => {}): void;
}
//# sourceMappingURL=rethink_db.d.ts.map