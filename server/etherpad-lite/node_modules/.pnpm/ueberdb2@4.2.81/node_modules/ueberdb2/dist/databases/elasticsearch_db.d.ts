/**
 * 2015 Visionist, Inc.
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
export default class extends AbstractDatabase {
    _client: any;
    readonly _index: any;
    _indexClean: boolean;
    readonly _q: {
        index: any;
    };
    constructor(settings: Settings);
    get isAsync(): boolean;
    _refreshIndex(): Promise<void>;
    /**
     * Initialize the elasticsearch client, then ping the server to ensure that a
     * connection was made.
     */
    init(): Promise<void>;
    /**
     *  This function provides read functionality to the database.
     *
     *  @param {String} key Key
     */
    get(key: string): Promise<any>;
    /**
     *  @param key Search key, which uses an asterisk (*) as the wild card.
     *  @param notKey Used to filter the result set
     */
    findKeys(key: string, notKey: string): Promise<any>;
    /**
     *  This function provides write functionality to the database.
     *
     *  @param {String} key Record identifier.
     *  @param {JSON|String} value The value to store in the database.
     */
    set(key: string, value: string): Promise<void>;
    /**
     *  This function provides delete functionality to the database.
     *
     *  The index, type, and ID will be parsed from the key, and this document will
     *  be deleted from the database.
     *
     *  @param {String} key Record identifier.
     */
    remove(key: string): Promise<void>;
    /**
     *  This uses the bulk upload functionality of elasticsearch (url:port/_bulk).
     *
     *  The CacheAndBufferLayer will periodically (every this.settings.writeInterval)
     *  flush writes that have already been done in the local cache out to the database.
     *
     *  @param {Array} bulk An array of JSON data in the format:
     *      {"type":type, "key":key, "value":value}
     */
    doBulk(bulk: BulkObject[]): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=elasticsearch_db.d.ts.map