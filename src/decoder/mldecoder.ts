/**
 * @fileoverview The MLDecoder class computes transliterations for a
 * given source language word in the target language using a machine learning
 * based approach, which relies on learnt probabilities for source -> target
 * language segment mappings.
 */

import { debugLog } from "../utils/debug";
import { Candidate } from "./candidate";
import { DataLoader } from "./dataloader";
import { DataParser, Target } from "./dataparser";
import type { InputTool } from "./enums";
import { Heap } from "./heap";

/**
 * The DataParser implements the machine learning based transliterator.
 */
export class MLDecoder {

  /**
   * The machine learning training data parser.
   * The data loader starts to load the model data at the creation of this
   * parser.
   */  
  #parser: DataParser

  /** The sub-translit cache. */
  private _subTranslitCache:Record<string, Heap> = {};

  /** The pre-translit cache. */
  private _preTranslitCache:Record<string, Heap> = {};

  /** The maximun size of each heap in cache. */
  private _pruneNum = 2;

  /** Maximum length of source word that MLDecoder accepts. */
  static MAX_SOURCE_LENGTH = 20;

  /** Default number of candidates to return. */
  static DEFAULT_RESULTS_NUM = 50;

  /** Factor to punish multi-segments matches. */
  // static MULTI_SEGMENT_FACTOR = -0.7;  
  static MULTI_SEGMENT_FACTOR = -0.3;

  constructor(private inputTool: InputTool, private _dataLoader: DataLoader) {
    this.#parser = new DataParser(this.inputTool, this._dataLoader);
  }

  /**
   * Transliterate the given source word, computing the target word candidates
   * with scores.
   */
  transliterate(
    /** The list of token list. */tokens: string[][],
    /** The expected number of target word candidates */resultsNum: number,
    /** The tokens are all initials. */isAllInitials?:boolean) {
    if (tokens.length > MLDecoder.MAX_SOURCE_LENGTH) {
      return [];
    }

    if (resultsNum < 0) {
      resultsNum = MLDecoder.DEFAULT_RESULTS_NUM;
    }

    /**
     * Generates the original transliterations for the source text, it matches
     * the all text.
     */
    let transliterations = this.#generateTransliterations(
      tokens, isAllInitials);
    /**
     * Generates the prefix matched target words.
     */
    let prefixCandidates = this.#generatePrefixTransliterations(
      tokens, resultsNum, isAllInitials);
    /**
     * Return The original transliterations according to soundex rules, target
     * word length and dictionary.
     */
    return this.#rankTransliterations(
      tokens, resultsNum, transliterations, prefixCandidates);
  }

  /**
   * Generates transliterations for tokens with associated scores.
   * @ERR 
   * @todo 
   */
  #generateTransliterations(tokens:string[][], isAllInitials?: boolean) {
    // debugLog('generateTransliterations.start');
    let subTranslit = this._subTranslitCache[this.#getKey(tokens)];
    if (subTranslit) {
      return subTranslit;
    }

    let transliterations = new Heap();
    let sentence = this.#parser.getTargetMappings(tokens, isAllInitials);
    // debugLog('generateTransliterations.sentence', tokens, sentence);
    this.#updateScoresForTargets(sentence, transliterations);
    // debugLog('updateScoresForTargets after transliterations', transliterations.getKeys(), transliterations.getValues());

    if (transliterations.size > 0) {
      // Cache the results.
      this._subTranslitCache[this.#getKey(tokens)] = transliterations;
    
      return transliterations;
    }

    // Try out transliterations for all possible ways of breaking the word into
    // a prefix + suffix word. The prefix is looked up for in known Prefix or
    // Segment mappings. The function is called recursively for the suffix, but we
    // do memoization to ensure O(n^2) time.
    let len = tokens.length;
    for (let i = len - 1; i > 0; i--) {
    // for (let i = 1; i < len; i++) {
      
      let sourcePrefix = tokens.slice(0, i);
      let sourceSuffix = tokens.slice(i);

      let targetPrefixScores = new Heap();
      let targetSuffixScores = new Heap();

      let targetSuffixes = this.#parser.getTargetMappings(
          sourceSuffix, isAllInitials);
      // debugLog('generateTransliterations.iterator', i, sourcePrefix, sourceSuffix, targetSuffixes)
      // Update the targetPrefixScores for all words in targetPrefixes. Also
      // multiply each score by the probability of this source prefix segment
      // actually being a prefix.
      this.#updateScoresForTargets(targetSuffixes, targetSuffixScores);
      // debugLog('generateTransliterations.iterator.targetSuffixScores', i, targetSuffixScores.getKeys(), targetSuffixScores.getValues())

      if (targetSuffixScores.size == 0) {
        continue;
      }

      // If the transliterations for source_word have already been found, then
      // simply return them.
      if (this._subTranslitCache[this.#getKey(sourcePrefix)]) {
        targetPrefixScores = this._subTranslitCache[this.#getKey(sourcePrefix)];
      } else {
        targetPrefixScores = this.#generateTransliterations(sourcePrefix);
      }
      // debugLog('generateTransliterations.iterator.targetSuffixScores-1', i, targetSuffixScores.getKeys(), targetSuffixScores.getValues())


      // Combines sourceSegment and suffixSegment.
      let prefixValues = targetPrefixScores.getValues();
      let prefixKeys = targetPrefixScores.getKeys();
      // debugLog('generateTransliterations.iterator.prefixScores', i, prefixValues, prefixKeys);
      let suffixValues = targetSuffixScores.getValues();
      let suffixKeys = targetSuffixScores.getKeys();
      // debugLog('generateTransliterations.iterator.suffixScores', i, suffixValues, suffixKeys);
      for (let j = 0; j < prefixKeys.length; ++j) {
        let prefixScore = Number(prefixKeys[j]);
        let prefixSegment = prefixValues[j];
        for (let k = 0; k < suffixKeys.length; ++k) {
          let suffixScore = Number(suffixKeys[k]);
          let suffixSegment = suffixValues[k];
          let targetWord = prefixSegment + suffixSegment;
          let score = (prefixScore * MLDecoder.MULTI_SEGMENT_FACTOR) + suffixScore;
          // let score = prefixScore + suffixScore + MLDecoder.MULTI_SEGMENT_FACTOR;

          // debugLog('targetWord and score', i, j, k, targetWord, score);
          transliterations.increase(score, targetWord);
          if (transliterations.size > this._pruneNum) {
            transliterations.remove();
          }
        }
      }
    }
    // Cache the results.
    this._subTranslitCache[this.#getKey(tokens)] = transliterations;
    // debugLog('generaterTransliteration.end', transliterations, transliterations.getKeys(), transliterations.getValues())
    return transliterations;
  }

  /**
   * Generates the prefix matched target words.
   */
  #generatePrefixTransliterations(
    tokens: string[][],
    resultsNum: number,
    isAllInitials?: boolean ) {
    if (this._preTranslitCache[this.#getKey(tokens)]) {
      return this._preTranslitCache[this.#getKey(tokens)]
    }

    let candidates = new Heap();
    let length = tokens.length;
    for (let i = 1; i <= length; i++) {
      let sourcePrefix = tokens.slice(0, i);
      if (this._preTranslitCache[this.#getKey(sourcePrefix)]) {
        candidates.clear();
        candidates.insertAll(this._preTranslitCache[this.#getKey(sourcePrefix)]);
      } else {
        let targetPrefixes = this.#parser.getTargetMappings(
            sourcePrefix, isAllInitials);
        for (let j = 0; j < targetPrefixes.length; ++j) {
          let targetPrefix = targetPrefixes[j];
          let candidate = new Candidate(
              sourcePrefix.length, 
              targetPrefix.segment, 
              targetPrefix.prob,
              j
              );
          candidates.insert(candidate.score, candidate);
        }
        if (candidates.size > resultsNum) {
          candidates.remove();
        }
        this._preTranslitCache[this.#getKey(sourcePrefix)] = candidates;
      }
    }
    return candidates;      
  }

  /**
   * Updates the map of scores for target language segments. If the target segment
   * has more than one character, we boost its score.
   */
  #updateScoresForTargets(
    targetWords: Target[], scores: Heap) {

    for (let i = 0; i < targetWords.length; ++i) {
      let targetSegment = targetWords[i].segment;
      let targetScore = targetWords[i].prob;
      scores.increase(targetScore, targetSegment);
      if (scores.size > 1) {
        scores.remove();
      }
    }

  }

  /**
   * Ranks the generated transliterations.
   */
  #rankTransliterations(
    tokens: string[][],
    resultsNum: number, 
    transliterations: Heap, 
    prefixTransliterations: Heap) {
    let candidates = [];
    // Dont' remove transliterations, since they are in cache and will be used in
    // the future.
    let translits = transliterations.clone();
    let prefixCandidates = prefixTransliterations.clone();
    while (translits.size > 1 && prefixCandidates.size > 0) {
      let candidate;
      if (translits.peekKey() < prefixCandidates.peekKey()) {
        let score = Number(translits.peekKey());
        let target = translits.remove().toString();
        candidate = new Candidate(
            tokens.length, target, score, 0);
      } else {
        candidate = prefixCandidates.remove();
      }
      candidates.unshift(candidate);
    }

    while (prefixCandidates.size > 0) {
      candidates.unshift(prefixCandidates.remove());
    }

    while (translits.size > 0) {
      let score = Number(translits.peekKey());
      let target = translits.remove().toString();
      let candidate = new Candidate(
          tokens.length, target, score, 0);
      candidates.unshift(candidate);
    }
    return candidates;
  }

  /**
   * Clear the cache.
   */
  clear() {
    for (let key in this._subTranslitCache) {
      this._subTranslitCache[key].clear();
    }
    this._subTranslitCache = {};
  
    for (let key in this._preTranslitCache) {
      this._preTranslitCache[key].clear();
    }
    this._preTranslitCache = {};
  }

  /**
   * Gets the key for a list of token lists in the cache.
   */
  #getKey = function(tokens: string[][]) {
    let ret = '';
    for (let i = 0; i < tokens.length; ++i) {
      ret += tokens[i][0];
    }
    return ret;
  };
}