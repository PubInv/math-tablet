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
const debug = debug1('client:client-cell');

import { CellId, CellObject } from "../shared/cell";
import { assertFalse, CssSize, escapeHtml, Html, notImplemented } from "../shared/common";
import { NotebookUpdate } from "../shared/server-responses";

import { ClientNotebook } from "../client-notebook";
import { CellEditView } from "../views/cell-edit-view";
import { cellBriefSynopsis, cellSynopsis, notebookUpdateSynopsis } from "../shared/debug-synopsis";
import { Stroke } from "../shared/myscript-types";

// Types

export interface CellView {
  onUpdate(update: NotebookUpdate, ownRequest: boolean): void;
}


// Exported Class

export abstract class ClientCell<O extends CellObject> {

  // Public Constructor

  public constructor(notebook: ClientNotebook, obj: O) {
    this.notebook = notebook;
    this.obj = obj;
    this.views = new Set();
  }

  // Public Instance Properties

  public obj: O;

  // Public Instance Property Functions

  public get id(): CellId { return this.obj.id; }

  public toDebugHtml(): Html {
    return <Html>`<div>
<span class="collapsed">${escapeHtml(cellBriefSynopsis(this.obj))}</span>
<div class="nested" style="display:none">
  <tt>${escapeHtml(cellSynopsis(this.obj))}</tt>
</div>
</div>`;
  }

  // Public Instance Methods

  public abstract createEditView(): CellEditView<O>;

  public onUpdate(update: NotebookUpdate, ownRequest: boolean): void {
    debug(`onUpdate C${this.id} ${notebookUpdateSynopsis(update)}`);

    switch(update.type) {
      case 'cellResized': {
        this.obj.cssSize.width = update.cssSize.width;
        this.obj.cssSize.height = update.cssSize.height;
        break;
      }
      case 'strokeDeleted': {
        // TODO: Remove the stroke from stroke data.
        notImplemented();
        break;
      }
      case 'strokeInserted': {
        this.obj.strokeData.strokeGroups[0].strokes.push(update.stroke);
        break;
      }
      default: assertFalse();
    }
    for (const view of this.views) {
      view.onUpdate(update, ownRequest);
    }
  };

  public async delete(): Promise<void> {
    // Called when the 'X' button has been pressed in a cell.
    // Ask the notebook to delete us.
    await this.notebook.deleteCell(this.id);
  }

  public async insertStroke(stroke: Stroke): Promise<void> {
    await this.notebook.insertStrokeIntoCell(this.id, stroke);
  }

  public async resize(cssSize: CssSize): Promise<void> {
    // Called when user finishes resizing a cell.
    // Ask the notebook to resize us.
    await this.notebook.resizeCell(this.id, cssSize);
  }

  // Private Instance Properties

  protected views: Set<CellView>;
  protected notebook: ClientNotebook;
}

