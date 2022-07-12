/**
 * The Candidate represent a suggestion of transliteration.
 */
export class Candidate {
  constructor(
    /** The target of the candidate. */ public target: string,
    public range: number,
    /** The number of the candidate id. */ public candID: number = -1,
    /** The annotation. */ public annotation: string = ''
  ) {

  }
} 