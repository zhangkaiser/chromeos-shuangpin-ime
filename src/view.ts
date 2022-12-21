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

  constructor(public model: Model) { }

  /** Get the current config from config factory. */
  get currentConfig() {
    return this.configFactory.getCurrentConfig();
  }

  /** Sets the context. */
  setContext(context: any) {
    this._context = context;
  }

  /** Updates the menu items. */
  updateInputTool(hidden: boolean = false) {
    this._inputToolCode = this.configFactory.getInputTool();
    this.window = new CandidateWindow(this._inputToolCode, this.currentConfig);
    if (!hidden) this.updateMenuItems();
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
      // chrome.input.ime.setMenuItems(menuItemParameters);
      this.configFactory.postMessage({
        data: {
          type: "setMenuItems" as MessageType,
          value: [menuItemParameters]
        }
      })
    } else {  // Update.
      // chrome.input.ime.updateMenuItems(menuItemParameters as any);
      this.configFactory.postMessage({
        data: {
          type: "updateMenuItems" as MessageType,
          value: [menuItemParameters]
        }
      })
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
  }


  /**
   * @todo
   * To refresh the editor.
   */
  refresh(vkPort?: chrome.runtime.Port) {
    if (!this._context) return;

    let composing_text = "";
    let pos = 0;
    let composeCb = () => this.showCandidates();

    let segments = this.model.segments;
    if (this.model.rawSource.length == 0) return this.hide();
    let segmentsBeforeCursor = segments.slice(0, this.model.cursorPos);
    let segmentsAfterCursor = segments.slice(this.model.cursorPos);
    
    let prefix = segments.slice(
        this.model.commitPos, this.model.cursorPos).join('');
    composing_text = segmentsBeforeCursor.join(' ') +
        this.model.source.slice(prefix.length);
    if (segmentsAfterCursor.length > 0) {
      composing_text += ' ' + segmentsAfterCursor.join(' ');
    }
    composing_text = this.currentConfig.transformView(
        composing_text, this.model.rawSource);
    composing_text = composing_text.slice(-1) == "'" ? composing_text.slice(0, -1) : composing_text;
    // composing_text = composing_text.replace(/'/g, "");
    pos = composing_text.length;

    if (this.model.wasEnglish) {
      this.model.candidates.unshift(
        { 
          target: this.model.rawSource, 
          candID: -1, 
          range: this.model.rawSource.length, 
          annotation: ""
        }
      )
      composing_text = this.model.rawSource;
      pos = this.model.rawSource.length;
    }

    try {
      // TODO Running in Android application have will be focus issues.
      // But use short(raw source) text is no problem.
      // if (vkPort) {
      //   vkPort.postMessage({
      //     type: 'refresh',
      //     data: {
      //       text: composing_text,
      //       cursor: pos,
      //       candidates: this.model.candidates.map((candidate) => ({
      //        target: candidate.target
      //       }))
      //     }
      //   })
      //   return;
      // }

      this.configFactory.postMessage({
        data: {
          type: "setComposition" as MessageType,
          value: [{
            contextID: this._context.contextID,
            text: composing_text,
            cursor: pos
          }]
        }
      });

      composeCb();


      // chrome.input.ime.setComposition({
      //   contextID: this._context.contextID,
      //   text: composing_text,
      //   cursor: pos
      // }, composeCb);
    } catch(e) {
      this.hide();
    }
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