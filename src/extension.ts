/**
 * IME for vscode extension.
 */

import * as vscode from "vscode";
import { adapter } from "src/imeadapterforvscode";
import { Controller } from "src/controller";
import { VscodeConfig } from "src/model/vsconfig";
import { EventType, InputToolCode, Key } from "src/model/enums";
import { configFactoryInstance } from "src/model/configfactory";
import { mockDownKey } from "src/utils/mock";

const IMECommands = {
  TOGGLE: "vscode-ime.toggle",
  SINGLE_KEY: "vscode-ime.key",
  SHIFT_WITH_KEY: "vscode-ime.shift",
  SPECIAL_KEY: "vscode-ime.special"
}

type IMECommandKey =  keyof typeof IMECommands;

const letters =  "abcdefghijklmnopqrstuvwxyz";
const punctuations = "`-=[]\\;',./";
const numbers = "1234567890";
const specials = ['enter', 'space', 'backspace']; 
const relativeSpecial =  [Key.ENTER, Key.SPACE, Key.BACKSPACE];

const registerCommand = vscode.commands.registerCommand;

class IMEAdapter extends EventTarget {

  vsConfig = new VscodeConfig();
  globalState:Record<string, any> = this.vsConfig.getGlobalState;
  configFactory = configFactoryInstance;

  /** IME EngineID (input tool code). */ 
  engineID: string = this.vsConfig.getEngineID();

  /** The ime status. */
  enabled = false;
  
  controller = new Controller();
  model = this.controller.model;

  constructor(readonly context: vscode.ExtensionContext) {
    super();
    this.#init();
  }

  #init() {
    // Register commands.
    this.registerCommands();
    // Add vscode event listeners.
    this.addVscodeListeners();
    // COMMIT;
    this.addIMEListeners();
  }

  registerCommands() {
    for (let key in IMECommands) {
      let commandKey =  key as IMECommandKey;
      switch(commandKey) {

        case "TOGGLE":
          this.subscriptions.push(registerCommand(
            IMECommands[commandKey], this.toggle.bind(this)
          ));
          break;
        
        case "SINGLE_KEY":
          // let singleKeys = letters + punctuations + numbers;
          let singleKeys = punctuations + numbers;
          singleKeys.split("").forEach((key) => {
            this.subscriptions.push(registerCommand(
              IMECommands[commandKey] + key.toUpperCase(),
              this.emitKeyEvent.bind(this, mockDownKey(key))
            ))
          });
          break;

        case "SHIFT_WITH_KEY":
          let shiftKeys = punctuations + numbers;
          shiftKeys.split("").forEach((key) => {
            this.subscriptions.push(registerCommand(
              IMECommands[commandKey] + key,
              this.emitKeyEvent.bind(this, mockDownKey(key, true))
            ))
          });
          break;

        case "SPECIAL_KEY":
          specials.forEach((key, index) => {
            this.subscriptions.push(registerCommand(
              IMECommands[commandKey] + key,
              this.emitKeyEvent.bind(this, mockDownKey(relativeSpecial[index]))
            ))
          })
          break;
      }
    }
  }

  get subscriptions() {
    return this.context!.subscriptions;
  }

  addVscodeListeners() {
    // vscode.window.onDidChangeTextEditorSelection();
  }

  addIMEListeners() {
    this.controller.model.addEventListener(EventType.COMMIT, this.commitText.bind(this));
    this.controller.model.addEventListener(EventType.MODELUPDATED, this.handleShowCandidates.bind(this));    
  }

  commitText() {

  }

  completionList?: vscode.CompletionList;
  rawSource = "";

  toggle() {
    this.enabled = !this.enabled;

    // TODO need to support vscode state.
    if (this.enabled) {
      this.controller.activate(this.engineID as InputToolCode);
      this.focus();
    } else {
      this.controller.deactivate(this.engineID);
      this.blur();
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

  blur() {
    this.controller.unregister(1);
  }
  
  requestId = 0;
  emitKeyEvent(keyEvent: chrome.input.ime.KeyboardEvent) {
    this.requestId++;
    this.controller.handleEvent(this.engineID as InputToolCode, keyEvent, this.requestId);
  }

  startPos = 0;
  currentText = "";

  handleSurroundingText(text: string) {
    this.currentText = text;
  
    let lastKey = text.slice(-1);
    let rawSource = this.controller.model.rawSource;
    let currentConfig = this.configFactory.getCurrentConfig();

    if (rawSource.length == 0) {
      this.startPos = text.length - 1;
    }

    if (currentConfig.editorCharReg.test(lastKey)) {
      this.emitKeyEvent(mockDownKey(lastKey));
    } else {
      console.log('no used.', text);
      this.blur();
    }

    // if (rawSource.length >= 0 && rawSource != text) {
    //   let lastKey = text.slice(-1);
    //   if (currentConfig.editorCharReg.test(lastKey)) {
    //     this.emitKeyEvent(mockDownKey(lastKey));
    //   } else {
    //     this.controller.unregister(1);
    //   }
    // } else {
    //   this.controller.unregister(1);
    // }
  }

  showingCandidates = "";

  handleShowCandidates() {

    let { candidates } = this.model;
    let { pageSize } = this.configFactory.getCurrentConfig();
    let items = [];
    if (!candidates.length) return ; // Hidden.
    let candidateLog = ""; 
    
    for (let i = 0; i < pageSize; i++) {
      let candidate = candidates[i];

      if (!candidate) break;
      candidateLog += candidate.target;

      let item = new vscode.CompletionItem(candidate.target, vscode.CompletionItemKind.Enum);
      item.sortText = "" + (i+1);
      item.insertText = candidate.target;
      item.label = (i + 1) + " " + candidate.target;
      item.filterText = this.currentText;
      items.push(item);
    }

    if (this.showingCandidates == candidateLog) return;
    this.showingCandidates = candidateLog;

    this.completionList = new vscode.CompletionList(items, true);
    this.dispatchEvent(new Event("completion"));
  }

  getCompletionList(): Promise<vscode.CompletionList | []> {
    return new Promise((resolve, reject) => {
      this.addEventListener("completion", () => {
        resolve(this.completionList ?? []);
      }, {
        once: true
      });
    })
  }

  registerCompletionProvider() {
    let completionProvider = vscode.languages.registerCompletionItemProvider(
      "*",
      {
        provideCompletionItems: (document, position, token, context) => {
          console.log('trigger');
          return [];
          let wordRangePosition = document.getWordRangeAtPosition(position);
          if (!wordRangePosition) return;
          let text = document.getText(wordRangePosition);
          console.log('text', text);
          let promise = this.getCompletionList();
          this.handleSurroundingText(text);
          return promise;
        },
        resolveCompletionItem() {
          return null;
        }
    });
  }
}


adapter();

export function activate(context: vscode.ExtensionContext) {
  console.log("activate");
  const ime = new IMEAdapter(context);

  // Trigger letters key event.
  ime.registerCompletionProvider();
}

export function deactivate() {
  
}
