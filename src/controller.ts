import { configFactoryInstance } from "./model/configfactory";
import { EventType, InputToolCode, Key, KeyboardLayouts, Modifier, StateID, Status } from "./model/enums";
import { Model } from "./model/model";
import { hans2Hant } from "./utils/transform";
import { View } from "./view";

import type { IGlobalState } from "./model/state";

type ActionType = [
  EventType, 
  Modifier | 0, 
  string | RegExp, 
  Status | null, 
  Function | null,
  Function, 
  Object, 
  any
];

/**
 * The controller for os chrome os extension.
 */
export class Controller extends EventTarget {

  static UPDATE_STATE_EVENT = new CustomEvent(EventType.UPDATESTATE);
  /** The model. */
  model = new Model();

  /** The view. */
  view = new View(this.model);

  /** Keyboard UI Port */
  vkPort?: chrome.runtime.Port;

  /** Virtual keyboard visibility. */
  visibility: boolean = false;

  _context?: any;
  
  /** The key action table. */
  _keyActionTable?: ActionType[];

  /** The shortcut table. */
  _shortcutTable?: ActionType[];

  /** True if the last key down is shift (with not modifiers). */
  _lastKeyDownIsShift = false;

  /** If from inactive, Need to delete the surround text. */
  _lastKeyChar: string = '';

  protected _configFactory = configFactoryInstance;
  
  get currentConfig() {
    return this._configFactory.getCurrentConfig();
  }

  constructor() {
    super();
    /** The event handler. */
    this.model.addEventListener(EventType.COMMIT, this.handleCommitEvent.bind(this));
    this.model.addEventListener(EventType.OPENING, this.handleOpeningEvent.bind(this));
    this.model.addEventListener(EventType.CLOSING, this.handleClosingEvent.bind(this));
    this.model.addEventListener(EventType.MODELUPDATED, this.handleModelUpdatedEvent.bind(this));
  }

  /**
   * Activates an input tool.
   */
  activate(inputToolCode: InputToolCode) {
    this._configFactory.setInputTool(inputToolCode);
    this.model.setEngineID(inputToolCode);
    this.view.updateInputTool();
    this._keyActionTable = this.getKeyActionTable();
    this._shortcutTable = this.getShortcutTable();
  }

  /**
   * @todo
   * Deactivates the input tool.
   */
  deactivate(engineID: string) {
    this._configFactory.clearInputTool();
    this.model.reset();
    this.view.updateInputTool(true);
    this._keyActionTable = undefined;
    this._shortcutTable = undefined;
  }

  /**
   * Register a  context.
   */
  register(context: any) {
    this._context = context;
    this.view.setContext(context);
    this.model.clear(true);
  }

  /**
   * @todo
   * Unregister the context.
   */
  unregister(contextID: number) {
    this._context = null;
    this.view.setContext(null);
    this.model.clear();
  }

  /**
   * Resets the context.
   */
  reset(engineID: string) {
    this.model.abort();
  }

  /**
   * @deprecated
   * Sets the fuzzy expansions for a given input tool.
   */
  setFuzzyExpansions(
    inputToolCode: InputToolCode,
    enableFuzzy: boolean, 
    fuzzyExpansions: Record<string, boolean>) {
    let enabledFuzzyExpansions = [];
    if (enableFuzzy) {
      for (let fuzzyPair in fuzzyExpansions) {
        if (fuzzyExpansions[fuzzyPair]) {
          enabledFuzzyExpansions.push(fuzzyPair);
        }
      }
    }
    // this.model.setFuzzyExpansions(inputToolCode, enabledFuzzyExpansions);
  }

  /**
   * @deprecated
   * Enables/Disables user dictionary for a given input tool.
   */
   setUserDictEnabled(
    inputToolCode: InputToolCode, enableUserDict: boolean) {
    // this.model.enableUserDict(inputToolCode, enableUserDict);
  }

  /**
   * Sets the pageup/pagedown characters.
   */
   setPageMoveChars(
    inputToolCode: InputToolCode, pageupChars: string, pagedownChars: string) {
    let config = this._configFactory.getConfig(inputToolCode);
    if (config) {
      if (pageupChars) {
        config.pageupCharReg = new RegExp('[' + pageupChars + ']');
      } else {
        config.pageupCharReg = /xyz/g;
      }

      if (pagedownChars) {
        config.pagedownCharReg = new RegExp('[' + pagedownChars + ']');
      } else {
        config.pagedownCharReg = /xyz/g;
      }
      this._keyActionTable = this.getKeyActionTable();
    }
  }

  /**
   * @deprecated
   * Sets the inital language, sbc and puncutation modes.
   */
  setInputToolStates(
    inputToolCode:InputToolCode, initLang: boolean, initSBC: boolean, initPunc: boolean) {
    let config = this._configFactory.getConfig(inputToolCode);
    if (config) {
      config.states[StateID.LANG].value = initLang;
      config.states[StateID.SBC].value = initSBC;
      config.states[StateID.PUNC].value = initPunc;
    }
  }

  updateGlobalState(key: keyof IGlobalState, value: any) {
    this._configFactory.globalState[key] = value;
    this.dispatchEvent(Controller.UPDATE_STATE_EVENT);
  }

  updateState(key: string, value: any) {
    this.model.setStates({ [key]: value });
    this.dispatchEvent(Controller.UPDATE_STATE_EVENT)
  }

  changePuncConfig(value: boolean) {
    this.updateState('punc', value);
  }

  /**
   * Sets the keyboard layout, select keys and page size.
   *
   * @param {string} inputToolCode The input tool code.
   * @param {string} layout The keyboard layout id.
   * @param {string} selectKeys The select keys.
   * @param {number} pageSize The page size.
   */
  setPageSettings(
    inputToolCode: string, layout: KeyboardLayouts, 
    selectKeys: string, pageSize: number) {
    let config = this._configFactory.getConfig(inputToolCode as InputToolCode);
    if (config) {
      config.layout = layout;
      config.selectKeys = selectKeys;
      config.pageSize = pageSize;
      this._keyActionTable = this.getKeyActionTable();
    }
  }


  /**
   * @todo
   * Handles key event.
   * @return {boolean} True if the event is handled successfully.
   */
  handleEvent(inputToolCode: InputToolCode, keyEvent: chrome.input.ime.KeyboardEvent, requestId: number) {
    
    if (!this._context || !this._keyActionTable) {
      return false;
    }

    // ctrl + shift and from extensionId.
    if (
      keyEvent.extensionId
      && keyEvent.ctrlKey
      && keyEvent.key === Modifier.SHIFT 
    ) {
      this.switchInputToolState(StateID.LANG, inputToolCode);
      return true;
    }

    // Register shortcut.
    if (this._shortcutTable &&
        this.#handleKeyInActionTable(keyEvent, this._shortcutTable)) {
      return true;
    }

    // Pre process keyEvent.
    if (this.preProcess(keyEvent)) {
      return true;
    }

    // English input state.
    let { states } = this.currentConfig;
    if (states[StateID.LANG] && !states[StateID.LANG].value) {
      return false;
    }

    // 
    if (this.#handleKeyInActionTable(keyEvent, this._keyActionTable)) {
      return true;
    }

    if (keyEvent.type == EventType.KEYDOWN &&
        keyEvent.key != Key.INVALID &&
        keyEvent.key != Modifier.SHIFT &&
        keyEvent.key != Modifier.CTRL &&
        keyEvent.key != Modifier.ALT &&
        this.model.status != Status.INIT) {
      this.model.selectCandidate(-1, '');
    }

    return false;
  }

  /** @todo Surrounding text handler.  */
  handleSurroundingText(engineID: string, surroundingInfo: chrome.input.ime.SurroundingTextInfo) {
    // if (process.env.MV3) { 
    //   if (!this.model.engineID) {
    //     // Current state is reactivate from inactive.
    //     this.model.reactivate(engineID)
    //     this._lastKeyChar = surroundingInfo.text.slice(-1);
    //     // this.model.setEngineID(engineID);
    //   } 
    // }
  }


  /**
   * Pre-processes the key press event.
   *
   * @param {!ChromeKeyboardEvent} e the key event.
   * @return {boolean} Whether the key event is processed. If returns false,
   * controller should continue processing the event.
   */
  preProcess(e: any) {
    if (e.type != EventType.KEYDOWN ||
        this.model.status != Status.INIT ||
        e.ctrlKey || e.altKey) {
      return false;
    }

    let trans = this.currentConfig.preTransform(e.key);
    if (trans && this._context) {

      // chrome.input.ime.commitText({
      //   contextID: this._context.contextID,
      //   text: trans
      // });
      this._configFactory.postMessage({
        data: {
          type: "commitText" as MessageType,
          value: [{
            contextID: this._context.contextID,
            text: trans
          }]
        }
      })
      return true;
    }

    return false;
  }

  /**
   * Processes the char key.
   *
   * @param {Event} e The key event.
   * @return {boolean} Whether the key event is processed.
   */
  processCharKey(e: any) {
    let text = this.currentConfig.transform(
      this.model.rawSource,
      e.key,
      this.model.segments.slice(-1)[0]
    );
    
    if (!text) {
      return this.model.status != Status.INIT;
    }

    // this.model.addRawSource;
    this.model.updateSource(e.key, text);
    return true;
  }


  /**
  * Handles keyevent in a key action table.
  *
  * @param {!ChromeKeyboardEvent} e The key event.
  * @param {!Array.<!Array>} table The key action table.
  * @return {boolean} True if the key is handled.
  * @private
  */
  #handleKeyInActionTable(e: chrome.input.ime.KeyboardEvent, table: ActionType[]) {
    let key = this.#getKey(e);
    for (let item of table) {
      // Each item of the key action table is an array with this format:
      if (e.type != item[0]) continue;
      if (this._lastKeyDownIsShift && e.key != Modifier.SHIFT) {
        this._lastKeyDownIsShift = false;
      }

      let modifier = item[1];

      if (modifier == 0 && (e.ctrlKey || e.altKey || e.shiftKey)) {
        continue;
      }

      // TODO Shift shortcut bug.
      if (
        modifier == Modifier.SHIFT && !e.shiftKey 
        || modifier == Modifier.CTRL && !e.ctrlKey 
        || modifier == Modifier.ALT && !e.altKey
      ) {
        continue;
      }

      if (item[2] 
        && key != item[2]
        && (key.length != 1 || !key.match(item[2]))) {
        continue;
      }

      if (item[3] 
        && this.model.status != item[3]) {
        continue;
      }
      // TODO
      if ((!item[4] || item[4]()) &&
        item[5].apply(
          item[6], 
          item[7] 
            ? item.slice(7) 
            : [e]
        ) != false
      ) {
        return true;
      }
    }
    return false;
  }


  /**
   * @todo
  * Processes the number key.
  *
  * @param {Object} e The key event.
  * @return {boolean} Whether the key event is processed.
  */
  processNumberKey(e: any) {
    let selectKeys = this.currentConfig.selectKeyReg;
    let isPageNumber = selectKeys.test(e.key);
    if (!isPageNumber) {
      return true;
    }

    // Select candidate.
    let { pageSize } = this.currentConfig;
    let pageOffset = e.key - 1;
    if (pageOffset >= 0 && pageOffset < pageSize) {
      let index = this.model.pageIndex * pageSize + pageOffset;
      this.model.selectCandidate(index);
    }
    return true;
  }


  /**
  * Processes the punch key.
  *
  * @param {Event} e The key event.
  * @return {boolean} Whether the key event is processed.
  */
  processPuncKey(e: any) {
    let punc = this.currentConfig.postTransform(e.key);
    this.model.selectCandidate(undefined, punc);
    return true;
  }


  /**
  * Processes the revert key.
  *
  * @param {!goog.events.BrowserEvent} e The key event.
  * @return {boolean} Whether the key event is processed.
  */
  processRevertKey() {
    this.model.revert();
    return true;
  }


  /**
  * Processes the commit key.
  *
  * @param {Event} e The key event.
  * @return {boolean} Whether the key event is processed.
  */
  processCommitKey(e: any) {
    if (e.key == Key.ENTER &&
        this.model.status == Status.SELECT) {
      this.model.selectCandidate(-1, '');
    } else {
      this.model.selectCandidate(undefined);
    }
    return true;
  }


  /**
  * Process the key to enter model select status.
  *
  * @param {Event} e The key event.
  * @return {boolean} Whether the key event is processed.
  */
  processSelectKey() {
    if (this.model.status == Status.FETCHED) {
      this.model.enterSelect();
    }
    return true;
  }

  /**
  * Processes the abort key.
  *
  * @param {Event} e The key event.
  * @return {boolean} Whether the key event is processed.
  */
  processAbortKey() {
    this.model.abort();
    return true;
  }

  /**
  * Handles the model opening event.
  *
  * @protected
  */
  handleOpeningEvent() {
    this.view.show();
  }

  /**
  * Handles the model closing event.
  *
  * @protected
  */
  handleClosingEvent() {
    this.view.hide();
  }

  /**
  * Handles the model updated event.
  *
  * @protected
  */
  handleModelUpdatedEvent() {
    this.view.refresh(this.visibility ? this.vkPort : undefined);
  }


  /**
  * Handles the commit event.
  *
  * @param {!Event} e The commit event.
  * @protected
  */
  handleCommitEvent() {
    if (this._context) {
      let text = this.model.segments.join('');
      text = this.currentConfig.tranformCommit(text);

      // chrome.input.ime.commitText({
      //   'contextID': this._context.contextID,
      //   text
      // });
      this._configFactory.postMessage({
        data: {
          type: "commitText" as MessageType,
          value: [{
            'contextID': this._context.contextID,
            text
          }]
        }
      })
    }
  }


  /**
  * Gets the key action table
  *
  * @return {!Array.<!Array>} The key action table.
  * @protected
  */
  getKeyActionTable(): ActionType[]
  {
    let config = this.currentConfig;

    // Initialized.
    let onStageCondition = () => {
      return this.model.status != Status.INIT;
    }

    // Not selectable.
    let onStageNotSelectableCondition = () => {
      return (this.model.status != Status.INIT) &&
          (this.model.status != Status.SELECT);
    }

    let hasCandidatesCondition = () => {
      return this.model.status == Status.FETCHED ||
          this.model.status == Status.SELECT;
    }

    // [EventType, Modifier, KeyCode/KeyChar, ModelStatus, MoreConditionFunc,
    //  ActionFunc, ActionFuncScopeObj, args]
    return [
      // Pageup action.
      [EventType.KEYDOWN, 0, Key.PAGE_UP, null, onStageCondition, 
        this.model.movePage, this.model, 1],
      // Pageup regexp action.
      [EventType.KEYDOWN, 0, config.pageupCharReg, Status.SELECT, null, 
        this.model.movePage, this.model, 1],

      // Pagedown action.
      [EventType.KEYDOWN, 0, Key.PAGE_DOWN, null, onStageCondition, 
        this.model.movePage, this.model, -1],
      // Pagedown regexp action.
      [EventType.KEYDOWN, 0, config.pagedownCharReg, Status.SELECT, null, 
        this.model.movePage, this.model, -1],
      
      // Select keys regexp action.
      [EventType.KEYDOWN, 0, config.selectKeyReg, Status.SELECT, null,
        this.processNumberKey, this, null],

      // Default select action for Space key .
      [EventType.KEYDOWN, 0, Key.SPACE, null, onStageNotSelectableCondition,
        this.processSelectKey, this, null],
      // Commit action for Space key.
      [EventType.KEYDOWN, 0, Key.SPACE, null, onStageCondition,
        this.processCommitKey, this, null],
      // Commit action for Down key.
      [EventType.KEYDOWN, 0, Key.DOWN, null, onStageNotSelectableCondition,
        this.processSelectKey, this, null],
      // Commit action for Enter key.
      [EventType.KEYDOWN, 0, Key.ENTER, null, onStageCondition,
        this.processCommitKey, this, null],
      // Revert action. 
      [EventType.KEYDOWN, 0, Key.BACKSPACE, null, hasCandidatesCondition,
      this.processRevertKey, this, null],
      // Move highlight.
      [EventType.KEYDOWN, 0, Key.UP, null, onStageCondition,
      this.model.moveHighlight, this.model, -1],
      [EventType.KEYDOWN, 0, Key.DOWN, null, onStageCondition,
      this.model.moveHighlight, this.model, 1],
      // Move cursor.
      [EventType.KEYDOWN, 0, Key.LEFT, null, onStageCondition,
      this.model.moveCursorLeft, this.model, null],
      [EventType.KEYDOWN, 0, Key.RIGHT, null, onStageCondition,
      this.model.moveCursorRight, this.model, null],
      // Abort.
      [EventType.KEYDOWN, 0, Key.ESC, null, onStageCondition,
      this.processAbortKey, this, null],
      // Char.
      [EventType.KEYDOWN, 0, config.editorCharReg, null, null,
      this.processCharKey, this, null],
      // Shift + char?
      [EventType.KEYDOWN, Modifier.SHIFT, config.editorCharReg, null, null,
        this.processCharKey, this, null],
      
      // Punch key.
      [EventType.KEYDOWN, 0, config.punctuationReg, null, onStageCondition,
      this.processPuncKey, this, null]
    ];
  }


  /**
   * @todo
  * Gets the shortcut table
  *
  * @return {!Array.<!Array>} The shortcut table.
  * @protected
  */
  getShortcutTable() {
    let shortcutTable: ActionType[] = [];
    let config = this.currentConfig;
    
    for (let name in config.states) {
      let state = config.states[name as StateID];
      // TODO `shift` shortcut key cannot run.
      if (state.shortcut.length == 1 
        && state.shortcut[0] == Modifier.SHIFT) {
        // Switch language.
        // To handle SHIFT shortcut.
        shortcutTable.unshift(
            [EventType.KEYDOWN, Modifier.SHIFT, Modifier.SHIFT, null, null,
              this._updateLastKeyIsShift, this, null]);
        shortcutTable.push(
            [EventType.KEYUP, 0, Modifier.SHIFT, null, () =>  this._lastKeyDownIsShift, 
              this.switchInputToolState, this, name]);
      } else {
        // Switch state.
        shortcutTable.push(
            [EventType.KEYDOWN, state.shortcut[1], state.shortcut[0], null, null, 
              this.switchInputToolState, this, name]);
      }
    }
    
    return shortcutTable;
  }

  /**
   * Switch the input tool state.
   */
  switchInputToolState(stateId: StateID, engineID: string) {

    let states = this.model.states as any;
    if (typeof states[stateId] == 'boolean') {
      this.updateState(stateId, !states[stateId]);
    }

    this.model.clear();
    this.view.updateMenuItems(stateId as StateID);
    this.view.hide();
    return true;
  }

  /**
  * Updates whether the last keydown is SHIFT.
  *
  * @param {!ChromeKeyboardEvent} e the key event.
  * @return {boolean} It should always return false.
  * @private
  */
  _updateLastKeyIsShift(e: any) {
    if (this.#getKey(e) == Modifier.SHIFT &&
        !e.altKey && !e.ctrlKey) {
      this._lastKeyDownIsShift = true;
    } else {
      this._lastKeyDownIsShift = false;
    }
    return false;
  }


/**
* Gets the key from an key event.
*
* @param {!ChromeKeyboardEvent} e the key event.
* @return {string} The key string.
* @private
*/
  #getKey(e: chrome.input.ime.KeyboardEvent) {
    let key = e.key;
    if (key == Key.INVALID) {
      for (let modifier in Modifier) {
        if (e['code'].indexOf(modifier) == 0) {
          key = modifier;
        }
      }
    }
    return key;
  }

  [Symbol.toStringTag]() {
    return "Controller";
  }
}