/*
Math Tablet
Copyright (C) 2019 Public Invention
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

import * as debug1 from "debug";
const debug = debug1('client:text-cell');

import { StyleObject, NotebookChange } from "../../../../shared/notebook";
import { Content } from "..";
import { getRenderer } from "../../../../renderers";

import { CellBase } from "./cell-base";
import { notImplemented } from "../../../../shared/common";

// Types

// Constants

// Class

export class TextCell extends CellBase {

  // Public Class Methods

  // Public Constructor

  public constructor(notebookView: Content, style: StyleObject) {
    super(notebookView, style, 'textCell', []);
    this.render(style);
  }

  // ClientNotebookWatcher Methods

  public onChange(change: NotebookChange): void {
    debug(`Received change: ${this.styleId} ${JSON.stringify(change)}`);
    notImplemented();
  }

  public onChangesFinished(): void {
    notImplemented();
  }

  // -- PRIVATE --

  // Private Instance Methods

  private render(style: StyleObject): void {
    const renderer = getRenderer(style.type);
    const { html, errorHtml } = renderer(style.data);
    // TODO: Error formatting.
    if (html) { this.$elt.innerHTML = html; }
    else { this.$elt.innerHTML = errorHtml!; }
  }

}
