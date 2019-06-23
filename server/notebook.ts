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

// Requirement

import * as debug1 from 'debug';
const MODULE = __filename.split(/[/\\]/).slice(-1)[0].slice(0,-3);
const debug = debug1(`server:${MODULE}`);

import {
  NotebookChange, RelationshipId, RelationshipMap, RelationshipObject, StyleId, StyleMap, StyleMeaning, StyleObject, StyleType, NotebookObject
} from '../client/math-tablet-api';

// Constants

export const VERSION = "0.0.8";

// Exported Class

export class Notebook {

  // Constructor

  public constructor(obj?: NotebookObject) {
    if (!obj) {
      this.nextId = 1;
      this.relationshipMap = {};
      this.styleMap = {};
      this.styleOrder = [];
      this.version = VERSION;
      // IMPORTANT: If you add any non-persistent fields (underscore-prefixed)
      // that need to be initialized, initialize them below, and also in fromJSON.
    } else {
      if (!obj.nextId) { throw new Error("Invalid notebook object JSON."); }
      if (obj.version != VERSION) { throw new Error("Unexpected version for notebook."); }
      this.nextId = obj.nextId;
      this.relationshipMap = obj.relationshipMap;
      this.styleMap = obj.styleMap;
      this.styleOrder = obj.styleOrder;
      this.version = obj.version;
    }
  }

  // Instance Properties

  public version: string;
  public nextId: StyleId;

  // Instance Property Functions

  // REVIEW: Return an iterator?
  public allRelationships(): RelationshipObject[] {
    const sortedIds: RelationshipId[] = Object.keys(this.relationshipMap).map(k=>parseInt(k,10)).sort();
    return sortedIds.map(id=>this.relationshipMap[id]);
  }

  public relationshipsOf(id: StyleId): RelationshipObject[] {
    return this.allRelationships().filter(r=>(r.fromId == id || r.toId == id));
  }

  // REVIEW: Return an iterator?
  public allStyles(): StyleObject[] {
    const sortedIds: StyleId[] = Object.keys(this.styleMap).map(k=>parseInt(k,10)).sort();
    return sortedIds.map(id=>this.styleMap[id]);
  }

  // Returns all thoughts in notebook order
  // REVIEW: Return an iterator?
  public topLevelStyleOrder(): StyleId[] { return this.styleOrder; }

  public childStylesOf(id: StyleId): StyleObject[] {
    return this.allStyles().filter(s=>(s.parentId==id));
  }

  // find all children of given type and meaning
  public findChildStylesOfType(id: StyleId, type: StyleType, meaning?: StyleMeaning): StyleObject[] {

    // we will count ourselves as a child here....
    const rval: StyleObject[] = [];

    const style = this.styleMap[id];
    if (style && style.type == type && (!meaning || style.meaning == meaning)) {
      // we match, so we add ourselves...
      rval.push(<StyleObject>style);
    } // else { assert(this.thoughtMap[id] }

    // now for each kid, recurse...
    // DANGER! this makes this function asymptotic quadratic or worse...
    const kids = this.childStylesOf(id);
    for(const k of kids) {
      const kmatch = this.findChildStylesOfType(k.id, type, meaning);
      for(let km of kmatch) { rval.push(km); }
    }

    return rval;
  }

  public getRelationshipById(id: RelationshipId): RelationshipObject {
    const rval = this.relationshipMap[id];
    if (!rval) { throw new Error(`Relationship ${id} doesn't exist.`); }
    return rval;
  }

  public getStyleById(id: StyleId): StyleObject {
    const rval = this.styleMap[id];
    if (!rval) { throw new Error(`Style ${id} doesn't exist.`); }
    return rval;
  }

  // Return all StyleObjects which are Symbols for which
  // the is a Symbol Dependency relationship with this
  // object as the the target
  // Note: The defintion is the "source" of the relationship
  // and the "use" is "target" of the relationship.
  public getSymbolStylesIDependOn(style:StyleObject): StyleObject[] {
    // simplest way to do this is to iterate over all relationships,
    // computing the source and target thoughts. If the target thought
    // is the same as our ancestor thought, then we return the
    // source style, which should be of type Symbol and meaning Definition.
    const rs = this.allRelationships();
    var symbolStyles: StyleObject[] = [];
    const mp = this.topLevelStyleOf(style.id);
    if (!mp) {
      console.error("INTERNAL ERROR: did not produce ancenstor: ",style.id);
      throw new Error("INTERNAL ERROR: did not produce ancenstor: ");
    }
    rs.forEach(r => {
      const rp = this.topLevelStyleOf(r.toId);
      if (!rp) {
        console.error("INTERNAL ERROR: did not produce ancenstor: ",style.id);
        throw new Error("INTERNAL ERROR: did not produce ancenstor: ");
      }
      if (rp.id == mp.id) {
        // We are a user of this definition...
        symbolStyles.push(this.getStyleById(r.fromId));
      }
    });
    return symbolStyles;
  }

  public numStyles(tname: StyleType, meaning?: StyleMeaning) : number {
    return this.allStyles().reduce(
      function(total,x){
        return (x.type == tname && (!meaning || x.meaning == meaning))
          ?
          total+1 : total},
      0);
  }

  // This can be asymptotically improved later.
  public styleHasChildOfType(style: StyleObject, tname: StyleType, meaning?: StyleMeaning): boolean {
    const id = style.id;
    return !!this.childStylesOf(id).find(s => s.type == tname && (!meaning || s.meaning == meaning));
  }

  // Remove fields with an underscore prefix, because they are not supposed to be persisted.
  public toJSON(): NotebookObject {
    const obj = { ...this };
    for (const key in obj) {
      if (key.startsWith('_')) { delete obj[key]; }
    }
    return <NotebookObject><unknown>obj;
  }

  public topLevelStyleOf(id: StyleId): StyleObject {
    const style = this.styleMap[id];
    if (!style) { throw new Error("Cannot find top-level style."); }
    if (!style.parentId) { return style; }
    return this.topLevelStyleOf(style.parentId);
  }

  // Instance Methods

  public applyChange(change: NotebookChange): void {
    switch(change.type) {
      case 'relationshipDeleted':
        this.deleteRelationship(change.relationship);
        break;
      case 'relationshipInserted':
        this.insertRelationship(change.relationship);
        break;
      case 'styleDeleted':
        this.deleteStyle(change.style);
        break;
      case 'styleInserted':
        this.insertStyle(change.style, change.afterId);
        break;
      default:
        throw new Error("Unexpected");
    }
  }

  public applyChanges(changes: NotebookChange[]): void {
    for (const change of changes) { this.applyChange(change); }
  }

  // --- PRIVATE ---

  // Private Class Properties

  // Private Class Methods

  // Private Instance Properties

  private relationshipMap: RelationshipMap;
  private styleMap: StyleMap;     // Mapping from style ids to style objects.
  private styleOrder: StyleId[];  // List of style ids in the top-down order they appear in the notebook.

  // NOTE: Properties with an underscore prefix are not persisted.

  // Private Event Handlers

  // Private Instance Methods

  private deleteRelationship(relationship: RelationshipObject): void {
    // TODO: relationship may have already been deleted by another observer.
    const id = relationship.id;
    if (!this.relationshipMap[id]) { throw new Error(`Deleting unknown relationship ${id}`); }
    delete this.relationshipMap[id];
  }

  private deleteStyle(style: StyleObject): void {
    const id = style.id;
    if (!this.styleMap[id]) { throw new Error(`Deleting unknown style ${id}`); }
    // If this is a top-level style then remove it from the top-level style order.
    if (!style.parentId) {
      const i = this.styleOrder.indexOf(id);
      this.styleOrder.splice(i,1);
    }
    delete this.styleMap[id];
  }

  private insertRelationship(relationship: RelationshipObject): void {
    debug(`inserting relationship ${JSON.stringify(relationship)}`)
    this.relationshipMap[relationship.id] = relationship;
  }

  private insertStyle(style: StyleObject, afterId?: StyleId): void {
    debug(`inserting style after ${afterId}: ${style.source} ${style.id} ${style.meaning}`);
    this.styleMap[style.id] = style;
    // Insert top-level styles in the style order.
    if (!style.parentId) {
      if (!afterId || afterId===0) {
        this.styleOrder.unshift(style.id);
      } else if (afterId===-1) {
        this.styleOrder.push(style.id);
      } else {
        const i = this.styleOrder.indexOf(afterId);
        if (i<0) { throw new Error(`Cannot insert thought after unknown thought ${afterId}`); }
        this.styleOrder.splice(i+1, 0, style.id);
      }
    }
  }
}

// HELPER FUNCTIONS