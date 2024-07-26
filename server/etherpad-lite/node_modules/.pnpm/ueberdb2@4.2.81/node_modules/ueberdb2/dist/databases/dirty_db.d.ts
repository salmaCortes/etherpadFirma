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
type DirtyDBCallback = (p?: any, keys?: string[]) => {};
export default class extends AbstractDatabase {
    db: any;
    constructor(settings: Settings);
    init(callback: () => {}): void;
    get(key: string, callback: DirtyDBCallback): void;
    findKeys(key: string, notKey: string, callback: DirtyDBCallback): void;
    set(key: string, value: string, callback: DirtyDBCallback): void;
    remove(key: string, callback: DirtyDBCallback): void;
    close(callback: DirtyDBCallback): void;
}
export {};
//# sourceMappingURL=dirty_db.d.ts.map