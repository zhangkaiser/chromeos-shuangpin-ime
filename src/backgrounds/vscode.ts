
import * as vscode from "vscode";

import { Controller } from "src/controller";
import { VscodeConfig } from "src/model/vsconfig";
import { EventType, InputToolCode, Key, Status } from "src/model/enums";
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
const shiftPunctuations = '~!@#$%^&*()_+{}|:"<>?';
const numbers = "1234567890";
const specials = ['enter', 'space', 'backspace', 'escape']; 
const relativeSpecial =  [Key.ENTER, Key.SPACE, Key.BACKSPACE, Key.ESC];

const registerCommand = vscode.commands.registerCommand;

export class IMEBackground extends EventTarget {
  static CompletionEvent = new Event("completion");
  static kTriggerCharacters = (letters + numbers + punctuations + shiftPunctuations).split("");

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
    return this.context.subscriptions;
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

  get allowedRegExps() {
    let currentConfig = this.configFactory.getCurrentConfig();
    return [
      currentConfig.editorCharReg, 
      currentConfig.selectKeyReg, 
      currentConfig.pageupCharReg, 
      currentConfig.pagedownCharReg
    ];
  } 

  /** TODO */
  isIMEConfigKey(char: string) {
    // return this.allowedRegExps.some((regExp) => regExp.test(char));
    return IMEBackground.kTriggerCharacters.indexOf(char) >= 0;
  }

  handleSurroundingText(text: string) {
    this.currentText = text;
  
    let lastKey = text.slice(-1);
    let rawSource = this.controller.model.rawSource;

    if (rawSource.length == 0) {
      this.startPos = text.length - 1;
    }

    if (this.isIMEConfigKey(lastKey)) {
      if (!this.controller._context) this.focus();
      this.emitKeyEvent(mockDownKey(lastKey));
    } else {
      this.blur();
      this.dispatchEvent(IMEBackground.CompletionEvent);
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
    for (let i = 0; i < pageSize; i++) {
      let candidate = candidates[i];

      if (!candidate) break;

      let item = new vscode.CompletionItem(candidate.target, vscode.CompletionItemKind.Enum);
      item.sortText = "" + (i+1);
      item.insertText = candidate.target;
      item.label = (i + 1) + " " + candidate.target;
      item.filterText = this.currentText;
      items.push(item);
    }


    this.completionList = new vscode.CompletionList(items, true);
    this.dispatchEvent(IMEBackground.CompletionEvent);
  }

  addCompletionListener(): Promise<vscode.CompletionList | []> {
    return new Promise((resolve, reject) => {
      this.addEventListener("completion", () => {
        resolve(this.model.status != Status.INIT 
          ? this.completionList ?? [] : []);
      }, {
        once: true
      });
    })
  }

  registerCompletionProvider() {
    let completionProvider = vscode.languages.registerCompletionItemProvider(
      {
        scheme: "*",
        language: "*"
      },
      {
        provideCompletionItems: (document, position, token, context) => {
          let wordRangePosition = document.getWordRangeAtPosition(position);
          if (!wordRangePosition) return;
          let text = document.getText(wordRangePosition);
          let completionListPromise = this.addCompletionListener();

          this.handleSurroundingText(text);
          return completionListPromise;
        },
        resolveCompletionItem() {
          return null;
        },
      },
      ...IMEBackground.kTriggerCharacters
    );
  }

  registerPredictionProvider() {
    vscode.languages.registerCompletionItemProvider(
      {
        scheme: "*",
        language: "*"
      },
      {
        provideCompletionItems: () => {
          
          let promise: Promise<vscode.CompletionList<vscode.CompletionItem> | vscode.CompletionItem[]> = new Promise((resolve) => {
            setTimeout(() => {
              let item = new vscode.CompletionItem("test", vscode.CompletionItemKind.Text);
              item.sortText = "" + 6;
              item.insertText = "test";
              item.label = 6 + " " + "test";
              item.filterText = this.currentText;
              resolve([
                item
              ])
            }, 1000);
          });
          console.log("prediction");
          return promise;
        },
        resolveCompletionItem() {
          return null;
        }
      }
    )
  }
}
