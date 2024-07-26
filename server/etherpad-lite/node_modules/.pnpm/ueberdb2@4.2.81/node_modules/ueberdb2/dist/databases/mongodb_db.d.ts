/**
 * 2020 Sylchauf
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
import { Collection, Db, MongoClient } from 'mongodb';
export default class extends AbstractDatabase {
    interval: NodeJS.Timer | undefined;
    database: Db | undefined;
    client: MongoClient | undefined;
    collection: Collection | undefined;
    constructor(settings: Settings);
    clearPing(): void;
    schedulePing(): void;
    init(callback: Function): void;
    get(key: string, callback: Function): void;
    findKeys(key: string, notKey: string, callback: Function): void;
    set(key: string, value: string, callback: Function): void;
    remove(key: string, callback: Function): void;
    doBulk(bulk: BulkObject[], callback: Function): void;
    close(callback: any): void;
}
//# sourceMappingURL=mongodb_db.d.ts.map