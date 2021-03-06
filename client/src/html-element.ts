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

import { $new, HtmlElementSpecification } from "./dom";

// Types

// Constants

// Global Variables

// Exported Class

export class HtmlElement<K extends keyof HTMLElementTagNameMap> {

  // Public Class Methods

  // Public Instance Properties

  public $elt: HTMLElementTagNameMap[K];

  // Public Instance Property Functions

  public get isHidden(): boolean {
    return this.$elt.style.display == 'none';
  }

  public get isShown(): boolean { return !this.isHidden; }

  // Public Instance Methods

  public appendTo(parent: HTMLElement|HtmlElement<any>): void {
    const $parent: HTMLElement = (parent instanceof HtmlElement ? parent.$elt : parent);
    $parent.appendChild(this.$elt);
  }

  public destroy(): void {
    this.$elt.remove();
    this.destroyed = true;
  }

  public hide(): void {
    if (!this.isShown) {
      console.warn(`Hiding HTML element that is altready hidden. Ignoring.`);
      return;
    }
    this.onBeforeHide();
    this.$elt.style.display = 'none';
    this.onAfterHide();
  }

  public hideIfShown(): void { if (this.isShown) { this.hide(); } }

  public remove(): void {
    // REVIEW: Both 'remove' and 'destroy'?
    this.$elt.remove();
  }

  public show(): void {
    if (this.isShown) {
      console.warn(`Showing HTML element that is altready shown. Ignoring.`);
      return;
    }
    this.onBeforeShow();
    // Per MDN: "A style declaration is reset by setting it to null or an empty string, ....
    //           Internet Explorer requires setting it to an empty string,..."
    // https://developer.mozilla.org/en-US/docs/Web/API/ElementCSSInlineStyle/style
    // Note: that this will not work if the element is hidden by a declaration in a stylesheet,
    //       rather than style attribute display:none on the element itself.
    this.$elt.style.display = '';
    this.onAfterShow();
  }

  public showIfHidden(): void { if (this.isHidden) { this.show(); } }

  public toggleVisibility(): void {
    if (this.isHidden) { this.show(); }
    else { this.hide(); }
  }

  // -- PRIVATE --

  // Constructor

  protected constructor(spec: HtmlElementSpecification<K>|HTMLElementTagNameMap[K]) {
    if (spec instanceof HTMLElement) {
      this.$elt = spec;
    } else {
      this.$elt = $new(spec);
    }
  }

  // Private Instance Properties

  protected destroyed?: boolean;

  // Private Instance Methods

  // Private Instance Event Handlers

  // NOTE: These event handlers are only called on the element on
  //       which 'show' or 'hide' is called. It is not called on
  //       child or descendant elements which will be shown or hidden
  //       by virtue of the ancestor being shown or hidden.
  //       These events must be manually propagated to
  //       children if necessary.
  protected /* overridable */ onAfterHide(): void {}
  protected /* overridable */ onAfterShow(): void {}
  protected /* overridable */ onBeforeHide(): void {}
  protected /* overridable */ onBeforeShow(): void {}
}
