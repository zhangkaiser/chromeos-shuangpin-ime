import { EventType, Key, Modifier, StateID, Status } from "../model/enums";
import { ShuangpinModel } from "./model";
import { ShuangpinView } from './view';
import { configFactoryInstance } from "../model/configfactory";


export class ViewModel extends EventTarget implements ViewModelInterface {
  // [index: string]: any;
  engineID?: string;
  _context?: chrome.input.ime.InputContext;
  configFactory = configFactoryInstance;
  _lastKeyDownIsShift = false;
  _keyActionTable?: any;
  _shortcutTable?: any
  constructor() {
    super();
  }

  data:any = new ShuangpinView();

  model?:ShuangpinModel;

  setData(newData: DataRenderInterface, isRender: boolean = true) {
    
    for (let name in newData) {
      let key = name as keyof DataRenderInterface;
      this[name] = newData[key];
      if (isRender) {
        this.data[key] = newData[key];
      }
    }
  }

  onActivate(engineID: string) {
    this.engineID = engineID;
    this.model = new ShuangpinModel(
      engineID, 
      this.setData.bind(this),
      this
      );
    this.model.setMenus();
    this._keyActionTable = this.getKeyActionTable();
    this._shortcutTable = this.getShortcutTable();
  }

  onDeactivated() {
    this.model?.reset();
    this.setData({
      hideInputView: true
    });
    this._keyActionTable = undefined;
    this._shortcutTable = undefined;
  }

  onFocus(context: chrome.input.ime.InputContext) {
    this._context = context;
    if (this.model) {
      this.model.context = context;
      this.model.clear();
    }
  }

  onAssistiveWindowButtonClicked(
    details: chrome.input.ime.AssistiveWindowButtonClickedDetails) {
      console.log(details);
  }

  onBlur() {
    this._context = undefined;
    if (this.model) {
      this.model.clear();
    }
  }

  onReset() {
    this.model?.abort();
  }

  onKeyEvent(_engineID: string, keyEvent: KeyboardEvent, _requestId: string) {
    if (!this._context) {
      return false;
    }

    // Handle shortcut/action key.
    return this.handleKeyEvent(keyEvent);
  }

  onMenuItemActivated() {

  }

  onInputContextUpdate() {

  }

  onSurroundingTextChanged() {

  }

  onCandidateClicked(
    _engineID: string,
    candidateID: number,
    _button: MouseButton | string
  ) {
    this.processNumberKey({
      'key': candidateID + 1
    });
  }

  handleKeyEvent(e: KeyboardEvent) {
    if (this._shortcutTable && this.#handleKeyInActionTable(e, this._shortcutTable)) {
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
    if (this.model) {

      if (e.type == EventType.KEYDOWN &&
        e.key != Key.INVALID &&
        e.key != Modifier.SHIFT &&
        e.key != Modifier.CTRL &&
        e.key != Modifier.ALT &&
        this.model.status != Status.INIT) {
        this.model.selectCandidate(-1, '');
      }
    }
    return false;
  }


  preProcess(e: KeyboardEvent) {
    if (e.type != EventType.KEYDOWN ||
      this.model!.status != Status.INIT ||
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

  setUserDictEnabled(enableUserDict: boolean) {
    this.model!.enableUserDict(enableUserDict);
  }

  setPageMoveChars(pageupChars: string, pagedownChars: string) {
    let config = this.configFactory.getCurrentConfig();
    if (config) {
      if (pageupChars) {
        config.pageupCharReg = new RegExp(`[${pageupChars}]`);
      }

      if (pagedownChars) {
        config.pagedownCharReg = new RegExp(`[${pagedownChars}]`);
      }
      this._keyActionTable = this.getKeyActionTable();
    }
  }

  setInputToolStates(initLang: boolean, initSBC: boolean, initPunc: boolean) {
    let config = this.configFactory.getCurrentConfig();
    let stateID = StateID;
    if (config) {
      config.states[stateID.LANG].value = initLang;
      config.states[stateID.SBC].value = initSBC;
      config.states[stateID.PUNC].value = initPunc;
    }
  }

  setPageSettings(
    solution: string, 
    selectKeys: string, pageSize: number) {
    let config = this.configFactory.getCurrentConfig();
    if (config) {
      config.solution = solution;
      config.selectKeys = selectKeys;
      config.pageSize = pageSize;
      this._keyActionTable = this.getKeyActionTable();
    }
  }

  switchInputToolState(stateId:StateID) {
    let config = this.configFactory.getCurrentConfig();
    config.states[stateId].value = !config.states[stateId].value;
    let stateID = StateID;
    if (stateId == stateID.LANG) {
      config.states[stateID.PUNC].value = config.states[stateID.LANG].value;
    }
    if (this.model) {
      this.model.setMenus();
      this.model.clear();
    }
  }


  /**
  * Gets the key action table
  *
  * @return {!Array.<!Array>} The key action table.
  * @protected
  */
   getKeyActionTable() {
    let config = this.configFactory.getCurrentConfig();

    if (!this.model) {
      return ;
    }

    let onStageCondition = () => {
      return this.model?.status != Status.INIT;
    }

    let onStageNotSelectableCondition = () => {
      return this.model?.status != Status.INIT &&
          this.model?.status != Status.SELECT;
    }

    let hasCandidatesCondition = () => {
      return this.model?.status == Status.FETCHED ||
          this.model?.status == Status.SELECT;
    }

    let selectReg = new RegExp(`[${config.selectKeys}]`);

    // [EventType, Modifier, KeyCode/KeyChar, ModelStatus, MoreConditionFunc,
    //  ActionFunc, ActionFuncScopeObj, args]
    return [
      [EventType.KEYDOWN, 0, Key.PAGE_UP, null, onStageCondition,
      this.model.movePage, this.model, 1],
      [EventType.KEYDOWN, 0, config.pageupCharReg, Status.SELECT, null,
      this.model.movePage, this.model, 1],
      [EventType.KEYDOWN, 0, Key.PAGE_DOWN, null, onStageCondition,
      this.model.movePage, this.model, -1],
      [EventType.KEYDOWN, 0, config.pagedownCharReg, Status.SELECT, null,
      this.model.movePage, this.model, -1],
      [EventType.KEYDOWN, 0, selectReg, Status.SELECT, null,
      this.processNumberKey, this],
      [EventType.KEYDOWN, 0, Key.SPACE, null, onStageNotSelectableCondition,
      this.processSelectKey, this],
      [EventType.KEYDOWN, 0, Key.SPACE, null, onStageCondition,
      this.processCommitKey, this],
      [EventType.KEYDOWN, 0, Key.DOWN, null, onStageNotSelectableCondition,
      this.processSelectKey, this],
      [EventType.KEYDOWN, 0, Key.ENTER, null, onStageCondition,
      this.processCommitKey, this],
      [EventType.KEYDOWN, 0, Key.BACKSPACE, null, hasCandidatesCondition,
      this.processRevertKey, this],
      [EventType.KEYDOWN, 0, Key.UP, null, onStageCondition,
      this.model.moveHighlight, this.model, -1],
      [EventType.KEYDOWN, 0, Key.DOWN, null, onStageCondition,
      this.model.moveHighlight, this.model, 1],
      [EventType.KEYDOWN, 0, Key.LEFT, null, onStageCondition,
      this.model.moveCursorLeft, this.model],
      [EventType.KEYDOWN, 0, Key.RIGHT, null, onStageCondition,
      this.model.moveCursorRight, this.model],
      [EventType.KEYDOWN, 0, Key.ESC, null, onStageCondition,
      this.processAbortKey, this],
      [EventType.KEYDOWN, 0, config.editorCharReg, null, null,
      this.processCharKey, this],
      [EventType.KEYDOWN, Modifier.SHIFT, config.editorCharReg, null, null,
      this.processCharKey, this],
      [EventType.KEYDOWN, 0, config.punctuationReg, null, onStageCondition,
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
            this.#updateLastKeyIsShift, this]);
        shortcutTable.push(
            [EventType.KEYUP, Modifier.SHIFT, Modifier.SHIFT, null,
            () => {
              return this._lastKeyDownIsShift;
            }, this.switchInputToolState, this, stateID]);
      } else if (stateValue.shortcut.length >= 1) {
        shortcutTable.push(
            [EventType.KEYDOWN, stateValue.shortcut[1], stateValue.shortcut[0],
            null, null, this.switchInputToolState, this, stateID]);
      }
    }
    return shortcutTable;
  }

  processCharKey(e: any) {
    let text = this.configFactory.getCurrentConfig().transform(
      this.model!.source, e.key, this.model!.rawChar);
      
    if (!text) {
      return this.model!.status != Status.INIT;
    }
    this.model!.updateSource(text);
    return true;
  }

  processNumberKey(e: any) {
    let selectKeys = this.configFactory.getCurrentConfig().selectKeys;
    let pageOffset = selectKeys.indexOf(e.key);
    if (pageOffset < 0) {
      return true;
    }
    let pageSize = this.configFactory.getCurrentConfig().pageSize;
    if (pageOffset >= 0 && pageOffset < pageSize) {
      let index = this.model!.getPageIndex() * pageSize + pageOffset;
      this.model!.selectCandidate(index);
    }
    return true;
  }

  processPuncKey(e: any) {
    let config = this.configFactory.getCurrentConfig();
    let punc = config.postTransform(e.key);
    this.model!.selectCandidate(undefined, punc);
    return true;
  }

  processRevertKey() {
    this.model!.revert();
    return true;
  }

  processCommitKey(e: any) {
    if (e.key == Key.ENTER &&
      this.model!.status == Status.SELECT) {
      this.model!.selectCandidate(-1, '');
    } else {
      this.model!.selectCandidate(undefined);
    }
    return true;
  }

  processSelectKey() {
    if (this.model!.status == Status.FETCHED) {
      this.model!.enterSelect();
    }
    return true;
  }


  #updateLastKeyIsShift(e: any) {
    if (this.#getKey(e) == Modifier.SHIFT &&
        !e.altKey && !e.ctrlKey) {
      this._lastKeyDownIsShift = true;
    } else {
      this._lastKeyDownIsShift = false;
    }
    return false;
  }

  processAbortKey() {
    this.model!.abort();
    return true;
  }

  #handleKeyInActionTable(e: KeyboardEvent, table: any[][]) {
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
      if (item[3] && this.model?.status != item[3]) {
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

  #getKey(e: KeyboardEvent) {
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