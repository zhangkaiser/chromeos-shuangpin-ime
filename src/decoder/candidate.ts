/**
 * The candidate generated in offline decoders.
 */
export class Candidate {
  constructor(
    /** The number of source tokens transliterated */ public range:number, 
    /** The target word. */ public target:string,
    /** The score. */public score:number) { }
}