
import { InputToolCode } from "../model/enums";
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
    /** The source tokens with separators */
    public tokens: string[],
    /** The candidate list */
    public candidates: Candidate[]
  ) {}
}

/**
 * The offline decoder can provide a list of candidates for given source
 * text.
 */
export default class Decoder implements IDecoder {
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
    this.#tokenDecoder = new TokenDecoder(this.inputTool);

    /** The machine learning based decoder. */
    this.#mlDecoder = new MLDecoder(this.inputTool, this.#dataLoader);

    /** The user dictionary decoder. */
    this.#userDecoder = opt_enableUserDict
      ? new UserDecoder(this.inputTool)
      : null;

    /** Add clear event listener. */
    this.#tokenDecoder.addEventListener('clear', this.clear.bind(this));
  }

  /**
   * Gets the transliterations (without scores) for the source word.
   */
  decode(sourceWord: string, selectedCandID: number) {
    let tokenPath = this.#tokenDecoder.getBestTokens(sourceWord);
    if (!tokenPath) {
      return null;
    }

    let normalizedTokens = this.#tokenDecoder.getNormalizedTokens(
      tokenPath.tokens);
    let isAllInitials = this.#tokenDecoder.isAllInitials(tokenPath.tokens);
    let translits = this.#mlDecoder.transliterate(normalizedTokens, 
      MLDecoder.DEFAULT_RESULTS_NUM, isAllInitials);

    /** Filtering the tanslits. */
    let candidates:Candidate[] = [];
    let targetWords = [];
    for (var i = 0; i < translits.length; ++i) {
      let translit = translits[i];
      if (targetWords.indexOf(translit.target) < 0) {
        candidates.push(translit);
        targetWords.push(translit.target);
        if (candidates.length >= MLDecoder.DEFAULT_RESULTS_NUM) {
          break;
        }
      }
    }

    // Adds the candidate from user dictinoary at the second position.
    if (this.#userDecoder) {
      let userCommitCandidate = this.#userDecoder.getCandidate(sourceWord);
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

    // Also return the token list.
    let originalTokenList = this.#tokenDecoder.getOriginalTokens(tokenPath);
    return new IMEResponse(originalTokenList, candidates);

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