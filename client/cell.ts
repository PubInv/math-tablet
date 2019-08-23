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

// TODO: Add try/catch around all event entry points.

// Requirements

import { $newSvg } from './dom.js';
import { Stroke } from './stroke.js';

// Types

export type Length = string; // CSS length, e.g. 8.5in

type PointerId = number;
type PointerMap = Map<PointerId, PointerInfo>;

export interface CellData {
  id: string;
  size: Size;
}

interface PointerInfo {
  stroke?: Stroke;
}

export interface Size {
  height: Length;
  width: Length;
}

// Cell class

export class Cell {

  // Public Class Methods

  public static create($parent: Element, data: CellData): Cell {
    return new this($parent, data);
  }

  // Private Constructor

  private constructor ($parent: Element, data: CellData) {
    const $svg = $newSvg<SVGSVGElement>('svg', {
      appendTo: $parent,
      attrs: {
        height: data.size.height,
        width: data.size.width,
      },
      class: 'cell',
      id: data.id,
    });

    this.$svg = $svg;
    this.pointerMap = new Map();

    // TODO: 'pointerover', 'pointerout', 'pointerenter', 'pointerleave'
    $svg.addEventListener('pointercancel', e=>this.onPointerCancel(e));
    $svg.addEventListener('pointerdown', e=>this.onPointerDown(e));
    $svg.addEventListener('pointerenter', e=>this.onPointerEnter(e));
    $svg.addEventListener('pointerleave', e=>this.onPointerLeave(e));
    $svg.addEventListener('pointermove', e=>this.onPointerMove(e));
    $svg.addEventListener('pointerout', e=>this.onPointerOut(e));
    $svg.addEventListener('pointerover', e=>this.onPointerOver(e));
    $svg.addEventListener('pointerup', e=>this.onPointerUp(e));
  }

  // Private Instance Properties

  private $svg: SVGSVGElement;
  private pointerMap: PointerMap;

  // Private Instance Property Methods

  private pointerInfo(event: PointerEvent): PointerInfo {
    let rval = this.pointerMap.get(event.pointerId);
    if (!rval) {
      rval = {};
      this.pointerMap.set(event.pointerId, rval);
    }
    return rval;
  }

  // Private Instance Methods


  // Private Event Handlers

  private onPointerCancel(event: PointerEvent): void {
    console.log(`${event.pointerType} ${event.pointerId} ${event.type}`);
    // console.dir(event);
  }

  private onPointerDown(event: PointerEvent): void {
    console.log(`${event.pointerType} ${event.pointerId} ${event.type}`);
    // console.dir(event);
    this.$svg.setPointerCapture(event.pointerId);
    const pi = this.pointerInfo(event);

    if (pi.stroke) {
      console.error(`Pointer ${event.pointerId} already has a stroke. Discarding.`);
      pi.stroke.abort();
      delete pi.stroke;
    }
    const clientRect = this.$svg.getBoundingClientRect();
    pi.stroke = Stroke.start(this.$svg, event, clientRect);
  }

  private onPointerEnter(_event: PointerEvent): void {
    // console.log(`${event.pointerType} ${event.pointerId} ${event.type}`);
    // console.dir(event);
  }

  private onPointerLeave(_event: PointerEvent): void {
    // console.log(`${event.pointerType} ${event.pointerId} ${event.type}`);
    // console.dir(event);
  }

  private onPointerMove(event: PointerEvent): void {
    // console.dir(event);
    const pi = this.pointerInfo(event);
    if (pi.stroke) {
      const clientRect = this.$svg.getBoundingClientRect();
      pi.stroke.extend(event, clientRect);
    }
  }

  private onPointerOut(_event: PointerEvent): void {
    // console.log(`${event.pointerType} ${event.pointerId} ${event.type}`);
    // console.dir(event);
  }

  private onPointerOver(_event: PointerEvent): void {
    // console.log(`${event.pointerType} ${event.pointerId} ${event.type}`);
    // console.dir(event);
  }

  private onPointerUp(event: PointerEvent): void {
    console.log(`${event.pointerType} ${event.pointerId} ${event.type}`);
    // console.dir(event);
    const pi = this.pointerInfo(event);
    if (!pi.stroke) {
      console.warn(`Pointer ${event.pointerId} doesn't have a stroke. Ignoring.`);
      return;
    }
    const clientRect = this.$svg.getBoundingClientRect();
    pi.stroke.end(event, clientRect);
    delete pi.stroke;
  }

}

