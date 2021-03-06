import type { Config } from "../model/config";
import type { Candidate } from "../model/candidate";

interface ICandidateWindowProperties {
  /** Text taht is shown at the bottom of the candidate window. */
  auxiliaryText?: string,
  /** True to display the auxiliary text, false to hide it. */
  auxiliaryTextVisible?: boolean,
  /** 
   * The index of the current chosen candidate out of total candidates.
   * @since Chrome 84+
   */
  currentCandidateIndex?: number,
  /** True to show the cursor, false to hide it. */
  cursorVisible?: boolean,
  /** The number of candidates to display per page. */
  pageSize?: number,
  /** The total number of candidates for the candidate window. */
  totalCandidates?: number,
  /** True if the candidate window should be rendered vertical, false to make it horizontal. */
  vertical?: boolean,
  /** True to show the candidate window, false to hide it. */
  visible?: boolean,
  /** Where the display the candidate window. */
  windowPosition?: "cursor" | "composition"
}

export class CandidateWindow {

  /** The candidate list. */
  protected candidates: Candidate[] = [];
  /** The composition text */
  protected compositionText: string = "";
  /** The composition text cursor position. */
  protected cursorPos: number = -1;
  /** The page number. */
  protected pageIndex: number = 1;

  constructor(public engineID: string, public config: Config) {}

  #setWindow(prop: ICandidateWindowProperties) {
    chrome.input.ime.setCandidateWindowProperties({
      engineID: this.engineID,
      properties: prop
    });
  }

  #setCandidates(parameters: chrome.input.ime.CandidatesParameters) {
    chrome.input.ime.setCandidates(parameters);
  }

  #setCursorPosition(parameters: chrome.input.ime.CursorPositionParameters) {
    chrome.input.ime.setCursorPosition(parameters);
  }

  #clearComposition(contextID: number) {
    chrome.input.ime.clearComposition({contextID});
  }

  /**
   * @todo Some api not need to keep refresh.
   * Show the candidate window. 
   * */
  show(contextID: number, /** TODO */currentCandID?: number) {
    if (!this.candidates.length) return this.hide(contextID);
    let windowProps: ICandidateWindowProperties = { 
      visible: true, cursorVisible: true // TODO 
    }
    let candidatesParams: chrome.input.ime.CandidatesParameters = {
      contextID, candidates: []
    }

    let { candidates } = candidatesParams;

    if (this.config.enabledVirtualKeyboard) {
      // TODO Need to verify is right?
      windowProps.windowPosition = "composition";
      windowProps.currentCandidateIndex = currentCandID;
      windowProps.totalCandidates = this.candidates.length;
      
      this.getCandidates((candidate, label) => {
        candidates.push({
          candidate: candidate.target,
          label: '' + label,
          id: candidate.candID
        });
      }, true);

    } else if (this.config.enableVertical) {
      // Show candidates vertically.
      windowProps.vertical = true;
      windowProps.pageSize = this.config.pageSize;

      this.getCandidates((candidate, label) => {
        candidates.push({
          candidate: candidate.target,
          label: '' + label,
          id: candidate.candID
        });
      });
    } else {
      // Default.
      windowProps.pageSize = this.config.pageSize;

      this.getCandidates((candidate, label) => {
        candidates.push({
          annotation: `${label} ${candidate.target}`,
          candidate: candidate.target,
          label: '' + label,
          id: candidate.candID
        })
      })
    }
    this.#setCandidates(candidatesParams);
    
    // TODO  '0' value = false.
    if (currentCandID) {
      this.#setCursorPosition({
        contextID,
        candidateID: currentCandID
      })
    }
    this.#setWindow(windowProps);
  }

  /** Hide the candidate window. */
  hide(contextID?: number) {
    this.#setWindow({visible: false});
    contextID && this.#clearComposition(contextID);
  }

  setCandidates(candidates: Candidate[]) {
    this.candidates = candidates;
  }

  getCandidates(cb: (candidate: Candidate, label: number, id: number) => void, all: boolean = false) {
    let from, to;
    let candsNum = this.candidates.length;
    if (all) {
      from = 0;
      to = candsNum;
    } else {
      let { pageSize } = this.config;
      from = this.pageIndex * pageSize;
      to = from + pageSize;
      if (to > candsNum && candsNum < from) {
        to = candsNum;
      }
    }
    let index = 1;
    
    for (let i = from; i < to; i++) {
      let candidate = this.candidates[i];
      if (!candidate) break;
      cb(candidate, index++, i);
    }    
  }

  setPageNumber(pageIndex: number) {
    this.pageIndex = pageIndex;
  }

  showComposition(text: string, pos: number) {
    this.compositionText = text;
    this.cursorPos = pos;
  }
}