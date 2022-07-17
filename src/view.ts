/**
 * The view for os chrome os extension.
 */

import { configFactoryInstance } from "./model/configfactory";
import { StateID } from "./model/enums";
import type { Model } from "./model/model";
import { CandidateWindow } from "./view/candidate";

export class View {
  configFactory = configFactoryInstance;

  /** The context. */
  _context?:any;

  /** The current input tool. */
  _inputToolCode = '';

  /** The ui window. */
  window?: CandidateWindow;

  constructor(protected model: Model) { }

  /** Get the current config from config factory. */
  get currentConfig() {
    return this.configFactory.getCurrentConfig();
  }

  /** Sets the context. */
  setContext(context: any) {
    this._context = context;
  }

  /** Updates the menu items. */
  updateInputTool() {
    this._inputToolCode = this.configFactory.getInputTool();
    this.window = new CandidateWindow(this._inputToolCode, this.currentConfig);
    this.updateMenuItems();
  }

  /**
   * Updates the menu items.
   */
  updateMenuItems(stateId?: StateID) {
    if (!this._inputToolCode) return ;
  
    let states = this.configFactory.getCurrentConfig().states;
    let menuItemParameters = { engineID: this._inputToolCode, items: [] };

    let menuItems = menuItemParameters.items as chrome.input.ime.MenuItem[];
    for (let key in states)
    {
      menuItems.push({
        id: key,
        label: states[key as StateID].desc,
        checked: states[key as StateID].value,
        enabled: true,
        visible: true
      });
    }

    if (!stateId) { // Add.
      chrome.input.ime.setMenuItems(menuItemParameters);
    } else {  // Update.
      chrome.input.ime.updateMenuItems(menuItemParameters as any);
    }
  }


  /**
   * @todo Do nothing when the model is opening.
   * To show the editor.
   */
  show() { }

  /**
   * To hide the editor.
   */
   hide() {
    this.window?.hide(this._context?.contextID);
    chrome.input.ime.hideInputView();
  }

  /**
   * @todo
   * To refresh the editor.
   */
  refresh() {
    if (!this._context) return;

    let segments = this.model.segments;
    let segmentsBeforeCursor = segments.slice(0, this.model.cursorPos);
    let segmentsAfterCursor = segments.slice(this.model.cursorPos);
    
    let prefix = segments.slice(
        this.model.commitPos, this.model.cursorPos).join('');
    let composing_text = segmentsBeforeCursor.join(' ') +
        this.model.source.slice(prefix.length);
    let pos = composing_text.length;
    if (segmentsAfterCursor.length > 0) {
      composing_text += ' ' + segmentsAfterCursor.join(' ');
    }
    composing_text = this.currentConfig.transformView(
        composing_text, this.model.rawSource);
    try {
      chrome.input.ime.setComposition({
        contextID: this._context.contextID,
        text: composing_text,
        cursor: pos
      });
    } catch(e) {
      chrome.input.ime.setComposition({
        contextID: -1,
        text: composing_text,
        cursor: pos
      });
    }
    this.showCandidates();
  }

  /**
   * To refresh candidates.
   */
  showCandidates() {

    let { pageIndex, highlightIndex } = this.model;
    let { pageSize } = this.currentConfig;

    if (this.window) {
      this.window.setPageNumber(pageIndex);
      this.window.setCandidates(this.model.candidates);      
      // TODO 
      let currentIndex = highlightIndex >= 0 ? highlightIndex % pageSize : 0;
      this.window.show(this._context.contextID, currentIndex);
    }
  }
}