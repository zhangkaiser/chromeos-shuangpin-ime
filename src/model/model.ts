
import { EventType, InputToolCode, Status } from "./enums";

/**
 * The model, which manages the state transfers and commits.
 */

interface IModel {
  

  /** Highlight string, Moves and Updates this.highlightIndex */
  highlighIndex: number;
  updateHighlight(newHighlight: number): void;
  moveHightlight(step: number): void;

  /** Page, Moves the current page and Gets the current page. */
  movePage(step: number): void;
  getPageIndex(): number;

  /** Cursor, Moves the cursor to the left or the right. */
  moveCursorLeft(): void;
  moveCursorRight(): void;

  /** Trigger COMMIT/MODULEUPDATED custom updated event. */
  notifyUpdates(commit?: boolean): void;

  /** Clears the model state. */
  clear(): void;
  /** Aborts the model. */
  abort(): void;

  /** Resets the model. */
  reset(): void;

  /** Enter the select status, and notify updates. */
  enterSelect(): void;

  /** Enter the select status. */
  enterSelectInternal(): void;

  /** @deprecated */
  setFuzzyExpansions?(): void;
  /** @deprecated */
  enableUserDict?(): void;

  /** 
   * Updates the source text at the current cursor by the given
   * transform result. 
   */
  updateSource(text: string): void;

  /** Processs revent. */
  revert(): void;

  /** Processes the candidate select action. */
  selectCandidate(opt_index?: number, opt_commit?: string): void;

  /** Fetches candidates from decoder. */
  fetchCandidates(): void;

  
}
export class Model extends EventTarget implements IModel {
  protected _decoder?: Decoder | undefined;
  /** Current model status. */

  status = Status.INIT;
  /** Uncoverted source. */
  source: string = "";
  /** Current candidates. */
  candidates: string[] = [];

  fetchCandidates() {
    if (!this._decoder) return;
    this.status = Status.FETCHING;
    if (this.source.length == 1 && this.source === '\'') {
      this.status = Status.SELECT;
      return ;
    }

    // TODO
    let candidatesStr = this._decoder.decode(this.source);
    this.candidates = candidatesStr.split("|");
    
    // TODO model.old.ts > 461;
    
    


  }
}