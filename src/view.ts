/**
 * The view for os chrome os extension.
 */

import { configFactoryInstance } from "./model/configfactory";
// import { Status } from "./model/enums";
import type { Model } from "./model/model";

export class View {
  configFactory = configFactoryInstance;

  /** The context. */
  _context?:any;

  /** The current input tool. */
  _inputToolCode = '';

  constructor(protected model:Model) { }

  /** Sets the context. */
  setContext(context: any) {
    this._context = context;
  }

  /** Updates the menu items. */
  updateInputTool() {
    this._inputToolCode = this.configFactory.getInputTool();
    console.log('updateInputTool', this._inputToolCode);

    this.updateItems();
  }


  /**
   * Updates the menu items.
   */
  updateItems() {
    if (!this._inputToolCode) {
      return ;
    }
  
    let states = this.configFactory.getCurrentConfig().states;
    let menuItems = [];
    for (let key in states) {
      menuItems.push({
        'id': key,
        'label': states[key].desc,
        'checked': states[key].value,
        'enabled': true,
        'visible': true
      });
  
      chrome.input.ime.setMenuItems({
        'engineID': this._inputToolCode,
        'items': menuItems
      }, function() {
        console.log('setMenuItems')
      });          
    }
  }

  /**
   * To show the editor.
   */
  show() {
    if (this._inputToolCode) {
      let candidateWindowProperties = this.configFactory.getCurrentConfig().candidateProps;
      chrome.input.ime.setCandidateWindowProperties(
        {
          'engineID': this._inputToolCode,
          'properties': candidateWindowProperties
        },() => {
          console.log('setCandidateWindowProperties', candidateWindowProperties)
        });
    }
  }

  /**
   * To hide the editor.
   */
   hide() {
    if (this._inputToolCode) {
      chrome.input.ime.setCandidateWindowProperties({
        'engineID': this._inputToolCode,
        'properties': {
          'visible': false
        }
      }, () => {
        console.log('setCandidateWindowProperties', {visible: false})
      });
    }
  
    if (this._context) {
      chrome.input.ime.clearComposition({
        'contextID': this._context.contextID
      }, () => {
        console.log('hide.clearComposition', this._context.contextID)
      });
  
      chrome.input.ime.setCandidates({
        'contextID': this._context.contextID,
        'candidates': []
      }, () => {
        console.log('hide.setCandidates', [])
      });
    }
  }

  /**
   * To refresh the editor.
   * @todo
   */
  refresh() {
    if (!this._context) {
      return ;
    }
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
        composing_text);
    let props = {
      'contextID': this._context.contextID,
      'text': composing_text,
      'cursor': pos
    }
    chrome.input.ime.setComposition(props);
    this.showCandidates();
  }

  /**
   * To refresh candidates.
   */
  showCandidates() {
    let pageIndex = this.model.getPageIndex();
    let pageSize = this.configFactory.getCurrentConfig().pageSize;
    let from = pageIndex * pageSize;
    let to = from + pageSize;
    if (to > this.model.candidates.length) {
      to = this.model.candidates.length;
    }
    let displayItems = [];
    for (let i = from; i < to; i++) {
      let candidate = this.model.candidates[i];
      let label = (i + 1 - from).toString();
      displayItems.push({
        'candidate': candidate.target,
        'annotation': label + candidate.target,
        'label': label,
        'id': i - from});
    }

    let candidatesProps = {
      'contextID': this._context.contextID,
      'candidates': displayItems
    }

    chrome.input.ime.setCandidates(candidatesProps, () => {
        console.log('showCandidates.setCandidates', candidatesProps)
      });
    if (to > from) {
      let hasHighlight = (this.model.highlightIndex >= 0);

      let props = {...this.configFactory.getCurrentConfig().candidateProps, ...{
        'cursorVisible': hasHighlight,
        'pageSize': to - from
      }}
      chrome.input.ime.setCandidateWindowProperties({
        'engineID': this._inputToolCode,
        'properties': props
      }, () => {
        console.log('showCandidates.setCandidatesWindowProperties', props)
      });
      if (hasHighlight) {
        let props = {
          'contextID': this._context.contextID,
          'candidateID': this.model.highlightIndex % pageSize
        }
        chrome.input.ime.setCursorPosition(props, () => {
          console.log('showCandiddates.setCursorPostiion', props)
        });
      }
    } else {
      chrome.input.ime.setCandidateWindowProperties({
        'engineID': this._inputToolCode,
        'properties': {
          'visible': false
        }
      }, () => 
        console.log('showCandidates.setCandidatesWindowProperties', {visible: false}));
    }
  }
}