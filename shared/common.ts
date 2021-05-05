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

// Requirements

// Types

export type AbsoluteUrl = '{AbsoluteUrl}';
export type ClientId = '{ClientId}'
export type ElementId = '{ElementId}';
export type Html = '{Html}';
export type Milliseconds = number;  // Time interval in milliseconds.
export type PlainText = '{PlainText}';
export type RelativeUrl = '{RelativeUrl}';
export type SessionToken = '{SessionToken}';
export type Timestamp = number;     // Number of milliseconds since Jan 1, 1970 as returned by Date.now().

type StackTrace = '{StackTrace}';

export interface BoundingBox {
  x: number,
  y: number,
  width: number,
  height: number,
}

export interface JsonObject {
  // A vanilla JavaScript object that you can specify in JSON.
  // NOTE: This doesn't necessarily capture all possible JSON objects
  // but is sufficient for our purposes.
  [ key: string ]: null | string | number | JsonObject;
}

// REVIEW: This is also defined in server/common.ts.
export interface PromiseResolver<T> {
  resolve: (s: T)=>void;
  reject: (err: Error)=>void
}


// Constants

const ASSERTION_FAILED_MSG = "Assertion failed.";

// Exported Functions

export function arrayFilterOutInPlace<T>(array: T[], cb: (value: T, index?: number, obj?: T[])=>boolean): T[] {
  // Like Array.filter, but removes items where the callback returns true, and works on the array in-place.
  // Returns possibly-empty array of items that were removed.
  let i: number;
  const rval = <T[]>[];
  while (i = array.findIndex(cb), i>=0) {
    const item = array.splice(i, 1)[0];
    rval.push(item);
  }
  return rval;
}

export function assert(value: any, message?: string): void {
  if (!value) { throw new Error(message || ASSERTION_FAILED_MSG); }
}

export function assertFalse( message?: string): never {
  throw new Error(message || ASSERTION_FAILED_MSG);
}

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  assert(chunkSize>0);
  var rval = [];
  for (let i=0, len=arr.length; i<len; i+=chunkSize)
    rval.push(arr.slice(i,i+chunkSize));
  return rval;
}

export function deepCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function errorMessageForUser(err: Error): Html {
  return <Html>(err instanceof ExpectedError ? escapeHtml(err.message) : "An unexpected error occurred.");
}

export function escapeHtml(str: string): Html {
  // REVIEW: This function also exists in dom.ts, but that only works in the browser.
  // From http://jehiah.cz/a/guide-to-escape-sequences. Note that has a bug in that it only replaces the first occurrence.
  // REVIEW: Is this sufficient?
  return <Html>str.replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/>/g, "&gt;")
            .replace(/</g, "&lt;");
}

// export function isEmptyOrSpaces(str: string) : boolean{
//   return str === null || str.match(/^ *$/) !== null;
// }

export function newPromiseResolver<T>(): { promise: Promise<T>, resolver: PromiseResolver<T> } {
  let resolver: PromiseResolver<T>;
  const promise = new Promise<T>((resolve, reject)=>{ resolver = { resolve, reject }; });
  // @ts-expect-error   // Expect "Variable 'rval' is used before being assigned."
  return { promise, resolver };
}

export function notImplementedError(feature: string): never {
  throw new Error(`${feature} is not yet implemented.`);
}

export function notImplementedWarning(feature: string): void {
  console.warn(`${feature} is not yet implemented.`);
}

export function replaceStringSegment(s: string, start: number, end: number, replacement: string): string {
  return `${s.slice(0, start)}${replacement}${s.slice(end)}`;
}

export function sleep(ms: Milliseconds): Promise<void> {
  return new Promise<void>(resolve=>setTimeout(resolve, ms));
}

export function stackTrace(): StackTrace {
  let rval: StackTrace;
  try { throw new Error('StackTrace'); }
  catch(err) { rval = <StackTrace>err.stack; }
  return rval;
}

export function zeroPad(s: string, length: number): string {
  const numZeroes = length - s.length;
  return numZeroes>0 ? '0'.repeat(numZeroes)+s : s;
}

// Exported Classes

export class ExpectedError extends Error {
  // An "expected error" is one that we anticipated could occur, and has a
  // useful error message for the user.
  // Also, if you catch an expected error you can assume that it has already
  // been reported to the error logging system or does not need to be logged.
  constructor(message: string) {
    super(message);
  }
}

// Helper Functions
