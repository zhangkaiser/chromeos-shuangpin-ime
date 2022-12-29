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

  /** The ui window. */
  window?: CandidateWindow;

  constructor(public model: Model) {}

  /** Get the current config from config factory. */
  get config() {
    return this.configFactory.getCurrentConfig();
  }

  /** Sets the context. */
  setContext(context: any) {
    this._context = context;
  }

  /** Updates the menu items. */
  updateInputTool(hidden: boolean = false) {
    this.window = new CandidateWindow(this.model.engineID, this.config);
    if (!hidden) this.updateMenuItems();
  }

  /**
   * Updates the menu items.
   */
  updateMenuItems(stateId?: StateID) {
    if (!this.model.engineID) return ;
  
    let states = this.config.states;
    let menuItemParameters = { engineID: this.model.engineID, items: [] };

    let menuItems = menuItemParameters.items as chrome.input.ime.MenuItem[];
    for (let key in states) {
      menuItems.push({
        id: key,
        label: states[key as StateID].desc,
        checked: states[key as StateID].value,
        enabled: true,
        visible: true
      });
    }
    
    if (!stateId) imeAPI.setMenuItems(menuItemParameters);
    else imeAPI.updateMenuItems(menuItemParameters as any);
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
  refresh() {
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
    composing_text = this.config.transformView(
        composing_text, this.model.rawSource);
    composing_text = composing_text.slice(-1) == "'" ? composing_text.slice(0, -1) : composing_text;
    // composing_text = composing_text.replace(/'/g, "");
    pos = composing_text.length;

    if (this.model.wasEnglish) {
      this.model.candidates.unshift({ 
        target: this.model.rawSource, 
        candID: -1, 
        range: this.model.rawSource.length, 
        annotation: ""
      })
      composing_text = this.model.rawSource;
      pos = this.model.rawSource.length;
    }

    try {
      imeAPI.setComposition({
        contextID: this._context.contextID,
        text: composing_text,
        cursor: pos
      });

      composeCb();
    } catch(e) { this.hide(); }
  }

  /**
   * To refresh candidates.
   */
  showCandidates() {

    let { pageIndex, highlightIndex } = this.model;
    let { pageSize } = this.config;

    if (this.window) {
      this.window.setPageNumber(pageIndex);
      this.window.setCandidates(this.model.candidates);      
      // TODO 
      let currentIndex = highlightIndex >= 0 ? highlightIndex % pageSize : 0;
      this.window.show(this._context.contextID, currentIndex);
    }
  }
}