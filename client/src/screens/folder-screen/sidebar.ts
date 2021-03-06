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

import { CssClass } from "../../shared/css";
import { $new } from "../../dom";
import { FolderScreen } from ".";
import { ButtonBar } from "../../components/button-bar";
import { largeSvgIcon } from "../../svg-icons";

// Types

// Constants

// Global Variables

// Exported Class

export class Sidebar extends ButtonBar {

  // Public Class Methods

  // Public Constructor

  public constructor(screen: FolderScreen) {

    const $newFolderButton = $new({
      tag: 'button',
      class: <CssClass>'iconButton',
      html: largeSvgIcon('iconMonstrFolder5'),
      asyncButtonHandler: (e: MouseEvent)=>this.onNewFolderClicked(e),
      title: "New folder",
    });

    const $newNotebookButton = $new({
      tag: 'button',
      class: <CssClass>'iconButton',
      html: largeSvgIcon('iconMonstrFile15'),
      asyncButtonHandler: (e: MouseEvent)=>this.onNewNotebookClicked(e),
      title: "New notebook",
    });

    super({
      tag: 'div',
      class: <CssClass>'sidebar',
      children: [ $newFolderButton, $newNotebookButton ],
    });

    this.screen = screen;
  }

  // Public Instance Properties

  // Public Instance Methods

  // -- PRIVATE --

  // Public Constructor

  // Private Instance Properties

  private screen: FolderScreen;

  // Private Instance Event Handlers

  private async onNewFolderClicked(_event: MouseEvent): Promise<void> {
    const entry = await this.screen.folder.newFolderRequest();
    this.screen.view.editFolderName(entry.name);
  }

  private async onNewNotebookClicked(_event: MouseEvent): Promise<void> {
    const entry = await this.screen.folder.newNotebookRequest();
    this.screen.view.editNotebookName(entry.name);
  }

}
