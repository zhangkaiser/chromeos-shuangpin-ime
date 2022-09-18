/**
 * IME for vscode extension.
 */

import * as vscode from "vscode";
import { Controller } from "src/controller";

const IMECommands = {
  TOGGLE: "vscode-ime.toggle",


}

type IMECommandKey =  keyof typeof IMECommands;

const registerCommand = vscode.commands.registerCommand;

class IMEAdapter {
  
  controller = new Controller();

  enabled = false;

  constructor(readonly context: vscode.ExtensionContext) {
    this.#init();
  }

  get subscriptions() {
    return this.context.subscriptions;
  }

  #init() {
    // 
    for (let key in IMECommands) {
      let commandKey =  key as IMECommandKey;
      switch(commandKey) {
        case "TOGGLE":
          this.subscriptions.push(registerCommand(
            IMECommands[commandKey], this.toggle.bind(this)
          ));
          break;
      }
    }
  }

  toggle() {
    if (this.enabled) {

    }
  }
}

export function activate(context: vscode.ExtensionContext) {

  let ime = new IMEAdapter(context);
  

  const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
    vscode.window.showInformationMessage("Hello World from testing.");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {

}
