/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import AbstractDatabase, { Settings } from '../lib/AbstractDatabase';
import { Client, types, ValueCallback } from 'cassandra-driver';
import ResultSet = types.ResultSet;
export type BulkObject = {
    type: string;
    key: string;
    value?: string;
};
export default class Cassandra_db extends AbstractDatabase {
    client: Client | undefined;
    pool: any;
    /**
     * @param {Object} settings The required settings object to initiate the Cassandra database
     * @param {String[]} settings.clientOptions See
     *     http://www.datastax.com/drivers/nodejs/2.0/global.html#ClientOptions for a full set of
     *     options that can be used
     * @param {String} settings.columnFamily The column family that should be used to store data. The
     *     column family will be created if it doesn't exist
     * @param {Function} [settings.logger] Function that will be used to pass on log events emitted by
     *     the Cassandra driver. See https://github.com/datastax/nodejs-driver#logging for more
     *     information
     */
    constructor(settings: Settings);
    /**
     * Initializes the Cassandra client, connects to Cassandra and creates the CF if it didn't exist
     * already
     *
     * @param  {Function}   callback        Standard callback method.
     * @param  {Error}      callback.err    An error object (if any.)
     */
    init(callback: (arg: any) => {}): void;
    /**
     * Gets a value from Cassandra
     *
     * @param  {String}     key               The key for which the value should be retrieved
     * @param  {Function}   callback          Standard callback method
     * @param  {Error}      callback.err      An error object, if any
     * @param  {String}     callback.value    The value for the given key (if any)
     */
    get(key: string, callback: (err: Error | null, data?: any) => {}): void;
    /**
     * Cassandra has no native `findKeys` method. This function implements a naive filter by
     * retrieving *all* the keys and filtering those. This should obviously be used with the utmost
     * care and is probably not something you want to run in production.
     *
     * @param  {String}     key               The filter for keys that should match
     * @param  {String}     [notKey]          The filter for keys that shouldn't match
     * @param  {Function}   callback          Standard callback method
     * @param  {Error}      callback.err      An error object, if any
     * @param  {String[]}   callback.keys     An array of keys that match the specified filters
     */
    findKeys(key: string, notKey: string, callback: Function): any;
    /**
     * Sets a value for a key
     *
     * @param  {String}     key             The key to set
     * @param  {String}     value           The value associated to this key
     * @param  {Function}   callback        Standard callback method
     * @param  {Error}      callback.err    An error object, if any
     */
    set(key: string, value: string, callback: () => {}): void;
    /**
     * Removes a key and it's value from the column family
     *
     * @param  {String}     key             The key to remove
     * @param  {Function}   callback        Standard callback method
     * @param  {Error}      callback.err    An error object, if any
     */
    remove(key: string, callback: ValueCallback<ResultSet>): void;
    /**
     * Performs multiple operations in one action
     *
     * @param  {Object[]}   bulk            The set of operations that should be performed
     * @param  {Function}   callback        Standard callback method
     * @param  {Error}      callback.err    An error object, if any
     */
    doBulk(bulk: BulkObject[], callback: ValueCallback<ResultSet>): void;
    /**
     * Closes the Cassandra connection
     *
     * @param  {Function}   callback        Standard callback method
     * @param  {Error}      callback.err    Error object in case something goes wrong
     */
    close(callback: () => {}): void;
}
//# sourceMappingURL=cassandra_db.d.ts.map