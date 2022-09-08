import type { InputTool } from "./enums";
import { Heap } from "./heap";


type ISourceType = string;
type ITargetType = string;
type UsedNumber = number;

export class UserDecoder {
  /** The latest input entries. */
  _latestMap: Record<ISourceType, Record<ITargetType, UsedNumber>> = {};

  /** The latest map size. */
  _latestMapSize = 0;

  /** The parmant input entries. */
  _permantMap:Record<string, Record<string, number>> = {};

    
  constructor() {
    this.#init();
  }

  static MAX_PERMANT_SIZE = 1500;
  static MAX_LATEST_SIZE = 300;
  static LATEST_FACTOR = 5;


  #init() {
    chrome.storage.sync.get(this.storageKey,(res) => {
      if (Reflect.has(res, this.storageKey)) {
        this._permantMap = res[this.storageKey];
      }
    })


    this.#autoTriggerPersist();
  }

  /** trigger once a minute.  */
  #autoTriggerPersist() {
    setInterval(() => { this.persist() }, 1000 * 60);
  }

  /**
   * Gets the storage key for the user dictionary.
   * 
   * @return {string}
   * 
   */
  get storageKey() {
    return 'user_dictionary';
  }

  add(source: string, target: string) {
    
    if (Reflect.has(this._latestMap, source) && Reflect.has(this._latestMap[source], target)) {
      this._latestMap[source][target]++;
    } else {
      this._latestMap[source] = {
        [target]: 1
      };
      this._latestMapSize++;
    }

    if (this._latestMapSize > UserDecoder.MAX_LATEST_SIZE) {
      this.#updatePermantMap();
    }
  }

  /**
   * Gets a candidate from the user decoder according to a given source.
   * @return {string} The most frequently used target word. 
   */
  getCandidate(source: string) {
    let latestTargets = this._latestMap[source] ?? {};
    let permantTargets = this._permantMap[source] ?? {};


    let bestCandidate = '';
    let bestScore = 0;

    for (let key in latestTargets) {
      let score = UserDecoder.LATEST_FACTOR * latestTargets[key];
      if (permantTargets[key]) {
        score += permantTargets[key];
      }
      if (score > bestScore) {
        bestCandidate = key;
        bestScore = score;
      }
    }

    for (let key in permantTargets) {
      let score = permantTargets[key];
      if (latestTargets[key]) {
        score += UserDecoder.LATEST_FACTOR * latestTargets[key];
      }
      if (score > bestScore) {
        bestCandidate = key;
        bestScore = score;
      }
    }

    return bestCandidate;
  }

  /**
   * Saves the user dictionary to the local storage or chrome.storage.
   */
  persist() {
  
    this.#updatePermantMap();
    chrome.storage.sync.set({
      [this.storageKey]: this._permantMap
    });
  }

  #updatePermantMap() {
    for (let source in this._latestMap) {
      let targets = this._latestMap[source];
      if (Reflect.has(this._permantMap, source)) {
        let permants = this._permantMap[source];
        for (let target in targets) {
          permants[target] = Reflect.has(permants, target) 
            ? permants[target] + targets[target]
            : targets[target];
          }
      } else {
        this._permantMap[source] = {...targets};
      }
    }

    let heap = new Heap();
    for (let source in this._permantMap) {
      let permants = this._permantMap[source];
      for (let permant in permants) {
        heap.insert(permants[permant], 0);
        if (heap.size > UserDecoder.MAX_PERMANT_SIZE) {
          heap.remove();
        }
      }
    }

    if (heap.size < UserDecoder.MAX_PERMANT_SIZE) {
      heap.clear();
      return;
    }

    let threshold = Number(heap.peekKey());
    heap.clear();

    for (let source in this._permantMap) {
      let permants = this._permantMap[source];
      for (let permant in permants) {
        if (permants[permant] < threshold) {
          delete permants[permant];
        }
      }
      if (!Object.keys(permants).length) {
        delete this._permantMap[source];
      }
    }

    this._latestMap = {};
    this._latestMapSize = 0;
  }
}