
// Requirements

import { readdir, readFile, readFileSync, writeFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { TDoc } from './tdoc/tdoc-class';

const readdir2 = promisify(readdir);
const readFile2 = promisify(readFile);
const writeFile2 = promisify(writeFile);

// Types

export type NotebookName = string;
type NotebookFileName = string;
export type UserName = string;

// An entry in a list of notebooks.
// NOT an entry in a notebook.
interface NotebookEntry {
  name: NotebookName;
  fileName: NotebookFileName;
}

interface UserEntry {
  userName: UserName;
}

// Constants

const CREDENTIALS_FILENAME = '.math-tablet-credentials.json';
// LATER: Allow USR_DIR to be specified by environment variable.
const USR_DIR = join(process.env.HOME, 'math-tablet-usr');

const NOTEBOOK_FILENAME_SUFFIX = '.tdoc.json';
const NOTEBOOK_FILENAME_SUFFIX_LENGTH = NOTEBOOK_FILENAME_SUFFIX.length;

// SECURITY: DO NOT ALLOW PERIODS OR SLASHES OR BACKSLASHES IN USER NAMES OR NOTEBOOK NAMES!!!
const USER_NAME_RE = /^\w+$/;
const NOTEBOOK_NAME_RE = /^\w+$/; // REVIEW: aslo allow hyphens?

// Exported functions

// LATER: s/b async
export function getCredentials() {
  const credentialsPath = join(process.env.HOME, CREDENTIALS_FILENAME);
  const credentialsJson = readFileSync(credentialsPath, 'utf8');
  const credentials = JSON.parse(credentialsJson);
  return credentials;
}

export async function getListOfUsers(): Promise<UserEntry[]> {
  const directoryNames: string[] = await readdir2(USR_DIR);
  // TODO: Check which are actually directories.
  const userEntries: UserEntry[] = directoryNames.map(d=>({ userName: d }));
  return userEntries;
}

export async function getListOfUsersNotebooks(userName: UserName): Promise<NotebookEntry[]> {
  const userDirectory: /* TYPESCRIPT: FilePath */string = join(USR_DIR, userName)
  const filenames: string[] = await readdir2(userDirectory);
  const notebookFilenames = filenames.filter(f=>f.toLowerCase().endsWith(NOTEBOOK_FILENAME_SUFFIX));
  const notebookEntries: NotebookEntry[] = notebookFilenames.map(f=>{
    const rval: NotebookEntry = { name: f.slice(0, -NOTEBOOK_FILENAME_SUFFIX_LENGTH), fileName: f };
    return rval;
  });
  return notebookEntries;
}

export async function readNotebook(userName: UserName, notebookName: NotebookName): Promise<TDoc> {
  validateUserName(userName);
  validateNotebookName(notebookName);
  const fileName = `${notebookName}${NOTEBOOK_FILENAME_SUFFIX}`;
  const filePath = join(USR_DIR, userName, fileName);
  const json = await readFile2(filePath, 'utf8');
  const obj = JSON.parse(json); // TODO: catch errors
  const tDoc = TDoc.fromJsonObject(obj);
  return tDoc;
}

export async function writeNotebook(userName: UserName, notebookName: NotebookName, notebook: TDoc): Promise<void> {
  validateUserName(userName);
  validateNotebookName(notebookName);
  const fileName = `${notebookName}${NOTEBOOK_FILENAME_SUFFIX}`;
  const filePath = join(USR_DIR, userName, fileName);
  const json = JSON.stringify(notebook);
  await writeFile2(filePath, json, 'utf8');
}

// HELPER FUNCTIONS

function validateUserName(userName: UserName): void {
  if (!USER_NAME_RE.test(userName)) {
    throw new Error(`Invalid math tablet user name: ${userName}`);
  }
}

function validateNotebookName(notebookName: NotebookName): void {
  if (!NOTEBOOK_NAME_RE.test(notebookName)) {
    throw new Error(`Invalid math tablet notebook name: ${notebookName}`);
  }
}