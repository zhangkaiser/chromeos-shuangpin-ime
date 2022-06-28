/**
 * The view for os chrome os extension.
 */

import { configFactoryInstance } from "./model/configfactory";
import { StateID } from "./model/enums";
import type { Model } from "./model/model";
import { hans2Hant } from "./utils/transform";

export class View {
  configFactory = configFactoryInstance;

  /** The context. */
  _context?:any;

  /** The current input tool. */
  _inputToolCode = '';

  constructor(protected model:Model) { }

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
    this.updateItems();
  }

  /**
   * Updates the menu items.
   */
  updateItems() {
    if (!this._inputToolCode) return ;
  
    let states = this.configFactory.getCurrentConfig().states;
    let menuItems = [];
    for (let key in states)
    {
      menuItems.push({
        id: key,
        label: states[key as StateID].desc,
        checked: states[key as StateID].value,
        enabled: true,
        visible: true
      });
  
      chrome.input.ime.setMenuItems({
        engineID: this._inputToolCode,
        items: menuItems
      });
    }
  }

  setCandidateWindowProperties(properties: any) {
    if (!this._inputToolCode) return;
    chrome.input.ime.setCandidateWindowProperties({
      engineID: this._inputToolCode,
      properties
    });

  }

  /**
   * To show the editor.
   */
  show() {
    this.setCandidateWindowProperties({
      visible: true
    });
  }

  /**
   * To hide the editor.
   */
   hide() {

    this.setCandidateWindowProperties({
      visible: false
    });
  
    if (this._context) {
      chrome.input.ime.clearComposition({
        'contextID': this._context.contextID
      });
      chrome.input.ime.hideInputView();
    }
  }

  /**
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
    composing_text = this.configFactory.getCurrentConfig().transformView(
        composing_text, this.model.rawSource);
    
    chrome.input.ime.setComposition({
        contextID: this._context.contextID,
        text: composing_text,
        cursor: pos
    });
    this.showCandidates();
  }

  /**
   * To refresh candidates.
   */
  showCandidates() {

    let pageIndex = this.model.pageIndex;

    let { pageSize } = this.currentConfig;
    let from = pageIndex * pageSize;
    let to = from + pageSize;
    if (to > this.model.candidates.length) {
      to = this.model.candidates.length;
    }
    let vertical = this.configFactory.getCurrentConfig().vertical;
    let displayItems = [];
    let targetHandler = (target: string) => {
      if (this.configFactory.getCurrentConfig().traditional) {
        return hans2Hant(target);
      } else {
        return target;
      }
    }
    if (vertical) {
      for (let i = from; i < to; i++) {
        let candidate = this.model.candidates[i];
        let label = (i + 1 - from).toString();        
        displayItems.push({
          'candidate': targetHandler(candidate.target),
          'label': label,
          'id': i - from});
      }
    } else {
      for (let i = from; i < to; i++) {
        let candidate = this.model.candidates[i];
        let label = (i + 1 - from).toString();        
        displayItems.push({
          annotation: `${label} ${targetHandler(candidate.target)}`,
          'candidate': candidate.target,
          'label': label,
          'id': i - from
        });
      }
    }

    chrome.input.ime.setCandidates({
      'contextID': this._context.contextID,
      'candidates': displayItems});
    if (to > from) {
      let hasHighlight = (this.model.highlightIndex >= 0);

      let properties = {
        vertical,
        visible: true,
        'cursorVisible': hasHighlight,
        'pageSize': to - from
      }
      chrome.input.ime.setCandidateWindowProperties({
        'engineID': this._inputToolCode,
        properties});
      if (hasHighlight) {
        chrome.input.ime.setCursorPosition({
          'contextID': this._context.contextID,
          'candidateID': this.model.highlightIndex % pageSize});
      }
    } else {
      chrome.input.ime.setCandidateWindowProperties({
        'engineID': this._inputToolCode,
        'properties': {'visible': false}});
    }
  }
}