
import { EventType, InputToolCode, StateID, Status } from "./enums";
import { Candidate } from "./candidate";
import { configFactoryInstance } from "./configfactory";
import JSDecoder from "../decoder/decoder";
import WASMDecoder from "../decoder/cdecoder";
import { isJS, isPinyin } from "../utils/regexp";
import { getShuangpinSolution } from "./shuangpinSolutions";

import { IIMEState, State, getStates, setStates } from "./state";

/**
 * The model, which manages the state transfers and commits.
 */
interface IModel {
  

  /** Highlight string, Moves and Updates this.highlightIndex */
  updateHighlight(newIndex: number): void;
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
  isFromInactive: boolean = false;

  /** engineID */
  engineID?: string;

  /** candidate id. */
  selectedCandID = -1;
  
  stateCache: any = '';

  /** The current global configure. */
  get currentConfig() {
    return this.configFactory.getCurrentConfig()!;
  }

  /** The user local storage config. */
  get states(): IIMEState {
    return getStates(this.currentConfig);
  }

  setStates(states: Partial<IIMEState>) {
    setStates(this.currentConfig, states);
  }

  /** The current page index. */
  get pageIndex() {
    if (this.highlightIndex < 0 || this.candidates.length == 0) return 0;
    
    let { pageSize } = this.currentConfig;
    return Math.floor(this.highlightIndex / pageSize);
  }

  setEngineID(engineID: string): void {
    this.engineID = engineID;
    if (isJS(engineID)) {
      this._decoder = isPinyin(engineID) 
        ? new JSDecoder(engineID)
        : new JSDecoder(engineID, getShuangpinSolution(this.currentConfig.shuangpinSolution));
    } else {
      this._decoder = isPinyin(engineID) 
        ? new WASMDecoder(engineID)
        : new WASMDecoder(engineID, getShuangpinSolution(this.currentConfig.shuangpinSolution));
    }
  }

  get decoder() {
    return this._decoder;
  }


  updateHighlight(newIndex: number) {
    console.log('updateHighlight', newIndex);
    if (this.status != Status.SELECT || newIndex >= this.candidates.length) return ;
    if (newIndex < 0) newIndex = 0;
    
    this.highlightIndex = newIndex;
    this.notifyUpdates();
  }

  moveHighlight(step: number) {
    console.log('moveHighlight', step);
    if (this.status != Status.SELECT) return;
    this.updateHighlight(this.highlightIndex + step);
  }

  movePage(step: number): void {
    console.log('movePage', step);
    if (this.status != Status.SELECT) return;

    let { pageSize } = this.currentConfig;
    this.updateHighlight((this.pageIndex + step) * pageSize);
  }

  /** @todo */
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
    if (this.status == Status.FETCHING) return ;
    if (this.status == Status.SELECT) {
      this._holdSelectStatus = true;
    }

    let deletedChar = '';
    if (this.commitPos > 0) {
      for (let i = 0; i < this.commitPos; ++i) {
        this.segments[i] = this.tokens[i];
      }
      this.commitPos = 0;
    } else if (this.cursorPos > 0) {
      let segment = this.segments[this.cursorPos - 1];
      let revertConfig = this.currentConfig.revert(segment, this.rawSource);
      console.log(segment, revertConfig)
      deletedChar = revertConfig.deletedChar;
      segment = revertConfig.segment;
      this.rawSource = revertConfig.source;

      if (segment) {
        this.segments[this.cursorPos - 1] = segment;
      } else {
        this.segments = this.segments.slice(0, this.cursorPos - 1).concat(
          this.segments.slice(this.cursorPos)
        );
        this.cursorPos--;
      }
    }
    this.source = this.segments.slice(this.commitPos, this.cursorPos).join('');
    if (this.source == '') {
      this.notifyUpdates(true);
    } else {
      this.notifyUpdates();
      if (deletedChar == '\'') {
        this.decoder?.clear();
      }
      this.fetchCandidates();
    }
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
    if (!candidate) { // commit the current segments.
      this.notifyUpdates(true);
      return this.clear();
    }
    this.selectedCandID  = candidate.candID;

    let source = "";
    for (let i = 0; i < candidate.range; ++i) {
      source += this.segments[i + this.commitPos];
    }

    this.tokens[this.commitPos] = source;
    this.segments[this.commitPos] = candidate.target;
    this.commitPos++;
    this.segments = this.segments.slice(0, this.commitPos).concat(
      this.segments.slice(this.commitPos - 1 + candidate.range)
    );
    
    if (this.commitPos == this.segments.length || commit != undefined) {
      this.notifyUpdates(true);
      return this.clear();
    }

    this.highlightIndex = -1;
    this.source = this.segments.slice(this.commitPos, this.cursorPos).join('');
    this._decoder?.clear();
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
    this.commitPos = 0;
    this.segments = [];
    this.highlightIndex = -1;
    this.candidates = [];
    this.status = Status.INIT;
    this._holdSelectStatus = false;
    // this.stateCache = '';
    // this.isFromInactive = false;
    this.selectedCandID = -1;
  }

  abort() {
    this.clear();
  }

  reactivate(engineID: string) {
    this.engineID = engineID;
    // It's from inactive and reactivate ime.
    this.isFromInactive = true;
    chrome.storage.local.get('stateCache',(data) => {
      let stateCache = 'stateCache' in data ? data['stateCache'] : '';
      this.stateCache = stateCache;
    })
  }

  /** Resume state. */
  resume() {
    this.isFromInactive = false;
    if (this.stateCache) {
      let cacheNames = Object.keys(this.stateCache);
      for (let i in cacheNames) {
        (this as any)[i] = this.stateCache[cacheNames[i]];
      }
    }
    this.stateCache = '';
  }

  reset() {
    this.clear();
    if (this._decoder) {
      // TODO
      this._decoder.clear();
    }
  }

  notifyUpdates(commit = false) {
    chrome.storage.local.set({
      stateCache: {
        rawSource: this.rawSource,
        source: this.source,
        cursorPos: this.cursorPos,
        commitPos: this.commitPos,
        segments: this.segments,
        highlightIndex: this.highlightIndex,
        candidates: this.candidates,
        status: this.status,
        _holdSelectStatus: this._holdSelectStatus,
      }
    });
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
    // if (this.source.length == 1 && this.source === '\'') {
    //   this.status = Status.SELECT;
    //   return ;
    // }
    let imeResponse = this.decoder.decode(this.source, this.selectedCandID);
    
    if (!imeResponse) {
      this.status = Status.FETCHED;
      if (this.currentConfig.autoHighlight || this._holdSelectStatus) {
        this.enterSelectInternal();
      }

      this.candidates = [];
      this.notifyUpdates();
      return;
    }
    
    this.candidates = [];
    let { candidates, tokens } = imeResponse;

    let committedSegments = this.segments.slice(0, this.commitPos);
    let prefixSegments = committedSegments.concat(tokens);
    let suffixSegments = this.segments.slice(this.cursorPos);

    this.source = tokens.join('');
    this.segments = prefixSegments.concat(suffixSegments);
    this.cursorPos = prefixSegments.length;

    for (let i = 0, l = candidates.length; i < l; i++) {
      let candidate = candidates[i];
      this.candidates.push(
        new Candidate( 
          candidate.target.toString(),
          Number(candidate.range)
        )
      );
    }

    this.status = Status.FETCHED;

    // if (this.candidates.length == 1) {
    //   // TODO Need to adapt to current decoder.  
    //   this.selectCandidate(0, "");

    // }
    if (this.currentConfig.autoHighlight || this._holdSelectStatus) {
      this.enterSelectInternal();
    }

    this.notifyUpdates();
  }


}