/*
Euler Notebook
Copyright (C) 2021 Public Invention
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

import { BoundingBox } from "../shared/common";

// Types

type MathNodeErrorString = 'Unsolved';
export type MathNodeType =
  '-' |
  '!' |
  '/' |
  '+' |
  '<' |
  '=' |
  '>' |
  'fence' |
  'fraction' |
  'function' |
  'group' |
  'number' |
  'square root' |
  'superscript' |
  'symbol' |
  '\u00B7' /* UNICODE_MIDDLE_DOT */ |
  '\u00D7' /* UNICODE_MULTIPLICATION_SIGN */ |
  '\u00F7' /* UNICODE_DIVISION_SIGN */ |
  '\u2260' /* UNICODE_NOT_EQUAL_TO_SIGN */ |
  '\u2264' /* UNICODE_LESS_THAN_OR_EQUAL_TO_SIGN*/ |
  '\u2265' /* UNICODE_GREATER_THAN_OR_EQUAL_TO_SIGN */ |

  // NOT YET IMPLEMENTED:
  'matrix' |
  'overscript' |
  'partialfractiondenominator' |
  'partialfractionnumerator' |
  'percentage' |
  'power' |
  'presubscript' |
  'presubsuperscript' |
  'presuperscript' |
  'rows' |
  'slantedfraction' |
  'subscript' |
  'subsuperscript' |
  'system' |
  'underoverscript' |
  'underscript' |
  '\u21D0' /* leftwards double arrow */ |
  '\u21D2' /* rightwards double arrow */ |
  '\u21D4' /* left right double arrow */ |
  '\u2225' /* parallel to */ |
  '\u2243' /* asymptotically equal to */ |
  '\u2248' /* almost equal to */ |
  '\u2261' /* identical to */ |
  '\u2262' /* not identical to */ |
  '\u226A' /* much less than */ |
  '\u226B' /* much greater than */;

export interface MathNode {
  id?: string;                  // id not present on error nodes.
  type: MathNodeType;

  'bounding-box'?: BoundingBox;
  'close symbol'?: string;      // For type 'fence'
  // exactValue???
  error?: MathNodeErrorString;
  generated?: boolean
  items?: MathNodeItem[];       // If export.jiix.strokes or export.jiix.glyphs are true.
  label?: string;
  'open symbol'?: string;       // For type 'fence'
  operands?: MathNode[];
  rows?: MatrixRow[];
  value?: number;
}

interface MathNodeItem {
  F: number[];
  id: string;
  T: number[];
  timestamp: /* TYPESCRIPT: TimestampString */string;
  type: 'stroke';
  X: number[];
  Y: number[];
}

interface MatrixRow {
  cells: MathNode[];
}

// Constants

export const UNICODE_MIDDLE_DOT = '\u00B7';
export const UNICODE_MULTIPLICATION_SIGN = '\u00D7';
export const UNICODE_DIVISION_SIGN = '\u00F7';
export const UNICODE_NOT_EQUAL_TO_SIGN = '\u2260';
export const UNICODE_LESS_THAN_OR_EQUAL_TO_SIGN = '\u2264';
export const UNICODE_GREATER_THAN_OR_EQUAL_TO_SIGN = '\u2265';
