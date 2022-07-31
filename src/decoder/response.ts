
import type { Candidate } from "./candidate";

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
