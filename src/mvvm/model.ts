import { Status } from "../model/enums";
import { Model } from "../model/model";
import type { ViewModel } from "./viewmodel";

export class InputImeModel extends Model implements IInputImeModel {
  config = this.configFactory;

  context?: chrome.input.ime.InputContext;

  /** The page size */
  pageSize: number;
  constructor(
    public engineID: string,
    private setData:(data: IViewInputMethod) => void,
    private data: ViewModel) {
    super();
    this.pageSize = this.config.getCurrentConfig().pageSize;
    this.config.setInputTool(engineID);
  }

  setMenus() {
    let states = this.config.getCurrentConfig().states;
    let menuItems = [];
    for (let key in states) {
      menuItems.push({
        'id': key,
        'label': states[key].desc,
        'checked': states[key].value,
        'enabled': true,
        'visible': true
      })
    }

    this.setData({
      menuItems: {
        engineID: this.engineID,
        items: menuItems
      }
    });
  }

  updateHighlight(newHighlight: number) {
    if (this.status != Status.SELECT || !this.context) {
      return ;
    }
    if (newHighlight < 0) {
      newHighlight = 0;
    }
    if (newHighlight >= this.candidates.length) {
      return ;
    }

    this.highlightIndex = newHighlight;
    this.setData({
      cursorPosition: {
        contextID: this.context.contextID,
        candidateID: this.highlightIndex % this.pageSize
      }
    })
  }

  moveHighlight(step: number) {
    this.updateHighlight(this.highlightIndex + step);
  }

  movePage(step: number) {
    this.updateHighlight((this.getPageIndex() + step) * this.pageSize);
  }

  moveCursorLeft() {
    if (this.status != Status.SELECT || this.cursorPos <= 0) {
      return ;
    }
    if (this.cursorPos == this.commitPos) {
      this.commitPos--;
      this.segments[this.commitPos] = this.tokens[this.commitPos];
    } else {
      this.cursorPos--;
    }

    this.source = this.segments.slice(this.commitPos, this.cursorPos).join('');
    this.highlightIndex = -1;
    this._holdSelectStatus = true;

    if (this.source) {
      this.#fetchCandidates();
    }
  }


  /**
   * Aborts the model, the behavior may be overridden by sub-classes.
   */
  abort() {
    super.abort();
    this.config.setInputTool('');
  }

  #fetchCandidates() {
    if (!this._decoder) {
      return ;
    }
    this.status = Status.FETCHING;

    let sourceTokens = this._
  }
}