import { Candidate } from "src/decoder/candidate";
import { IMEResponse } from "src/decoder/response";
import { UserDecoder } from "src/decoder/userdecoder";


/**
 * To support some optional features. 
 * like: user dictionary, translate to English.
 */
export class IMEOptionalHandler extends EventTarget {
  
  #userDecoder?: UserDecoder;

  /**
   * Traditional Chinese tranform should be after selectCandidate().
   */
  handleIMEResponse(imeResponse: IMEResponse) {

    // Adds the candidate from user dictionary at the first position.
    if (this.#userDecoder) {
      
      let token = imeResponse.tokens.join('');
      if (token.endsWith("'")) {
        token = token.slice(0, -1);
      }

      let candidates = imeResponse.candidates;

      let userCommitCandidate = this.#userDecoder.getCandidate(token);
      if (userCommitCandidate) {
        let searchIndex = candidates.findIndex((candidate) => candidate.target == userCommitCandidate);
        if (searchIndex > 0) {
          candidates.splice(searchIndex, 1);
        }

        candidates.unshift(new Candidate(imeResponse.tokens.length, userCommitCandidate, 0, -1));
      }
    }
  }

  addUserCommits(source: string, target: string) {
    this.#userDecoder?.add(source, target);
  }

  enableUserDict(enable: boolean) {
    if (enable && !this.#userDecoder) {
      this.#userDecoder = new UserDecoder();
    }
    if (!enable) {
      this.#userDecoder = undefined;
    }
  }

}