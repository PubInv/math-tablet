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

// TODO: Dispose of screens if they have not been shown in a sufficiently long time.

// Requirements

import { Html } from "./shared/common";
import { initialize as initializeFormula } from "./shared/formula";

import { DebugConsole } from "./components/debug-console";
import { Header } from "./components/header";

import { addAsyncEventListener, addSyncEventListener } from "./dom";
import { showError } from "./user-message-dispatch";
import { Pathname, ScreenManager } from "./screens/screen-manager";
import { ClientSocket } from "./client-socket";
import { ClientUser } from "./client-user";
import { UserMessageDisplay } from "./user-message-display";
import { MathJaxTypesetter } from "./adapters/mathjax-typesetter";

// Types

// Constants

// Global Variables

// App Class

class App {

  // Class Methods

  // Public Constructor

  public constructor() {
    // DO NOT CALL. Just use appInstance singleton.
    addAsyncEventListener(window, 'DOMContentLoaded', e=>this.onDomContentLoaded(e), <Html>"App initialization error");
    addSyncEventListener<HashChangeEvent>(window, 'hashchange', e=>this.onHashChange(e), <Html>"App navigation error");
  }

  // Public Instance Properties

  // REVIEW: Ensure these are read-only?
  public header!: Header;
  public socket!: ClientSocket;  // Connection initiated at DOM ready.

  // Public Instance Methods

  // --- PRIVATE ---

  // Private Instance Properties


  // Private Property Functions

  private get currentPath(): Pathname {
    const hash = window.location.hash;
    return <Pathname>(hash.length <= 1 ? '/' : decodeURI(hash.slice(1)));
  }

  // Private Instance Methods

  // Private Instance Event Handlers

  private async onDomContentLoaded(_event: Event): Promise<void> {

    // Add the top-level components to body that are not on a 'screen'.
    // This includes the header bar and user message ticker.
    const messageDisplay = new UserMessageDisplay();
    const debugConsole = DebugConsole.initialize();
    this.header = new Header();
    const $body = <HTMLBodyElement>window.document.body;
    $body.append(messageDisplay.$elt, debugConsole.$elt, this.header.$elt);

    // Initialize the math typesetter
    initializeFormula(MathJaxTypesetter.create());

    // Initialize the 'screen' system that provides navigation
    // inside the one-page app.
    ScreenManager.initialize();

    // Make our websocket connection with the server.
    // TODO: Show a "connecting..." spinner.
    const protocol = (window.location.protocol == 'https:' ? 'wss:' : 'ws:');
    this.socket = await ClientSocket.connect(`${protocol}//${window.location.host}/`);

    // If a user is logged in, as evidenced by a token in localStorage,
    // then send the token to the server.
    try { await ClientUser.loginIfSavedToken(); }
    catch(err) { showError(err, <Html>`Please log in again. Cannot restore user session`); }

    // Navigate to the screen indicated by our current URL.
    ScreenManager.navigateTo(this.currentPath);
  }

  private onHashChange(_event: HashChangeEvent): void {
    ScreenManager.navigateTo(this.currentPath);
  }
}

// Exported singleton instance

export const appInstance = new App();
