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

import { CellObject, CellType } from "../../shared/cell";
import { FigureCellObject } from "../../shared/figure";
import { ImageCellObject } from "../../shared/image-cell";
import { PlotCellObject } from "../../shared/plot-cell";
import { TextCellObject } from "../../shared/text";
import { assertFalse } from "../../shared/common";
import { FormulaCellObject } from "../../shared/formula";

import { ClientNotebook } from "../client-notebook";

import { FormulaCell } from "./formula-cell";
import { FigureCell } from "./figure-cell";
import { ImageCell } from "./image-cell";
import { PlotCell } from "./plot-cell";
import { TextCell } from "./text-cell";

import { ClientCell } from "./index";

// Constants

// Exports

export function createCell<O extends CellObject>(notebook: ClientNotebook, obj: O): ClientCell<O> {
  let rval: FigureCell|FormulaCell|ImageCell|PlotCell|TextCell;
  switch(obj.type) {
    case CellType.Figure:   rval = new FigureCell(notebook, <FigureCellObject><unknown>obj); break;
    case CellType.Formula:  rval = new FormulaCell(notebook, <FormulaCellObject><unknown>obj); break;
    case CellType.Image:    rval = new ImageCell(notebook, <ImageCellObject><unknown>obj); break;
    case CellType.Plot:     rval = new PlotCell(notebook, <PlotCellObject><unknown>obj); break;
    case CellType.Text:     rval = new TextCell(notebook, <TextCellObject><unknown>obj); break;
    default: assertFalse();
  }
  return <ClientCell<O>><unknown>rval;
}
