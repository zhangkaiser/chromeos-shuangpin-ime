import { Candidate } from "./candidate";
import { Decoder } from "../decoder/decoder";
import { configFactoryInstance } from "./configfactory";
import { EventType, InputToolCode, Status } from "./enums";

/**
 * The model, which mananges the state transfers and commits.
 */
export class Model extends EventTarget {
  /** The current candidates. */
  candidates:Candidate[] = [];

  /** The segments */
  segments: string[] = [];

  /** The tokens. */
  tokens: string[] = [];

  /** The config factory */
  configFactory = configFactoryInstance;

  /** Native client module. */
  protected _decoder?: Decoder;

  /** The status of the model. */
  status:Status = Status.INIT;

  /** The uncoverted source. */
  source = '';

  /** The cursor position in the segments. */
  cursorPos = 0;

  /** The context, a.k.a. history text. */
  // context = '';

  /** The current index of highlighted candidate. */
  highlightIndex = -1;

  /** The partial commit position. */
  commitPos = 0;

  /** Whether the model should holds select status. */
  protected _holdSelectStatus = false;

  /** The raw string. */
  rawStr = '';

  /**
   * Updates this.highlightIndex.
   */
  updateHighlight(newHighlight: number) {
    if (this.status != Status.SELECT) {
      return ;
    }
    if (newHighlight < 0) {
      newHighlight = 0;
    }
    if (newHighlight >= this.candidates.length) {
      return ;
    }
  
    this.highlightIndex = newHighlight;
    this.notifyUpdates();
  }

  /**
   * Moves the highlight index by the given step.
   */
  moveHighlight(step: number) {
    if (this.status != Status.SELECT) {
      return ;
    }
    this.updateHighlight(this.highlightIndex + step);
  }

  /**
   * Moves the current page index by the given step.
   */
  movePage(step: number) {
    if (this.status != Status.SELECT) {
      return;
    }

    let pageSize = this.configFactory.getCurrentConfig().pageSize;
    this.updateHighlight((this.getPageIndex() + step) * pageSize);
  } 

  /**
   * Gets the current page index.
   * @return {number} The page index.
   */
  getPageIndex() {
    if (this.highlightIndex < 0 || this.candidates.length == 0) {
      return 0;
    }

    let pageSize = this.configFactory.getCurrentConfig().pageSize;

    return Math.floor(this.highlightIndex / pageSize);
  }

  /**
   * Moves the cursor to the left.
   */
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
    // Event
    this.dispatchEvent(new CustomEvent(EventType.MODELUPDATED))
    this._holdSelectStatus = true;
    if (this.source) {
      this.fetchCandidates();
    }
  }

  /**
   * Moves the cursor to the right.
   */
  moveCursorRight() {
    if (this.status != Status.SELECT || this.cursorPos >= this.segments.length) {
      return;
    }

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

  /**
   * Notifies others about Model updated event.
   * 
   * @param {boolean=} opt_commit True if the source should be committed.
   */
   notifyUpdates(commit?: boolean) {
    if (commit) {
      // Event
      this.dispatchEvent(new CustomEvent(EventType.COMMIT));
      this.clear();
    } else {
      // Event
      this.dispatchEvent(new CustomEvent(EventType.MODELUPDATED));
    }
  }

  /**
   * Clears the model to its initial state.
   */
   clear() {
    if (this.status != Status.INIT) {
      // Event
      this.dispatchEvent(new CustomEvent(EventType.CLOSING))
    }
    if (this._decoder) {
      this._decoder.clear();
    }

    this.rawStr = '';
    this.source = '';
    this.cursorPos = 0;
    this.commitPos = 0;
    this.segments = [];
    // this.context = '';
    this.highlightIndex = -1;
    this.candidates = [];
    this.status = Status.INIT;
    this._holdSelectStatus = false;
  }

  /**
   * Aborts the model, the behavior may be overridden by sub-classes.
   */
  abort() {
    // console.log('abort the model.')
    this.clear();
  }

  /**
   * Aborts the model, the behavior may be overridden by sub-classes.
   */
  reset() {
    this.clear();
    if (this._decoder) {
      // console.log('reset the model.')
      this._decoder.persist();
      this._decoder = undefined;
    }
  }

  /** 
   * Enter the select status, and notify updates.
   */
  enterSelect() {
    this.enterSelectInternal();
    this.notifyUpdates();
  }

  /**
   * Enter the select status.
   */  
  enterSelectInternal() {
    this.status = Status.SELECT;
    this.highlightIndex = 0;
  }

  /**
   * Sets the input tool.
   */
  setInputTool(inputToolCode: InputToolCode) {
    this.clear();
    let config = this.configFactory.getCurrentConfig();
    this._decoder = new Decoder(
      inputToolCode,
      config.fuzzyExpansions,
      config.enableUserDict);
  }

  /** Sets the fuzzy expansions for a given input tool. */
  setFuzzyExpansions(inputToolCode: InputToolCode, enabledExpansions: string[]) {
    let config = this.configFactory.getConfig(inputToolCode);
    config!.fuzzyExpansions = enabledExpansions;
    
    if (config == this.configFactory.getCurrentConfig()) {
      this._decoder!.updateFuzzyPairs(config.fuzzyExpansions);
    }
  }

  /**
   * Enables/Disables user dictionary for a given input tool.
   */
   enableUserDict(inputToolCode: InputToolCode, enable: boolean) {
    let config = this.configFactory.getConfig(inputToolCode);
    config!.enableUserDict = true;

    if (config == this.configFactory.getCurrentConfig()) {
      this._decoder!.enableUserDict(enable);
    }
  }

  /**
   * Updates the source text at the current cursor by the given transform result.
   *
   * @param {string} text The text to append.
   */
  updateSource(text: string) {
    // Check the max input length. If it's going to exceed the limit, do nothing.
    if (this.source.length + text.length > 
        this.configFactory.getCurrentConfig().maxInputLen) {
      this.selectCandidate(undefined, '');
    }

    this.source += text;
    this.highlightIndex = -1;
    if (this.status == Status.INIT) {
      // Event
      this.dispatchEvent(new CustomEvent(EventType.OPENING));
    }
    // Event
    this.dispatchEvent(new CustomEvent(EventType.MODELUPDATED));
    if (this.status == Status.SELECT) {
      this._holdSelectStatus = true;
    }
    this.fetchCandidates();
  }


  /**
   * Processes revert, which is most likely caused by BACKSPACE.
   */
  revert() {
    if (this.status != Status.FETCHING) {
      if (this.status == Status.SELECT) {
        this._holdSelectStatus = true
      }

      let deletedChar = '';
      if (this.commitPos > 0) {
        for (var i = 0; i < this.commitPos; ++i) {
          this.segments[i] = this.tokens[i];
        }
        this.commitPos = 0;
      } else if (this.cursorPos > 0) {
        let segment = this.segments[this.cursorPos - 1];
        
        let solution = this.configFactory.getCurrentConfig().solution;
        if (solution) {
          let rawWords = this.configFactory.getCurrentConfig().getTransform(this.rawStr.slice(-1));
          if (Array.isArray(rawWords)) {
            for (let i = 0; i < rawWords.length; i++) {
              let raw = rawWords[i];
              let searchIndex = segment.search(raw)
              if (segment.slice(searchIndex) === raw) {
                deletedChar = raw;
                segment = segment.slice(0, searchIndex);
                this.rawStr = this.rawStr.slice(0, -1);
                break;
              }

              if (segment.slice(searchIndex) === raw + '\'') {
                deletedChar = raw + '\'';
                segment = segment.slice(0, searchIndex);
                this.rawStr = this.rawStr.slice(0, -1);
                break;
              }

              if (segment === raw + '\'') {
                deletedChar = segment
                segment = ''
                this.rawStr = this.rawStr.slice(0, -1);
                break;
              }

            }
          }

          if (!deletedChar && segment.slice(-1) === '\'') {
            deletedChar = '\'';
            segment = segment.slice(0, -1);
            this.rawStr = this.rawStr.slice(0, -1);
          }
        } else {
          deletedChar = segment.slice(-1);
          segment = segment.slice(0, -1);  
        }

        if (segment) {
          this.segments[this.cursorPos -1] = segment;
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
          this._decoder!.clear();
        }
        this.fetchCandidates();
      }
    }
  }


  /**
   * Processes the candidate select action.
   * 
   * @param {number=} opt_index The candidate index of the user choice, if node
   *  specified, use the current select index. This index can be negative,
   *  which means to select the composing text instead of a candidate.
   * @param {string=} opt_commit The committed text if it causes a full commit.
   *  Or empty string if this is not a full commit.
   */
   selectCandidate(opt_index?: number, opt_commit?: string) {
    if (this.status == Status.FETCHING) {
      return;
    }
    this.status = Status.FETCHING;
    if (opt_index == -1) {
      // commits the current source text.
      this.segments = [this.rawStr];
      this.notifyUpdates(true);
      this.clear();
      return;
    } 

    let index = opt_index || this.highlightIndex;
    let candidate = this.candidates[index];

    if (!candidate) {
      this.notifyUpdates(true);
      this.clear();
      return;
    }

    let source = '';
    for (let i = 0; i < candidate.range; ++i) {
      source += this.segments[i + this.commitPos]
    }

    this.tokens[this.commitPos] = source;
    this.segments[this.commitPos] = candidate.target;
    this.commitPos++;
    this.segments = this.segments.slice(0, this.commitPos).concat(
      this.segments.slice(this.commitPos - 1 + candidate.range)
    );
    if (this.commitPos == this.segments.length || opt_commit != undefined) {
      this._decoder!.addUserCommits(this.tokens.join(''), this.segments.join(''));
      this.notifyUpdates(true);
      this.clear();
      return;
    }

    this.highlightIndex = -1;
    this.source = this.segments.slice(this.commitPos, this.cursorPos).join('');
    this._decoder!.clear();
    this.fetchCandidates();
  }

  /**
   * Fetches candidates and composing text from decoder.
   */
  fetchCandidates() {
    
    if (!this._decoder) {
      return ;
    }
    this.status = Status.FETCHING;
    if (this.source === '\'') {
      return ;
    }
    let ret = this._decoder.decode(
      this.source, this.configFactory.getCurrentConfig().requestNum);
    if (!ret) {
      this.status = Status.FETCHED;
      if (this.configFactory.getCurrentConfig().autoHighlight ||
         this._holdSelectStatus) {
        this.enterSelectInternal(); 
      }

      this.candidates = [];
      this.notifyUpdates();
      return ;
    }

    let candidates = ret.candidates;
    let tokens = ret.tokens;
    let committedSegments = this.segments.slice(0, this.commitPos);
    let prefixSegments = committedSegments.concat(tokens)
    let suffixSegments = this.segments.slice(this.cursorPos);

    this.source = tokens.join('');

    this.segments = prefixSegments.concat(suffixSegments);
    this.cursorPos = prefixSegments.length;

    this.candidates = [];
    if (ret.tokens.length == 2) {
      let one = candidates[0];
      let two = candidates[1];
      if (one && !Number.isInteger(one.score) && two.range == 2) {
        candidates[0] = two;
        candidates[1] = one;
      }
    }

    for (let i = 0; i < candidates.length; i++) {
      if (!candidates[i]) {
        continue;
      }
      this.candidates.push(
        new Candidate(
          candidates[i].target.toString(), 
          Number(candidates[i].range)));
    }

    this.status = Status.FETCHED;
    if (this.configFactory.getCurrentConfig().autoHighlight || this._holdSelectStatus) {
      this.enterSelectInternal();
    }
    this.notifyUpdates();
  }
}