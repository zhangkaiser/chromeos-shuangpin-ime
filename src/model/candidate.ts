/**
 * The Candidate represent a suggestion of transliteration.
 */
export class Candidate {
  constructor(
    /** The target of the candidate. */ public target: string,
    /** The number of the candidate id. */ public candID: number,
    /** The annotation. */ public annotation: string = ''
  ) {

  }
} 