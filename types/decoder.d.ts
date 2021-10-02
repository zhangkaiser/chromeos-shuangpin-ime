
/** The cnadidate generated in offline decoders. */
interface Candidate {
  /**
   * The number of source tokens transliterated.
   */
  range:number;

  /**
   * The target word.
   */
  target: string;
 
   /**
    * The score.
    */
   score: number;
}

/**
 * DataLoader provides the functions to load token dictionary, generation 
 * model and dictionary for the offline transliterator.
 */
interface Dataloader {
  /** The current input tool. */
  inputTool: 'shuangpin' | 'pinyin' | 'wubi';
  
  /** The  */
}