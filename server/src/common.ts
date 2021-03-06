/*
Euler Notebook
Copyright (C) 2019-21 Public Invention
https://pubinv.github.io/PubInv/

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// IMPORTANT: Be sparing of what you put in here.
//            This should not depend on other files or libraries.

// Types

export type Base64 = '{Base64}';

// Constants

// const NOT_EXISTS_MESSAGE = "Unexpected error. Object doesn't exist.";

// Exported Functions

export function base64Decode(encoded: Base64): string {
  const buff = Buffer.from(encoded, 'base64');
  return buff.toString('utf-8');
}

// export function ensureExists<T>(val: T|undefined, message?: string): T {
//   if (!val) { throw new Error(message || NOT_EXISTS_MESSAGE); }
//   return val;
// }

// // If the promise fails, then log the error, but otherwise continue.
// export function runAsync<T>(promise: Promise<T>, module: string, functionName: string): void {
//   promise.catch((err: Error)=>{
//     console.error(`ERROR ${module}: Unexpected error in ${functionName}: ${err.message}`);
//     console.error(err.stack);
//   })
// }
