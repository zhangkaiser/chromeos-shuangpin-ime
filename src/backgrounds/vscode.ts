
import * as vscode from "vscode";

import { chromeApiAdapter, triggeredState } from "src/vscode/adapter";

import { Controller } from "src/controller";
import { VscodeConfig } from "src/model/vsconfig";
import { EventType, InputToolCode, Key, Status } from "src/model/enums";
import { configFactoryInstance } from "src/model/configfactory";

import { mockDownKey } from "src/utils/mock";
import { Model } from "src/model/model";
import { View } from "src/view";


const IMECommands = {
  TOGGLE: "vscode-ime.toggle",
  COMMIT: "vscode-ime.commit",
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

const StateID = {
  enabled: "vscode-ime.enabled",
  punc: "vscode-ime.state.punc",
  inited: "vscode-ime.inited"
}

function getLastChar(document: vscode.TextDocument,position: vscode.Position) {
  return document.getText(
    new vscode.Range(
      new vscode.Position(position.line, position.character - 1),
      position
    ),
  );
}

export class IMEBackground extends EventTarget {

  static completionEvent = new Event("completion");
  static kTriggerCharacters = (letters + numbers).split("");
  static kPuncCharacters = (punctuations + shiftPunctuations + " ").split("");
  static kProviderSelector = [
    { scheme: "file", language: "*" }, 
    { scheme: "untitled", language: "*"}
  ];

  vsConfig = new VscodeConfig();

  imeConfigFactory = configFactoryInstance;

  /** IME EngineID (input tool code). */ 
  engineID: string = this.vsConfig.getEngineID();
  requestId = 0;

  /** The ime status. */
  enabled = false;
  
  controller: Controller;
  model: Model;

  startPosition?: vscode.Position;
  currentProviderPos?: vscode.Position;
  currentTriggeredText = "";

  currentText = "";

  #statusBarDisposable?: vscode.Disposable;
  disposables: vscode.Disposable[] = [];

  get subscriptions() {
    return this.context.subscriptions;
  }

  get statusBarMessage() {
    return this.vsConfig.getEngineID() + this.vsConfig.getGlobalState().shuangpinSolution;
  }

  constructor(readonly context: vscode.ExtensionContext) {
    super();
    
    this.registerAdapter();
    this.controller = new Controller();
    this.model = this.controller.model;
    
    this.#init();
  }

  /** Register adapter. */
  registerAdapter() {
    chromeApiAdapter();
    View.prototype.updateInputTool = this.updateStatus.bind(this);
    View.prototype.refresh = this.refresh.bind(this);
  }

  #init() {
    
    // Register commands.
    this.#registerVscodeCommands();
    // COMMIT;
    this.#addIMEListeners();    
  }

  updateStatus(hidden: boolean) {
    this._updateEnabled(hidden);
    this._updateStatusBar();
  }

  /** @todo */
  refresh() {
    // vscode.commands.executeCommand("editor.action.triggerSuggest");
  }

  _updateEnabled(boolean: boolean) {
    vscode.commands.executeCommand(
      "setContext", StateID.enabled, boolean
    );
  }

  _updateStatusBar() {
    if (this.#statusBarDisposable) {
      vscode.Disposable.from(this.#statusBarDisposable).dispose();
      this.#statusBarDisposable = undefined;
    } else {
      this.#statusBarDisposable = vscode.window.setStatusBarMessage(
        this.statusBarMessage
      );
    }
  }

  _registerAndPushCommand(command: string, cb: any) {
    this.subscriptions.push(
      vscode.commands.registerCommand(command, cb)
    );
  }

  #registerVscodeCommands() {

    // vscode-ime.toggle
    this._registerAndPushCommand(IMECommands.TOGGLE, this.toggle.bind(this));
    // vscode-ime.commit
    this._registerAndPushCommand(IMECommands.COMMIT, this.commitText.bind(this));

    // single keys
    // TODO Needed or not.
    // let singleKeys = punctuations + numbers;
    // singleKeys.split("").forEach((key) => {
    //   this._registerAndPushCommand(
    //     IMECommands.SINGLE_KEY + key.toUpperCase(),
    //     this.emitKeyEvent.bind(this, mockDownKey(key))
    //   );
    // });

    // shift with keys
    // let shiftKeys = punctuations + numbers;
    // shiftKeys.split("").forEach((key) => {
    //   this._registerAndPushCommand(
    //     IMECommands.SHIFT_WITH_KEY + key,
    //     this.emitKeyEvent.bind(this, mockDownKey(key, true))
    //   );
    // });

    // special keys.
    specials.forEach((key, index) => {
      this._registerAndPushCommand(
        IMECommands.SPECIAL_KEY + key,
        this.emitKeyEvent.bind(this, mockDownKey(relativeSpecial[index]))
      );
    });
  }

  #addVscodeChangeTextSelectionListeners() {
    // TODO
    //this
    return vscode.window.onDidChangeTextEditorSelection(() => {
      if (this.model.status !== 0) return ;
      vscode.commands.executeCommand("editor.action.triggerSuggest");

      // let editor = vscode.window.activeTextEditor;
      // if (!editor) return;

      // let lastKey = getLastChar(editor.document, editor.selection.active);
      // if (!this.imeConfigFactory.getCurrentConfig().editorCharReg.test(lastKey)) return ;
      // if (this.currentProviderPos) {
      //   let lastSuggest = this.currentProviderPos.character;

      // }
    });
  }

  #addIMEListeners() {
    this.controller.model.addEventListener(EventType.COMMIT, this.commitText.bind(this));
    this.controller.model.addEventListener(EventType.MODELUPDATED, this.handleShowCandidates.bind(this));    
  }

  commitText() {
    this.currentProviderPos = undefined;
    this.imeFocus();
  }

  completionList?: vscode.CompletionList;
  rawSource = "";

  toggle() {
    this.enabled = !this.enabled;

    if (this.enabled) {
      this.imeActivate();
    } else {
      this.imeDeactivate();
    }
  }

  imeActivate() {
    this.controller.activate(this.engineID as InputToolCode);
    this.updateIMEConfig();
    // Add vscode event listeners.
    this.disposables.push(this.#addVscodeChangeTextSelectionListeners());
    
    this.disposables.push(this.#registerCompletionProvider());
    
    this.disposables.push(this.#registerPuncCompletionProvider());
  }

  imeDeactivate() {
    this.imeBlur();

    while(this.disposables.length > 0) {
      let disposable = this.disposables.pop();
      disposable?.dispose();
    }
    this.controller.deactivate(this.engineID);
  }

  imeFocus() {
    let inputContext: chrome.input.ime.InputContext =  {
      contextID: 1,
      autoComplete: false,
      autoCorrect: true,
      spellCheck: false,
      type: "search"
    }
    this.controller.register(inputContext);
  }

  imeBlur() {
    this.startPosition = undefined;
    this.currentTriggeredText = "";
    this.controller.unregister(1);
  }

  updateIMEConfig(config?: Record<string, any>) {
    config = config ?? this.vsConfig.getGlobalState();
    for (let name in config) {
      this.controller.updateState(name, config[name]);
    }
  }
  
  emitKeyEvent(keyEvent: chrome.input.ime.KeyboardEvent) {
    this.requestId++;
    this.controller.handleEvent(this.engineID as InputToolCode, keyEvent, this.requestId);
  }

  get allowedRegExps() {
    let currentConfig = this.imeConfigFactory.getCurrentConfig();
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

    if (this.isIMEConfigKey(lastKey)) {
      if (text.length == 1 || !this.controller._context) {
        this.imeFocus();
      }
      let rawSource = this.controller.model.rawSource;

      if (rawSource.length == 0) {
        this.startPosition = this.currentProviderPos;
      }

      if (this.currentProviderPos === this.startPosition) {
        triggeredState.textLength = 1;
      } else if (this.currentProviderPos && this.startPosition) {
        triggeredState.textLength = this.currentProviderPos.character - this.startPosition.character;
      }
      
      this.emitKeyEvent(mockDownKey(lastKey));

    } else {
      this.imeBlur();
      this.dispatchEvent(IMEBackground.completionEvent);
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

  handleShowCandidates() {
    let { candidates } = this.model;
    let { pageSize } = this.imeConfigFactory.getCurrentConfig();
    let items = [];
    if (!candidates.length) return ; // Hidden.
    for (let i = 0; i < pageSize; i++) {
      let candidate = candidates[i];

      if (!candidate) break;

      let item = new vscode.CompletionItem(candidate.target, vscode.CompletionItemKind.Enum);
      item.sortText = "" + (i+1);
      item.insertText = "" + candidate.target;
      item.label = (i + 1) + " " + candidate.target;
      item.filterText = this.currentText;
      item.command = { title: "commit", command: IMECommands.COMMIT }
      // item.commitCharacters = [(i + 1).toString()];
      items.push(item);
    }

    this.completionList = new vscode.CompletionList(items, true);
    this.dispatchEvent(IMEBackground.completionEvent);
  }

  #addCompletionListener(): Promise<vscode.CompletionList | []> {
    return new Promise((resolve, reject) => {
      this.addEventListener(
        "completion", 
        () => {
          resolve(this.model.status != Status.INIT 
            ? this.completionList ?? [] : []);
        }, 
        { once: true }
      );
    })
  }

  #registerCompletionProvider() {
    return vscode.languages.registerCompletionItemProvider(
      IMEBackground.kProviderSelector,
      {
        provideCompletionItems: (document, position, token, context) => {
          if (this.currentProviderPos && this.currentProviderPos.line == position.line && this.currentProviderPos.character == position.character) {
            this.currentProviderPos = undefined;
            return [];
          }
          this.currentProviderPos = position;
          let wordRangePosition = document.getWordRangeAtPosition(position);
          if (!wordRangePosition) { // Punctuation/Special Key.
            // let text = getLastChar(document, position);
            // this.handleSurroundingText(text);
            return [];
          };
          let text = document.getText(wordRangePosition);
          let completionListPromise = this.#addCompletionListener();
          // vscode.commands.executeCommand("editor.action.triggerSuggest")
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

  #registerPuncCompletionProvider() {
    return vscode.languages.registerCompletionItemProvider(
      IMEBackground.kProviderSelector,
      {
        provideCompletionItems: (document, position, token, context) => {
          let character = context.triggerCharacter;
          
          if (context.triggerKind == 1 && character) {
            if (character == ' ') {
              let text = getLastChar(document, position);
              this.handleSurroundingText(text);
            } else {
              
            }
            return [];
          }
          return [];
        }
      },
      ...IMEBackground.kPuncCharacters,
      ' '
    )
  }
}
