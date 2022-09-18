/**
 * IME for vscode extension.
 */

import * as vscode from "vscode";
import { Controller } from "src/controller";
import { VscodeConfig } from "./model/vsconfig";
import { InputToolCode } from "./model/enums";

const IMECommands = {
  TOGGLE: "vscode-ime.toggle",


}

type IMECommandKey =  keyof typeof IMECommands;

const registerCommand = vscode.commands.registerCommand;

class IMEAdapter {
  
  controller = new Controller();
  vsConfig = new VscodeConfig();

  engineID: string = "";

  globalState:Record<string, any> = {};

  enabled = false;

  constructor(readonly context: vscode.ExtensionContext) {
    
    this.globalState = this.vsConfig.getGlobalState();
    this.engineID = this.vsConfig.getEngineID();
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
    this.enabled = !this.enabled;

    // TODO need to support vscode state.
    if (this.enabled) {
      this.controller.activate(this.engineID as InputToolCode);
    } else {
      this.controller.deactivate(this.engineID);
    }
  }

  focus() {
    
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
