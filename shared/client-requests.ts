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

// TODO: Version the client/server API so if they get out of sync the user gets an error
//       message instead of a server or client crash.

// Requirements

import { PlainText, SessionToken } from "./common";
import { CssSize } from "./css";
import { CellId, CellObject, CellRelativePosition, CellType } from "./cell";
import { FolderPath, NotebookPath, FolderName, NotebookName, } from "./folder";
import { Stroke, StrokeId, StrokeData } from "./stylus";
import { UserName, UserPassword } from "./user";
import { FormulaObject } from "./formula";
import { FigureObject } from "./figure";
import { SuggestionId, SuggestionObject } from "./suggestions";
import { ImageInfo, PositionInfo as ImagePositionInfo } from "./image-cell";

// Types

export type RequestId = '{RequestId}';

export type ClientRequest = FolderRequest | NotebookRequest | UserRequest;
interface RequestBase {
  requestId?: RequestId; // TYPESCRIPT: always added on at the end before sending. How to capture this?
}

// Folder Requests

export type FolderRequest = ChangeFolder | CloseFolder | OpenFolder;
interface FolderRequestBase extends RequestBase {
  type: 'folder';
  path: FolderPath;
}
export interface ChangeFolder extends FolderRequestBase {
  operation: 'change';
  changeRequests: FolderChangeRequest[];
}
export interface CloseFolder extends FolderRequestBase {
  operation: 'close';
  reason: string;
}
export interface OpenFolder extends FolderRequestBase {
  operation: 'open';
}

// Notebook Requests

export type NotebookRequest =
              ChangeNotebook |
              CloseNotebook |
              OpenNotebook;
interface NotebookRequestBase extends RequestBase {
  type: 'notebook';
  path: NotebookPath;
}
export interface ChangeNotebook extends NotebookRequestBase {
  operation: 'change';
  changeRequests: NotebookChangeRequest[];
}
export interface CloseNotebook extends NotebookRequestBase {
  operation: 'close';
  reason: string;
}
export interface OpenNotebook extends NotebookRequestBase {
  operation: 'open';
}

// User Requests

export type UserRequest = LoginUserWithPassword | LoginUserWithToken | LogoutUser;
interface UserRequestBase extends RequestBase {
  type: 'user';
}
export interface LoginUserWithPassword extends UserRequestBase {
  operation: 'passwordLogin';
  userName: UserName;
  password: UserPassword;
}
export interface LoginUserWithToken extends UserRequestBase {
  operation: 'tokenLogin';
  sessionToken: SessionToken;
}
export interface LogoutUser extends UserRequestBase {
  operation: 'logout';
  sessionToken: SessionToken;
}

// Folder Change Requests

export type FolderChangeRequest =
  FolderCreateRequest|
  FolderDeleteRequest|
  FolderRenameRequest|
  NotebookCreateRequest|
  NotebookDeleteRequest|
  NotebookRenameRequest;
export interface FolderCreateRequest {
  type: 'createFolder';
  name: FolderName;
}
export interface FolderDeleteRequest {
  type: 'deleteFolder';
  name: FolderName;
}
export interface FolderRenameRequest {
  type: 'renameFolder';
  name: FolderName;
  newName: FolderName;
}
export interface NotebookCreateRequest {
  type: 'createNotebook';
  name: NotebookName;
}
export interface NotebookDeleteRequest {
  type: 'deleteNotebook';
  name: NotebookName;
}
export interface NotebookRenameRequest {
  type: 'renameNotebook';
  name: NotebookName;
  newName: NotebookName;
}

// Notebook Change Requests

export type NotebookChangeRequest =
  AddSuggestion |
  ChangeImage |
  ChangeImagePosition |
  DeleteCell |
  DeleteStroke |
  InsertCell |
  InsertEmptyCell |
  InsertStroke |
  MoveCell |
  RemoveSuggestion |
  ResizeCell |
  TypesetFigure |
  TypesetFormula |
  TypesetText;

export interface AddSuggestion {
  type: 'addSuggestion';
  cellId: CellId,
  suggestionObject: SuggestionObject;
}
export interface ChangeImage {
  type: 'changeImage';
  cellId: CellId;
  // Either both imageInfo and positionInfo specified, or neither.
  imageInfo?: ImageInfo;
  positionInfo?: ImagePositionInfo;
  cssSize?: CssSize;
}
export interface ChangeImagePosition {
  type: 'changeImagePosition';
  cellId: CellId;
  positionInfo: ImagePositionInfo;
}
export interface DeleteCell {
  type: 'deleteCell';
  cellId: CellId;
}
export interface DeleteStroke {
  type: 'deleteStroke';
  cellId: CellId;
  strokeId: StrokeId;
}
export interface InsertCell {
  type: 'insertCell';
  cellObject: CellObject,
  afterId: CellRelativePosition;
}
export interface InsertEmptyCell {
  type: 'insertEmptyCell';
  cellType: CellType,
  afterId: CellRelativePosition;
}
export interface InsertStroke {
  type: 'insertStroke';
  cellId: CellId;
  stroke: Stroke;
}
export interface MoveCell {
  type: 'moveCell';
  cellId: CellId;
  afterId: CellRelativePosition;
}
export interface RemoveSuggestion {
  type: 'removeSuggestion';
  cellId: CellId;
  suggestionId: SuggestionId;
}
export interface ResizeCell {
  type: 'resizeCell';
  cellId: CellId;
  cssSize: CssSize;
}
export interface TypesetFigure {
  // NOTE: This can be used to undo typesetting as well.
  type: 'typesetFigure';
  cellId: CellId;
  figure: FigureObject;
  strokeData: StrokeData;
}
export interface TypesetFormula {
  // NOTE: This can be used to undo typesetting as well.
  type: 'typesetFormula';
  cellId: CellId;
  formula: FormulaObject;
  strokeData: StrokeData;
}
export interface TypesetText {
  // NOTE: This can be used to undo typesetting as well.
  type: 'typesetText';
  cellId: CellId;
  text: PlainText;
  strokeData: StrokeData;
}
