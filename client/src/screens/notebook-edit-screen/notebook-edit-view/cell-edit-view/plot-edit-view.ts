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

import * as debug1 from "debug";
const debug = debug1('client:formula-cell');

import { PlotCellObject, renderPlotCell } from "../../../../shared/plot-cell";
import { CssClass } from "../../../../shared/css";
import { notebookUpdateSynopsis } from "../../../../shared/debug-synopsis";
import { NotebookUpdate } from "../../../../shared/server-responses";

import { PlotCell } from "../../../../models/client-cell/plot-cell";

import { NotebookEditView } from "..";

import { CellEditView } from "./index";
import { $, $new, $newSvg } from "../../../../dom";
import { convertStrokeToPath, strokePathId } from "../../../../shared/stylus";

// Types

// Constants

// Exported Class

export class PlotEditView extends CellEditView<PlotCellObject> {

  // Public Class Methods

  // Public Constructor

  public  constructor(notebookEditView: NotebookEditView, cell: PlotCell) {

    const $displaySvg = $newSvg<'svg'>({
      tag: 'svg',
      class: <CssClass>'displaySvg',
      attrs: { height: "100%", width: "100%" },
    });

    const $content = $new<'div'>({
      tag: 'div',
      classes: [ <CssClass>'content', <CssClass>'plotCell' ],
      styles: {
        width: cell.obj.cssSize.width,
        height: cell.obj.cssSize.height,
      },
      children: [ $displaySvg ]
    });

    super(notebookEditView, cell, $content);

    this.$displaySvg = $displaySvg;

    this.refreshDisplay();
  }

  // CellView Methods

  public onUpdate(update: NotebookUpdate, ownRequest: boolean): void {
    debug(`onUpdate C${this.id} ${notebookUpdateSynopsis(update)}`);
    super.onUpdate(update, ownRequest);
    switch (update.type) {
      case 'strokeDeleted': {
        const { strokeId } = update;
        const elementId = strokePathId(this.id, strokeId);
        $(this.$displaySvg, `#${elementId}`).remove();
        break;
      }
      case 'strokeInserted': {
        const { stroke } = update;
        const svgMarkup = convertStrokeToPath(this.id, stroke);
        const $svg = $newSvg<'svg'>({ tag: 'svg', html: svgMarkup });
        while ($svg.childNodes.length > 0) {
          this.$displaySvg.appendChild($svg.childNodes[0]);
        }
        break;
      }
    }
  }

  // -- PRIVATE --

  // Private Instance Properties

  private $displaySvg: SVGSVGElement;

  // Private Instance Property Functions

  // Private Instance Methods

  protected refreshDisplay(): void {
    const svgMarkup = renderPlotCell(0, 0, this.cell.obj);
    this.$displaySvg.innerHTML = svgMarkup;
  }

  // Private Instance Event Handlers

}
