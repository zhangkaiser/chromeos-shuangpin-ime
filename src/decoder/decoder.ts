
import { Candidate } from "./candidate";
import {DataLoader} from "./dataloader";
import { MLDecoder } from "./mldecoder";
import { TokenDecoder } from "./tokendecoder";
import UserDecoder from "./userdecoder";
/**
 * The IME response offline decoders provided.
 */
export class IMEResponse {
  constructor(
    /** The source tokens with separators */public tokens: string[],
    /** The candidate list */public candidates: Candidate[]) {}
}

/**
 * The offline decoder can provide a list of candidates for given source
 * text.
 */
export class Decoder {
  #dataLoader: DataLoader;
  #tokenDecoder: TokenDecoder; 
  #userDecoder?: UserDecoder | null;
  #mlDecoder: MLDecoder;
  constructor(
    private inputTool: any, 
    public opt_fuzzyPairs?: string[],
    public opt_enableUserDict?: boolean, 
    public opt_enableShuangpinInput?: string[]) {
    /** The callback function when the decoder is ready. */
    this.#dataLoader = new DataLoader(inputTool);
    
    /** The token decoder. */
    this.#tokenDecoder = new TokenDecoder(this.inputTool, this.#dataLoader);

    /** The machine learning based decoder. */
    this.#mlDecoder = new MLDecoder(this.inputTool, this.#dataLoader);

    /** The user dictionary decoder. */
    this.#userDecoder = opt_enableUserDict
      ? new UserDecoder(this.inputTool)
      : null;

    this.#tokenDecoder.addEventListener('clear', this.clear.bind(this));
  }

  /** Gets the some sourceWord properties. */
  getTokens(sourceWord: string) {
    if (!sourceWord) {
      return null;
    }
    let tokenPath = this.#tokenDecoder.getBestTokens(sourceWord);
    if (!tokenPath) {
      return null;
    }
    let normalizedTokens = this.#tokenDecoder.getNormalizedTokens(tokenPath.tokens);
    let isAllInitials = this.#tokenDecoder.isAllInitials(tokenPath.tokens);
    let originalTokenList = this.#tokenDecoder.getOriginalTokens(tokenPath);
    return {
      normalizedTokens,
      isAllInitials,
      originalTokenList
    }
  }

  /** Get user selected candidates for source word. */
  getUserCommitted(sourceWord: string) {
    if (this.#userDecoder) {
      let userCommitCandidate = this.#userDecoder.getCandidate(sourceWord);
      return userCommitCandidate
    }
    return null;
  }

  /** Adds the candidate from user dictinoary at the second position.  */
  addUserCommittedCandidate(sourceWord: string, candidates: Candidate[]) {
    let userCommitCandidate = this.getUserCommitted(sourceWord);

    if (userCommitCandidate) {
      let index = candidates.findIndex(candidate => 
        candidate.target == userCommitCandidate)
      
      if (index > 0) {
        delete candidates[index];
      }

      if (index != 0) {
        let candidate = new Candidate(sourceWord.length, userCommitCandidate, 0);
        candidates.splice(1, 0, candidate);
      }
    }
  }

  /**
   * Gets the transliterations (without scores) for the source word.
   */
  async decode(
    tokens: {
      normalizedTokens: string[][];
      isAllInitials: boolean;
      originalTokenList: string[];
    }, 
    resultsNum: number ) {
    let {normalizedTokens, isAllInitials} = tokens;
    let translits = await this.#mlDecoder.transliterate(normalizedTokens, 
      resultsNum, isAllInitials);

    /** Filtering the tanslits. */
    let candidates:Candidate[] = [];
    let targetWords = [];
    for (var i = 0; i < translits.length; ++i) {
      let translit = translits[i];
      if (targetWords.indexOf(translit.target) < 0) {
        candidates.push(translit);
        targetWords.push(translit.target);
        if (candidates.length >= resultsNum) {
          break;
        }
      }
    }

    return candidates;
    // return new IMEResponse(originalTokenList, candidates);
  }

  /**
   * Adds user selected candidates.
   */
  addUserCommits(
    /** The source text. */source: string, 
    /** The target text commits */target: string) {
    if (this.#userDecoder) {
      this.#userDecoder.add(source, target);
    }
  }

  /**
   * Persists the user dictionary.
   */
  persist() {
    if (this.#userDecoder) {
      this.#userDecoder.persist();
    }
  };

  /**
   * Clear the decoder.
   */
  clear() {
    this.#tokenDecoder.clear();
    this.#mlDecoder.clear();
  }

  /**
   * Updates fuzzy paris.
   */
  updateFuzzyPairs(fuzzyPairs: string[]) {
    this.#tokenDecoder.updateFuzzyPairs(fuzzyPairs);
  }

  /**
   * Enables/Disables the user dictionary.
   */
  enableUserDict(enable: boolean) {
    if (enable && !this.#userDecoder) {
      this.#userDecoder = new UserDecoder(this.inputTool);
    }
    if (!enable) {
      this.#userDecoder = null;
    }
  }

  
}