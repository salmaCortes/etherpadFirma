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
import { BulkObject } from './cassandra_db';
import { Pool } from "mysql2";
export default class extends AbstractDatabase {
    readonly _mysqlSettings: Settings;
    _pool: Pool | null;
    constructor(settings: Settings);
    get isAsync(): boolean;
    _query(options: any): Promise<any>;
    init(): Promise<void>;
    get(key: string): Promise<any>;
    findKeys(key: string, notKey: string): Promise<any>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
    doBulk(bulk: BulkObject[]): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=mysql_db.d.ts.map