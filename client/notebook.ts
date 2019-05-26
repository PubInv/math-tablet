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

import { ServerSocket } from './server-socket.js';

import { NotebookName, TDocObject, StyleId, StyleObject,
  ThoughtId, ThoughtObject, NotebookChange, ThoughtProperties, StyleProperties, RelationshipId, RelationshipObject, UseTool, InsertThought, StyleSource, ToolInfo } from './math-tablet-api.js';
// import { Jiix, StrokeGroups } from './myscript-types.js';
import { ThoughtElement } from './thought-element.js';
import { $new, escapeHtml, Html } from './dom.js';

// Exported Class

export class Notebook {

  // Class Methods

  public static get(notebookName: NotebookName): Notebook|undefined {
    return this.notebooks.get(notebookName);
  }

  public static open(socket: ServerSocket, notebookName: NotebookName, notebookData: TDocObject): Notebook {
    let notebook = this.notebooks.get(notebookName);
    if (!notebook) {
      notebook = new this(socket, notebookName, notebookData);
      this.notebooks.set(notebookName, notebook);
    }
    return notebook;
  }

  // Instance Properties

  public $elt: HTMLElement;
  public notebookName: NotebookName;

  // Instance Property Functions

  public debugHtml(): Html {
    return Array.from(this.thoughtElements.values()).map(t=>this.debugThoughtHtml(t)).join('');
  }

  // Instance Methods

  public close() {
    // TODO: remove event listeners?
    // TODO: delete element?
    // TODO: mark closed?
    this.clear();
    Notebook.notebooks.delete(this.notebookName);
  }

  // Server Message Handlers

  public smChange(change: NotebookChange): void {
    switch (change.type) {
      case 'relationshipDeleted': this.chDeleteRelationship(change.relationship.id); break;
      case 'relationshipInserted': this.chInsertRelationship(change.relationship); break;
      case 'styleDeleted': this.chDeleteStyle(change.styleId); break;
      case 'styleInserted': this.chInsertStyle(change.style); break;
      case 'thoughtDeleted': this.chDeleteThought(change.thoughtId); break;
      case 'thoughtInserted': this.chInsertThought(change.thought); break;
    }
  }

  public smClose(): void { return this.close(); }

  public insertThought(thoughtProps: ThoughtProperties, stylePropss: StyleProperties[]): void {
    const msg: InsertThought = { 
      action: 'insertThought', 
      notebookName: this.notebookName, 
      thoughtProps, 
      stylePropss,
    }
    this.socket.sendMessage(msg);
  }

  public useTool(thoughtElt: ThoughtElement, source: StyleSource, info: ToolInfo, ): void {
    const msg: UseTool = { 
      action: 'useTool', 
      notebookName: this.notebookName, 
      info, 
      source, 
      thoughtId: thoughtElt.thought.id,
    };
    this.socket.sendMessage(msg);
  }

  // -- PRIVATE --

  // Private Class Properties

  private static notebooks: Map<NotebookName, Notebook> = new Map();
  
  // Private Constructor

  private constructor(socket: ServerSocket, notebookName: NotebookName, notebookData: TDocObject) {
    this.socket = socket;
    this.notebookName = notebookName;

    this.$elt = $new('div', notebookName, ['tdoc']);
    this.$elt.addEventListener('click', (event: MouseEvent)=>{ this.onClick(event); })

    this.relationships = new Map();
    this.styles = new Map();
    this.thoughtElements = new Map();

    for (const thought of notebookData.thoughts) { this.chInsertThought(thought); }
    for (const style of notebookData.styles) { this.chInsertStyle(style); }
  }

  // Private Instance Properties

  private socket: ServerSocket;
  private relationships: Map<RelationshipId, RelationshipObject>;
  private styles: Map<StyleId, StyleObject>;
  private thoughtElements: Map<ThoughtId, ThoughtElement>;

  // Private Event Handlers

  private onClick(event: MouseEvent): void {
    const $target = <HTMLElement>event.target;
    if (!$target) { throw new Error("TDoc click event has no target!"); }
    if ($target.nodeName == 'BUTTON' && $target.classList.contains('deleteThought')) {
      const $parent = $target.parentElement;
      if (!$parent) { throw new Error("TDoc button has no parent!"); }
      const thoughtId = parseInt($parent.id.slice(1));
      this.socket.sendMessage({ action: 'deleteThought', notebookName: this.notebookName, thoughtId });
    }
  }

  // Private Change Event Handlers

  private chDeleteRelationship(relationshipId: RelationshipId): void {
    const relationshipElt = this.relationships.get(relationshipId);
    if (!relationshipElt) { throw new Error("Delete relationship message for unknown style"); }
    this.relationships.delete(relationshipId);
  }

  private chDeleteStyle(styleId: StyleId): void {
    const style = this.styles.get(styleId);
    if (!style) { throw new Error("Delete style message for unknown style"); }
    this.styles.delete(styleId);
    const thoughtElt = this.thoughtElements.get(style.stylableId);
    if (thoughtElt) { thoughtElt.deleteStyle(style); }
  }

  private chDeleteThought(thoughtId: ThoughtId): void {
    const thoughtElt = this.thoughtElements.get(thoughtId);
    if (!thoughtElt) { throw new Error("Delete thought message for unknown thought"); }
    thoughtElt.delete();
    this.thoughtElements.delete(thoughtId);
  }

  private chInsertRelationship(relationship: RelationshipObject): void {
    this.relationships.set(relationship.id, relationship);
  }

  private chInsertStyle(style: StyleObject): void {
    this.styles.set(style.id, style);
    const elt = this.thoughtElements.get(style.stylableId);
    if (elt) { elt.insertStyle(style); }
    }

  private chInsertThought(thought: ThoughtObject): void {
    const thoughtElt = ThoughtElement.insert(this, thought);
    this.thoughtElements.set(thought.id, thoughtElt);
  }

  // Private Instance Methods

  private clear(): void {
    this.$elt.innerHTML = '';
    this.thoughtElements.clear();
    this.styles.clear();
  }

  private debugRelationshipHtml(relationship: RelationshipObject): Html {
    return `<div><span class="leaf">R${relationship.id} &#x27a1; ${relationship.targetId}</span></div>`;
  }

  private debugStyleHtml(style: StyleObject): Html {
    const styleElements = this.stylesAttachedToStyle(style);
    const relationshipElements = this.relationshipsAttachedToStyle(style);
    const json = escapeHtml(JSON.stringify(style.data));
    if (styleElements.length == 0 && relationshipElements.length == 0 && json.length<30) {
      return `<div><span class="leaf">S${style.id} ${style.type} ${style.meaning} ${style.source} <tt>${json}</tt></span></div>`;
    } else {
      const stylesHtml = styleElements.map(s=>this.debugStyleHtml(s)).join('');
      const relationshipsHtml = relationshipElements.map(r=>this.debugRelationshipHtml(r)).join('');
      const [ shortJsonTt, longJsonTt ] = json.length<30 ? [` <tt>${json}</tt>`, ''] : [ '', `<tt>${json}</tt>` ];
      return `<div>
  <span class="collapsed">S${style.id} ${style.type} ${style.meaning} ${style.source}${shortJsonTt}</span>
  <div class="nested" style="display:none">${longJsonTt}
    ${stylesHtml}
    ${relationshipsHtml}
  </div>
</div>`;
    }
  }

  private debugThoughtHtml(t: ThoughtElement): Html {
    const styleElements = this.stylesAttachedToThought(t);
    const relationshipElements = this.relationshipsAttachedToThought(t);
    if (styleElements.length == 0 && relationshipElements.length == 0) {
      return `<div><span class="leaf">T${t.thought.id}</span></div>`;
    } else {
      const stylesHtml = styleElements.map(s=>this.debugStyleHtml(s)).join('');
      const relationshipsHtml = relationshipElements.map(r=>this.debugRelationshipHtml(r)).join('');
      return `<div>
  <span class="collapsed">T${t.thought.id}</span>
  <div class="nested" style="display:none">
    ${stylesHtml}
    ${relationshipsHtml}
  </div>
</div>`;
    }
  }

  private relationshipsAttachedToStyle(s: StyleObject): RelationshipObject[] {
    return Array.from(this.relationships.values()).filter(r=>r.sourceId==s.id);
  }

  private relationshipsAttachedToThought(t: ThoughtElement): RelationshipObject[] {
    return Array.from(this.relationships.values()).filter(r=>r.sourceId==t.thought.id);
  }

  private stylesAttachedToStyle(s: StyleObject): StyleObject[] {
    return Array.from(this.styles.values()).filter(s2=>s2.stylableId==s.id);
  }

  private stylesAttachedToThought(t: ThoughtElement): StyleObject[] {
    return Array.from(this.styles.values()).filter(s=>s.stylableId==t.thought.id);
  }

}