/**
 * The Candidate represent a suggestion of transliteration.
 */
export class Candidate {
  constructor(
    /** The target of the candidate. */ public target: string,
    /** The number of tokens which is translaterate */ public range: number,
    /** The annotation. */ public annotation = ''
  ) {

  }
}