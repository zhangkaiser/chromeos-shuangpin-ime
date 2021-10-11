import type { InputTool } from "./enums";
import {Heap} from "./heap";

export default class UserDecoder {
  /** The latest input entries. */
  _latestMap: Record<string, Record<string, number>> = {};

  /** The latest map size. */
  _latestMapSize = 0;

  /** The parmant input entries. */
  _permantMap:Record<string, Record<string, number>> = {};

    
  constructor(private inputTool:InputTool) {
    this.#init();
  }

  static MAX_PERMANT_SIZE = 1500;
  static MAX_LATEST_SIZE = 300;
  static LATEST_FACTOR = 5;


  #init() {
    if (chrome.storage) {
        chrome.storage.local.get(this.#getKey(),(res) => {
          let permantMap = res[this.#getKey()];
          if (permantMap) {
            this._permantMap = permantMap;
          }
        });
    }
  }

  add(source: string, target: string) {
    if (!this._latestMap[source]) {
        this._latestMap[source] = {};
        this._latestMap[source][target] = 1;
        this._latestMapSize++;
    } else {
        if (this._latestMap[source][target]) {
            this._latestMap[source][target]++
        } else {
            this._latestMap[source][target] = 1;
            this._latestMapSize++;
        }
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
    let latestTargets =this._latestMap[source];
    let permantTargets = this._permantMap[source];

    if (!latestTargets) {
        latestTargets = {};
    }

    if (!permantTargets) {
        permantTargets = {};
    }

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
   if (chrome.storage) {
      this.#updatePermantMap();
      chrome.storage.local.set({
        [this.#getKey()]: this._permantMap
      })
    }
  }

  /**
   * Gets the local storage key for the user dictionary.
   * 
   * @return {string}
   * 
   */
  #getKey() {
    return this.inputTool + '_user_dictionary';
  }


  #updatePermantMap() {
    for (let key in this._latestMap) {
        let targetItems = this._latestMap[key];
        if (this._permantMap[key]) {
            let permantItems = this._permantMap[key];
            for (let targetKey in targetItems) {
                if (permantItems[targetKey]) {
                    permantItems[targetKey] += targetItems[targetKey];
                } else {
                    permantItems[targetKey] = targetItems[targetKey];
                }
            }
        } else {
            this._permantMap[key] = {...targetItems};
        }
    }
    
    let heap = new Heap();
    for (let key in this._permantMap) {
        let targetItems = this._permantMap[key];
        for (let targetKey in targetItems) {
            heap.insert(targetItems[targetKey], 0);
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
    for (let key in this._permantMap) {
        let targetItems = this._permantMap[key];
        for (let targetKey in targetItems) {
            if (targetItems[targetKey] < threshold) {
                delete targetItems[targetKey];
            }
        }
        if (!Object.keys(targetItems).length) {
            delete this._permantMap[key];
        }
    }

    this._latestMap = {};
    this._latestMapSize = 0;
  }
}