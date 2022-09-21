/**
 * IME for vscode extension.
 */

import * as vscode from "vscode";
import { adapter } from "src/imeadapterforvscode";
import { Controller } from "src/controller";
import { VscodeConfig } from "./model/vsconfig";
import { EventType, InputToolCode, Key } from "./model/enums";

adapter();

const IMECommands = {
  TOGGLE: "vscode-ime.toggle",
  SINGLE_KEY: "vscode-ime.key",
  SHIFT_WITH_KEY: "vscode-ime.shift",
  SPECIAL_KEY: "vscode-ime.special"
}


type IMECommandKey =  keyof typeof IMECommands;

const registerCommand = vscode.commands.registerCommand;


const letters =  "abcdefghijklmnopqrstuvwxyz";
const punctuations = "`-=[]\\;',./";
const numbers = "1234567890";
const specials = ['enter', 'space', 'backspace']; 
const relativeSpecial =  [Key.ENTER, Key.SPACE, Key.BACKSPACE];


function mockDownKey(key: string, shiftKey: boolean = false): chrome.input.ime.KeyboardEvent {
  return {
    type: EventType.KEYDOWN,
    key,
    code: key,
    ctrlKey: false,
    altKey: false,
    shiftKey
  }
}

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
    // Register commands.
    for (let key in IMECommands) {
      let commandKey =  key as IMECommandKey;
      switch(commandKey) {
        case "TOGGLE":
          this.subscriptions.push(registerCommand(
            IMECommands[commandKey], this.toggle.bind(this)
          ));
          break;
        case "SINGLE_KEY":
          let singleKeys = letters + punctuations + numbers;
          singleKeys.split("").forEach((key) => {
            this.subscriptions.push(registerCommand(
              IMECommands[commandKey] + key.toUpperCase(),
              this.keyEvent.bind(this, mockDownKey(key))
            ))
          });
          break;
        case "SHIFT_WITH_KEY":
          let shiftKeys = punctuations + numbers;
          shiftKeys.split("").forEach((key) => {
            this.subscriptions.push(registerCommand(
              IMECommands[commandKey] + key,
              this.keyEvent.bind(this, mockDownKey(key, true))
            ))
          });
          break;
        case "SPECIAL_KEY":
          specials.forEach((key, index) => {
            this.subscriptions.push(registerCommand(
              IMECommands[commandKey] + key,
              this.keyEvent.bind(this, mockDownKey(relativeSpecial[index]))
            ))
          })
          break;
      }
    }

    // Vscode event.
    vscode.window.onDidChangeTextEditorSelection(this.focus.bind(this));
  }

  toggle() {
    this.enabled = !this.enabled;

    // TODO need to support vscode state.
    if (this.enabled) {
      // vscode.commands.executeCommand("setContext", "vscode-ime.enabled", true);
      this.controller.activate(this.engineID as InputToolCode);
      this.focus();
    } else {
      this.controller.deactivate(this.engineID);
      this.controller.unregister(1);
    }
  }

  focus() {
    let inputContext: chrome.input.ime.InputContext =  {
      contextID: 1,
      autoComplete: false,
      autoCorrect: true,
      spellCheck: false,
      type: "search"
    }
    this.controller.register(inputContext);
  }
  
  requestId = 0;
  keyEvent(keyEvent: chrome.input.ime.KeyboardEvent) {
    this.requestId++;
    // console.log(keyEvent);
    this.controller.handleEvent(this.engineID as InputToolCode, keyEvent, this.requestId);
  }
}

export function activate(context: vscode.ExtensionContext) {

  let ime = new IMEAdapter(context);

}

export function deactivate() {
  
}
