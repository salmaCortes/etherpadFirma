/**
 * 2019 - exspecto@gmail.com
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
 *
 *
 * Note: This requires MS SQL Server >= 2008 due to the usage of the MERGE statement
 *
 */
import AbstractDatabase, { Settings } from '../lib/AbstractDatabase';
import { ConnectionPool } from 'mssql';
import { BulkObject } from './cassandra_db';
export default class MSSQL extends AbstractDatabase {
    db: ConnectionPool | undefined;
    constructor(settings: Settings);
    init(callback: (err: any) => {}): void;
    get(key: string, callback: (err?: Error, value?: string) => {}): void;
    findKeys(key: string, notKey: string, callback: (err: Error | undefined, value: string[]) => {}): void;
    set(key: string, value: string, callback: (val: string) => {}): void;
    remove(key: string, callback: () => {}): void;
    doBulk(bulk: BulkObject[], callback: (err: any, results?: any) => {}): void;
    close(callback: (err?: Error) => {}): void;
}
//# sourceMappingURL=mssql_db.d.ts.map