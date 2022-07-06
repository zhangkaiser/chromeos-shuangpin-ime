
import { EventType, InputToolCode, Status } from "./enums";
import { Candidate } from "./candidate";
import { configFactoryInstance } from "./configfactory";
import JSDecoder from "../decoder/decoder";
import WASMDecoder from "../decoder/cdecoder";
import Module from "../../libGooglePinyin/decoder.js";

/**
 * The model, which manages the state transfers and commits.
 */
interface IModel {
  

  /** Highlight string, Moves and Updates this.highlightIndex */
  updateHighlight(newHighlight: number): void;
  moveHighlight(step: number): void;

  /** Page, Moves the current page and Gets the current page. */
  movePage(step: number): void;

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
  updateSource(char: string, text: string): void;

  /** Processs revent. */
  revert(): void;

  /** Processes the candidate select action. */
  selectCandidate(opt_index?: number, opt_commit?: string): void;

  /** Fetches candidates from decoder. */
  fetchCandidates(): void;

  /** Set current engine id. */
  setEngineID(engineID: string): void;
  
}

export class Model extends EventTarget implements IModel {
  static DEFAULT_CANDIDATE_RANGE = 1000;

  static OPENING_EVENT = new CustomEvent(EventType.OPENING);
  static COMMIT_EVENT = new CustomEvent(EventType.COMMIT);
  static MODELUPDATE_EVENT = new CustomEvent(EventType.MODELUPDATED);
  static CLOSING_EVENT = new CustomEvent(EventType.CLOSING);

  protected _decoder?: IDecoder | undefined;

  configFactory = configFactoryInstance;
  /** Current model status. */
  status = Status.INIT;
  /** Uncoverted source. */
  source: string = "";
  /** Current candidates. */
  candidates: Candidate[] = [];
  /** Raw candidates set. */
  rawCandidates: string[] = [];
  /** Raw source string. */
  rawSource = "";
  /** The cursor position in the segments. */
  cursorPos = 0;
  /** Segments. */
  segments: string[] = [];
  /** Hightlight candidate index. */
  highlightIndex = -1;
  /** Whether the model should holds select status. */
  _holdSelectStatus = false;
  /** Partial commit position. */
  commitPos = 0;
  /** Tokens string. */
  tokens: string[] = [];
  /**
   * @deprecated
   * Require await commit status. Version 3 manifest had a deficiency. */
  requireAwaitCommitStatus = true;
  
  /** Inactive state */
  inactiveAbortState: boolean = false;

  /** engineID */
  engineID?: string;

  /** candidate id. */
  selectedCandID = -1;

  /** The current global configure. */
  get currentConfig() {
    return this.configFactory.getCurrentConfig()!;
  }

  /** The current page index. */
  get pageIndex() {
    if (this.highlightIndex < 0 || this.candidates.length == 0) return 0;
    
    let { pageSize } = this.currentConfig;
    return Math.floor(this.highlightIndex / pageSize);
  }

  setEngineID(engineID: string): void {
    if (this.engineID) {
      // It's from inactive and reactive ime.
      this.inactiveAbortState = true;
    }
    this.engineID = engineID;
    try {
      this._decoder = new Module.Decoder();
    } catch(err) {

    }
  }

  storageCurrentState() {
    chrome.storage.local.set({
      model: {
        
      }
    })
  }

  revertFromStorage() {

  }

  get decoder() {
    try {
      this._decoder = this._decoder 
        ?? (Module["Decoder"] ? new Module["Decoder"] : undefined);
    } catch(err) {
      
    }
    return this._decoder;
  }


  updateHighlight(newHighlight: number) {
    if (this.status != Status.SELECT || newHighlight >= this.candidates.length) return ;
    if (newHighlight < 0) newHighlight = 0;
    
    this.highlightIndex = newHighlight;
    this.notifyUpdates();
  }

  moveHighlight(step: number) {
    if (this.status != Status.SELECT) return;
    this.updateHighlight(this.highlightIndex + step);
  }

  movePage(step: number): void {
    if (this.status != Status.SELECT) return;
    let { pageSize } = this.currentConfig;
    this.updateHighlight((this.pageIndex + step) * pageSize);
  }

  updateSource(key: string, text: string) {
    if (this.source.length + text.length > this.currentConfig.maxInputLen) {
      this.selectCandidate(undefined, '');
    }
    this.rawSource += key;
    this.source += text;
    this.highlightIndex = -1;
    if (this.status == Status.INIT) {
      this.dispatchEvent(Model.OPENING_EVENT);
    }
    this.dispatchEvent(Model.MODELUPDATE_EVENT);
    if (this.status == Status.SELECT) {
      this._holdSelectStatus = true;
    }

    this.fetchCandidates();
  }

  /** @todo */
  moveCursorLeft() {
    if (this.status != Status.SELECT || this.cursorPos <= 0) return;
    if (this.cursorPos == this.commitPos) {
      this.commitPos--;
      this.segments[this.commitPos] = this.tokens[this.commitPos];
    } else {
      this.cursorPos--;
    }

    this.source = this.segments.slice(this.commitPos, this.cursorPos).join('');
    this.highlightIndex = -1;
    this.dispatchEvent(Model.MODELUPDATE_EVENT);
    this._holdSelectStatus = true;
    if (this.source) {
      this.fetchCandidates();
    }
  }
  /** @todo */
  moveCursorRight() {
    if (this.status != Status.SELECT || this.cursorPos >= this.segments.length) return;

    let segment = this.segments[this.cursorPos];
    let ch = segment.slice(0, 1);
    let suffix = segment.slice(1);
    if (suffix == '') {
      this.segments = this.segments.slice(0, this.cursorPos).concat(
        this.segments.slice(this.cursorPos + 1)
      )
    } else {
      this.segments[this.cursorPos] = suffix;
    }

    this.source = this.source + ch;
    this.highlightIndex = -1;
    // Event
    this.dispatchEvent(new CustomEvent(EventType.MODELUPDATED));
    this._holdSelectStatus = true;
    this.fetchCandidates();
  }

  /** @todo */
  revert() {
    console.log('revert', this.cursorPos, this.source.length);
    if (this.status == Status.FETCHING) return ;
    if (this.status == Status.SELECT) {
      this._holdSelectStatus = true;
    }

    if (this.cursorPos > 0 && this.cursorPos == this.source.length) {
      this.source = this.source.slice(0, -1);
    }
    if (this.source == '') {
      this.notifyUpdates(true);
    } else {
      this.notifyUpdates();
    }
    this.fetchCandidates();
  }

  /** @todo Need to fix the composition error. */
  selectCandidate(index?: number | undefined, commit?: string | undefined): void {
    if (Status.FETCHING == this.status) return ;
    
    this.status = Status.FETCHING;

    // Commit the raw source string.
    if (index == -1) {
      this.segments = [this.rawSource];
      this.notifyUpdates(true);
      return this.clear();
    }


    let candidateIndex = index ?? this.highlightIndex;

    let candidate = this.candidates[candidateIndex];
    this.selectedCandID  = candidate.candID;
    if (!candidate) { // commit the current segments.
      this.notifyUpdates(true);
      return this.clear();
    }

    // let source = "";
    // for (let i = 0; i < candidate.range; ++i) {
    //   source += this.segments[i + this.commitPos];
    // }

    // this.tokens[this.commitPos] = source;
    // this.segments[this.commitPos] = candidate.target;
    // this.commitPos++;

    this.segments = [this.candidates[0].target];
    // this.segments = this.segments.slice(0, this.commitPos).concat(
    //   this.segments.slice(this.commitPos - 1 + candidate.candID)
    // );
    if (this.candidates.length == 1 || commit != undefined) {
      this.notifyUpdates(true);
      return this.clear();
    }
    // if (this.commitPos == this.segments.length || commit != undefined) {
    //   this.notifyUpdates(true);
    //   return this.clear();
    // }

    this.highlightIndex = -1;
    // this._decoder!.clear();
    this.fetchCandidates();
  }

  clear() {
    if (this.status != Status.INIT) {
      this.dispatchEvent(Model.CLOSING_EVENT);
    }
    if(this._decoder) this._decoder.clear();

    this.rawSource = "";
    this.source = "";
    this.cursorPos = 0;
    this.segments = [];
    this.highlightIndex = -1;
    this.candidates = [];
    this.status = Status.INIT;
    this._holdSelectStatus = false;
    this.selectedCandID = -1;
    this.requireAwaitCommitStatus = true;
  }

  abort() {
    this.clear();
  }

  reset() {
    this.clear();
    if (this._decoder) {
      // TODO
      this._decoder.clear();
    }
  }

  notifyUpdates(commit = false) {
    if (commit) {
      this.dispatchEvent(Model.COMMIT_EVENT);
      this.clear();
    } else {
      this.dispatchEvent(Model.MODELUPDATE_EVENT);
    }
  }

  enterSelect() {
    this.enterSelectInternal();
    this.notifyUpdates();
  }

  enterSelectInternal() {
    this.status = Status.SELECT;
    this.highlightIndex = 0;
  }

  fetchCandidates() {
    if (!this.decoder || !this.source) return;
    this.status = Status.FETCHING;
    if (this.source.length == 1 && this.source === '\'') {
      this.status = Status.SELECT;
      return ;
    }

    let candidatesRawStr = this.decoder.decode(this.source, this.selectedCandID);
    let candidates = candidatesRawStr.split("|");
    this.cursorPos = this.source.length;

    candidatesRawStr = "";
    if (!this.candidates) {
      this.status = Status.FETCHED;
      if (this.currentConfig.autoHighlight || this._holdSelectStatus) {
        this.enterSelectInternal();
      }

      this.candidates = [];
      this.notifyUpdates();
      return;
    }
    // TODO model.old.ts > 461;
    
    this.candidates = [];

    for (let i = 0, l = candidates.length; i < l; i++) {
      this.candidates.push(
        new Candidate( 
          candidates[i],
          i
        )
      );
    }

    this.status = Status.FETCHED;

    if (this.candidates.length == 1) {
      // TODO Need to adapt to current decoder.  
      this.selectCandidate(0, "");

    }
    if (this.currentConfig.autoHighlight || this._holdSelectStatus) {
      this.enterSelectInternal();
    }

    this.notifyUpdates();
  }


}