
import { View } from "./view";
import * as vscode from "vscode";
import { VscodeConfig, vscodeConfigFactory } from "./model/vsconfig";
import { Controller } from "./controller";
import { EventType, Status } from "./model/enums";


let statusBarDisposable = "";



View.prototype.updateInputTool = function(hidden) {
  if (hidden) {
    vscode.commands.executeCommand("setContext", "vscode-ime.enabled", false);
  } else {
    vscode.commands.executeCommand("setContext", "vscode-ime.enabled", true);
  }
  this.updateMenuItems();
}

View.prototype.updateMenuItems = function(stateId) {
  if (statusBarDisposable) {
    vscode.Disposable.from(statusBarDisposable as any).dispose();
    statusBarDisposable = "";
  } else {
    statusBarDisposable = vscode.window.setStatusBarMessage(`${vscodeConfigFactory.getEngineID()}`) as any;

  }
}

View.prototype.refresh = function() {
  
  // if (rawSource.length === 1) {
  //   vscode.commands.executeCommand("editor.action.triggerSuggest");
  // }

  // Show candidate
  
}

function getActiveEditor() {

}


function getChromeEventAdapter() {
  return {
    addListener: console.log, 
    getRules: console.log,
    hasListener: () => true,
    removeRules: console.log, 
    addRules: console.log,
    removeListener: console.log,
    hasListeners: () => true
  }
}

const eventAdapter = getChromeEventAdapter();

global.chrome = {
  storage: {
    sync: {}
  },
  input: {
    ime: {}
  }
} as any;

chrome.storage.sync.get = function(keys?: string | string[] | { [key: string]: any } | null): any {
  console.log('storage.sync.get', arguments);
}
chrome.storage.sync.set = function():any { console.log('storage.sync.set', arguments)}

chrome.input.ime = {
  commitText(parameters: chrome.input.ime.CommitTextParameters) {
    let { activeTextEditor } = vscode.window;
    if (!activeTextEditor) return ;
    let location = activeTextEditor.selection.anchor;
    activeTextEditor.edit((editBuilder) => {
      editBuilder.insert(location, parameters.text);
    });
  },
  setMenuItems(parameters: chrome.input.ime.ImeParameters, callback?: (() => void) | undefined) {
    console.log('setMenuItems', parameters);
  },
  setCandidates(parameters: chrome.input.ime.CandidatesParameters, callback?: ((success: boolean) => void) | undefined) {
    console.log("setCandidates", parameters);
  },
  setComposition(parameters: chrome.input.ime.CompositionParameters, callback?: (success: boolean) => void) {
    console.log("setComposition", parameters);
  },
  updateMenuItems(parameters: chrome.input.ime.MenuItemParameters, callback?: () => void) {
    console.log("updateMenuItems", parameters);
  },
  setAssistiveWindowProperties() { },
  setAssistiveWindowButtonHighlighted() { },
  setCandidateWindowProperties(parameters: chrome.input.ime.CandidateWindowParameter, callback?: (success: boolean) => void) {
    console.log('setCandidateWindowProperties', parameters);
  },
  clearComposition(parameters: chrome.input.ime.ClearCompositionParameters) {
    console.log("clearComposition", parameters);
  },
  setCursorPosition(parameters) {
    console.log('setCursorPosition', parameters);
  },
  sendKeyEvents(parameters) {
    console.log("sendKeyEvents", parameters);
  },
  hideInputView() {
    console.log("hideInputView");
  },
  deleteSurroundingText() {},
  keyEventHandled() {},
  onBlur: eventAdapter,
  onAssistiveWindowButtonClicked: eventAdapter,
  onCandidateClicked: eventAdapter,
  onKeyEvent: eventAdapter,
  onDeactivated: eventAdapter,
  onInputContextUpdate: eventAdapter,
  onActivate: eventAdapter,
  onFocus: eventAdapter,
  onMenuItemActivated: eventAdapter,
  onSurroundingTextChanged: eventAdapter,
  onReset: eventAdapter
}


export function adapter() {
  console.log("Vscode adapter");
}