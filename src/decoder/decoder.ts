
import { Candidate } from "./candidate";
import { DataLoader } from "./dataloader";
import { MLDecoder } from "./mldecoder";
import { TokenDecoder } from "./tokendecoder";
import { UserDecoder } from "./userdecoder";
import { IMEResponse } from "./response";

/**
 * @deprecated JS decoder was deprecated.
 * The offline decoder can provide a list of candidates for given source
 * text.
 */
export default class Decoder extends EventTarget implements IDecoder {
  #dataLoader: DataLoader;
  #tokenDecoder: TokenDecoder; 
  /** @deprecated */
  #userDecoder?: UserDecoder | null;
  #mlDecoder: MLDecoder;

  constructor(
    private inputTool: any, 
    opt_solution?: string[] | string,
    opt_enableUserDict?: boolean) {
    super();
    this.#dataLoader = new DataLoader(inputTool);
  
    /** The token decoder. */
    this.#tokenDecoder = new TokenDecoder(this.#dataLoader, opt_solution);
  
    /** The machine learning based decoder. */
    this.#mlDecoder = new MLDecoder(this.inputTool, this.#dataLoader);

    /** The user dictionary decoder. */
    // this.#userDecoder = opt_enableUserDict
    //   ? new UserDecoder()
    //   : null;

    /** Add clear event listener. */
    this.#tokenDecoder.addEventListener('clear', this.clear.bind(this));
  }

  /**
   * Gets the transliterations (without scores) for the source word.
   */
  decode(sourceWord: string, selectedCandID: number) {

    let tokenPath;
    if (this.#dataLoader.shuangpinStatus) {
      tokenPath = this.#tokenDecoder.getShuangpinTokens(sourceWord);
    } else {
      tokenPath = this.#tokenDecoder.getBestTokens(sourceWord);
    }

    if (!tokenPath) {
      return null;
    }

    let normalizedTokens = this.#tokenDecoder.getNormalizedTokens(
      tokenPath.tokens);
    let isAllInitials = this.#tokenDecoder.isAllInitials(tokenPath.tokens);
    let translits = this.#mlDecoder.transliterate(normalizedTokens, 
      MLDecoder.DEFAULT_RESULTS_NUM, isAllInitials);

    /** Filtering the tanslits. */
    let candidates: Candidate[] = [];
    let targetWords = [];
    for (var i = 0; i < translits.length; ++i) {
      let translit = translits[i];
      if (translit.target && translit.target.length >= 1 && targetWords.indexOf(translit.target) < 0) {
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
          let candidate = new Candidate(
            sourceWord.length, 
            userCommitCandidate, 
            0,
            -1);
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
    /** The source text. */ source: string, 
    /** The target text commits */ target: string) {
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
  
}