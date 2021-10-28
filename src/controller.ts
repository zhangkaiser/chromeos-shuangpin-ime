import { configFactoryInstance } from "./model/configfactory";
import { EventType, InputToolCode, Key, KeyboardLayouts, Modifier, StateID, Status } from "./model/enums";
import { Model } from "./model/model";
import { hans2Hant } from "./utils/transform";
import { View } from "./view";


/**
 * The controller for os chrome os extension.
 */
export class Controller extends EventTarget {
  /** The model. */
  model = new Model();

  /** The view. */
  view = new View(this.model);

  _context?: any;
  
  /** The key action table. */
  _keyActionTable?: any[][];

  /** The shortcut table. */
  _shortcutTable?: any[][];

  /** True if the last key down is shift (with not modifiers). */
  _lastKeyDownIsShift = false;

  /** The user local storage config. */
  localConfig: UserStorageConfig = {
    'chos_init_punc_selection': true,
    'chos_next_page_selection': true,
    'chos_prev_page_selection': true,
    'chos_init_sbc_selection': false,
    'chos_init_vertical_selection': false,
    'chos_init_enable_traditional': false,
    'solution': "pinyinjiajia"
  }

  /** The raw charactor. */
  rawChar = '';

  configFactory = configFactoryInstance;

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
    this.configFactory.setInputTool(inputToolCode);
    this.model.setInputTool(inputToolCode);
    this.view.updateInputTool();
    this._keyActionTable = this.getKeyActionTable();
    this._shortcutTable = this.getShortcutTable();
  }

  /**
   * Deactivates the input tool.
   */
  deactivate() {
    this.configFactory.setInputTool('');
    this.model.reset();
    this.view.updateInputTool();
    this._keyActionTable = undefined;
    this._shortcutTable = undefined;
    this.rawChar = '';
  }

  /**
   * Register a  context.
   */
  register(context: any) {
    this._context = context;
    this.view.setContext(context);
    this.model.clear();
  }

  /**
   * Unregister the context.
   */
  unregister() {

    this.rawChar = '';
    this._context = null;
    this.view.setContext(null);
    this.model.clear();
  }

  /**
   * Resets the context.
   */
  reset() {
    this.rawChar = '';
    this.model.abort();
  }

  /**
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
    this.model.setFuzzyExpansions(inputToolCode, enabledFuzzyExpansions);
  }

  /**
   * Enables/Disables user dictionary for a given input tool.
   */
   setUserDictEnabled(
    inputToolCode:InputToolCode, enableUserDict: boolean) {
    this.model.enableUserDict(inputToolCode, enableUserDict);
  }

  /**
   * Sets the pageup/pagedown characters.
   */
   setPageMoveChars(
    inputToolCode:InputToolCode, pageupChars: string, pagedownChars: string) {
    let config = this.configFactory.getConfig(inputToolCode);
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
   * Sets the inital language, sbc and puncutation modes.
   */
  setInputToolStates(
    inputToolCode:InputToolCode, initLang: boolean, initSBC: boolean, initPunc: boolean) {
    let config = this.configFactory.getConfig(inputToolCode);
    if (config) {
      config.states[StateID.LANG].value = initLang;
      config.states[StateID.SBC].value = initSBC;
      config.states[StateID.PUNC].value = initPunc;
    }
  }

  changePuncConfig(value: boolean) {
    this.localConfig['chos_init_punc_selection'] = value;
    this.dispatchEvent(new CustomEvent(EventType.UPDATESTATE));
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
    let config = this.configFactory.getConfig(inputToolCode);
    if (config) {
      config.layout = layout;
      config.selectKeys = selectKeys;
      config.pageSize = pageSize;
      this._keyActionTable = this.getKeyActionTable();
    }
  }

  /**
   * Handles key event.
   * @return {boolean} True if the event is handled successfully.
   */
  handleEvent(e: any) {
    let inputTool = this.configFactory.getInputTool();
    if (!this._context || !inputTool || !this._keyActionTable) {
      return false;
    }


    if (e.key === Modifier.SHIFT && e.altKey && e.extensionId) {
      this.switchInputToolState(StateID.LANG);
      return true;
    }

    if (this._shortcutTable &&
        this.#handleKeyInActionTable(e, this._shortcutTable)) {
      return true;
    }

    if (this.preProcess(e)) {
      return true;
    }

    let config = this.configFactory.getCurrentConfig();
    let langStateID = StateID.LANG;
    if (config.states[langStateID] && !config.states[langStateID].value) {
      return false;
    }

    if (this.#handleKeyInActionTable(e, this._keyActionTable)) {
      return true;
    }

    if (e.type == EventType.KEYDOWN &&
        e.key != Key.INVALID &&
        e.key != Modifier.SHIFT &&
        e.key != Modifier.CTRL &&
        e.key != Modifier.ALT &&
        this.model.status != Status.INIT) {
      this.model.selectCandidate(-1, '');
    }

    return false;
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

    let config = this.configFactory.getCurrentConfig();
    let trans = config.preTransform(e.key);
    if (trans) {
      if (this._context) {
        chrome.input.ime.commitText({
          'contextID': this._context.contextID,
          'text': trans});
      }
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
    let text = this.configFactory.getCurrentConfig().transform(
      this.model.source, e.key, this.model.segments.slice(-1)[0]);
    if (!text) {
      return this.model.status != Status.INIT;
    }
    this.model.rawStr += e.key;
    this.model.updateSource(text);
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
  #handleKeyInActionTable(e: any, table: any[][]) {
    let key = this.#getKey(e);

    for (let i = 0, item; item = table[i]; i++) {
      // Each item of the key action table is an array with this format:
      // [EventType, Modifier, KeyCode/KeyChar, ModelStatus, MoreConditionFunc,
      //    ActionFunc, ActionFuncScopeObj, args].
      if (e.type != item[0]) {
        continue;
      }
      let modifier = item[1];
      if (modifier == Modifier.SHIFT && !e.shiftKey ||
          modifier == Modifier.CTRL && !e.ctrlKey ||
          modifier == Modifier.ALT && !e.altKey) {
        continue;
      }
      if (modifier == 0) {
        if (e.ctrlKey || e.altKey || e.shiftKey) {
          continue;
        }
      }
      if (item[2] && key != item[2] &&
          (key.length != 1 || !key.match(item[2]))) {
        continue;
      }
      if (item[3] && this.model.status != item[3]) {
        continue;
      }
      if (!item[4] || item[4]()) {
        if (item[5].apply(
            item[6], item[7] != undefined ? item.slice(7) : [e]) != false) {
          return true;
        }
      }
    }
    return false;
  }


  /**
  * Processes the number key.
  *
  * @param {Object} e The key event.
  * @return {boolean} Whether the key event is processed.
  */
  processNumberKey(e: any) {
    let selectKeys = this.configFactory.getCurrentConfig().selectKeys;
    let pageOffset = selectKeys.indexOf(e.key);
    if (pageOffset < 0) {
      return true;
    }
    let pageSize = this.configFactory.getCurrentConfig().pageSize;
    if (pageOffset >= 0 && pageOffset < pageSize) {
      let index = this.model.getPageIndex() * pageSize + pageOffset;
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
    let config = this.configFactory.getCurrentConfig();
    let punc = config.postTransform(e.key);
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
    this.view.refresh();
  }


  /**
  * Handles the commit event.
  *
  * @param {!Event} e The commit event.
  * @protected
  */
  handleCommitEvent() {
    if (this._context) {
      let segments = this.model.segments.join('');
      if (this.configFactory.getCurrentConfig().traditional) {
        segments = hans2Hant(segments);
      }
      chrome.input.ime.commitText({
        'contextID': this._context.contextID,
        'text': segments
      });
    }
  }


  /**
  * Gets the key action table
  *
  * @return {!Array.<!Array>} The key action table.
  * @protected
  */
  getKeyActionTable() {
    let Type = EventType;
    let config = this.configFactory.getCurrentConfig();

    let onStageCondition = () => {
      return this.model.status != Status.INIT;
    }

    let onStageNotSelectableCondition = () => {
      return this.model.status != Status.INIT &&
          this.model.status != Status.SELECT;
    }

    let hasCandidatesCondition = () => {
      return this.model.status == Status.FETCHED ||
          this.model.status == Status.SELECT;
    }

    let selectReg = new RegExp('[' + config.selectKeys + ']');

    // [EventType, Modifier, KeyCode/KeyChar, ModelStatus, MoreConditionFunc,
    //  ActionFunc, ActionFuncScopeObj, args]
    return [
      [Type.KEYDOWN, 0, Key.PAGE_UP, null, onStageCondition,
      this.model.movePage, this.model, 1],
      [Type.KEYDOWN, 0, config.pageupCharReg, Status.SELECT, null,
      this.model.movePage, this.model, 1],
      [Type.KEYDOWN, 0, Key.PAGE_DOWN, null, onStageCondition,
      this.model.movePage, this.model, -1],
      [Type.KEYDOWN, 0, config.pagedownCharReg, Status.SELECT, null,
      this.model.movePage, this.model, -1],
      [Type.KEYDOWN, 0, selectReg, Status.SELECT, null,
      this.processNumberKey, this],
      [Type.KEYDOWN, 0, Key.SPACE, null, onStageNotSelectableCondition,
      this.processSelectKey, this],
      [Type.KEYDOWN, 0, Key.SPACE, null, onStageCondition,
      this.processCommitKey, this],
      [Type.KEYDOWN, 0, Key.DOWN, null, onStageNotSelectableCondition,
      this.processSelectKey, this],
      [Type.KEYDOWN, 0, Key.ENTER, null, onStageCondition,
      this.processCommitKey, this],
      [Type.KEYDOWN, 0, Key.BACKSPACE, null, hasCandidatesCondition,
      this.processRevertKey, this],
      [Type.KEYDOWN, 0, Key.UP, null, onStageCondition,
      this.model.moveHighlight, this.model, -1],
      [Type.KEYDOWN, 0, Key.DOWN, null, onStageCondition,
      this.model.moveHighlight, this.model, 1],
      [Type.KEYDOWN, 0, Key.LEFT, null, onStageCondition,
      this.model.moveCursorLeft, this.model],
      [Type.KEYDOWN, 0, Key.RIGHT, null, onStageCondition,
      this.model.moveCursorRight, this.model],
      [Type.KEYDOWN, 0, Key.ESC, null, onStageCondition,
      this.processAbortKey, this],
      [Type.KEYDOWN, 0, config.editorCharReg, null, null,
      this.processCharKey, this],
      [Type.KEYDOWN, Modifier.SHIFT, config.editorCharReg, null, null,
      this.processCharKey, this],
      [Type.KEYDOWN, 0, config.punctuationReg, null, onStageCondition,
      this.processPuncKey, this]
    ];
  }


  /**
  * Gets the shortcut table
  *
  * @return {!Array.<!Array>} The shortcut table.
  * @protected
  */
  getShortcutTable() {
    let shortcutTable = [];
    let config = this.configFactory.getCurrentConfig();
    for (let stateID in config.states) {
      let stateValue = config.states[stateID];
      if (stateValue.shortcut.length == 1 &&
          stateValue.shortcut[0] == Modifier.SHIFT) {
        // To handle SHIFT shortcut.
        shortcutTable.unshift(
            [EventType.KEYDOWN, null, null, null, null,
            this._updateLastKeyIsShift, this]);
        shortcutTable.push(
            [EventType.KEYUP, Modifier.SHIFT, Modifier.SHIFT, null,
            () =>  this._lastKeyDownIsShift, this.switchInputToolState, this, stateID]);
      } else if (stateValue.shortcut.length >= 1) {
        shortcutTable.push(
            [EventType.KEYDOWN, stateValue.shortcut[1], stateValue.shortcut[0],
            null, null, this.switchInputToolState, this, stateID]);
      }
    }
    return shortcutTable;
  }

  /**
   * Switch the input tool state.
   */
  switchInputToolState(stateId:StateID) {
    let config = this.configFactory.getCurrentConfig();
    config.states[stateId].value = !config.states[stateId].value;
    let stateID = StateID;
    if (stateId == stateID.LANG) {
      config.states[stateID.PUNC].value = config.states[stateID.LANG].value;
    }
    if (stateId === StateID.PUNC) {
      this.changePuncConfig(config.states[stateID.PUNC].value);
    }
    this.model.clear();
    this.view.updateItems();
    this.view.hide();
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
  #getKey(e: any) {
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
}