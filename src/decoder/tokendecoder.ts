import { InputToolCode } from "../model/enums";
import { binarySearch, defaultCompare } from "../utils/binarySearch";
import { SolutionDataType } from "../utils/double-solutions";
import { DataLoader } from "./dataloader";
import type { IShuangpinModel } from "../model/customShuangpin";
import { getShuangpinSolution } from "src/model/shuangpinSolutions";

/**
 * The lattice node contains the index of each start end of all in-edges, and
 * the minimum number of initials in paths to this node.
 */
export class LatticeNode {
  
  /**
   * The minimum initial numbers from paths to this node.
   */
  initNum = 0;

  /**
   * The start ends for all in-edges.
   */
  edges:number[] = [];
}


/**
 * The token path generated from token decoders. It contains the infomation for
 * tokens and separators.
 */
export class TokenPath {
  constructor(
    /** The token list. */ public tokens:string[],
    /** 
     * A list of booleans to show whether the corresponding token ends with
     * separators. */ public separators: boolean[]) {}
}

export class TokenBase extends EventTarget {
  
}

/**
 * The token decoder can generates different token paths for an input text, it
 * also selects the best one from them.
 */
export class TokenDecoder extends EventTarget {
  
  /** The invalid tokens in pinyin input method. */
  private _invalidChars = 'iuv';
  
  /** The token regular expression. */
  private _tokenReg = /xyz/g;

  /** The fuzzy expansion pairs. */
  private _fuzzyMap: Record<string, string[]> = {};

  /**
   * The initial character map, it maps an initial character to all possible
   * normalized tokens.
   */
  private _initialMap: Record<string, string[]> = {};

  /**
   * The current source string, without separators.
   */
  private _currentStr = '';

  private _separators: number[] = [];
  /** The separator character. */
  private _separatorChar = '\'';

  /** The lattice nodes. */
  private _lattice:LatticeNode[] = [];

  /** The shuangpin solution. */
  private _solution?: IShuangpinModel;

  #cache = new Map<string, string>();

  /**
   * The init number given to invalid path, to make sure it is larger than any
   * valid path.
   */
  static readonly _INVALID_PATH_INIT_NUM = 100;
  constructor(
    private _dataLoader: DataLoader,
    solution?: string[] | string
  ) {
      super();

      this.#init(solution);

  }
  
  /**
   * Initialize the token decoder
   * @TODO
   */
  #init(solution?: string[] | string) {
    let { initialTokens, chosTokens: tokens } = this._dataLoader;
    // 这里可以设置分割用户输入字符的识别算法
    this._tokenReg = new RegExp(`^(${tokens}|${initialTokens})$`);

    let initials = initialTokens.split('|');

    for (let i = 0; i < initials.length; i++) {
      this._initialMap[initials[i]] = [];
    }

    let tokenVector = tokens.split('|');
    for (let i = 0; i < tokenVector.length; i++) {
      let token = tokenVector[i];
      for (let j = 1; j <= 2; ++j) {
        let prefix = token.slice(0, j);
        if (this._initialMap[prefix] && token.length > 1) {
          this._initialMap[prefix].push(token);
        }
      }
    }

    if (solution && Array.isArray(solution)) {
      this.updateFuzzyPairs(solution);
    } else if (solution && this._dataLoader.shuangpinStatus) {
      this.updateShuangpinSolution(getShuangpinSolution(solution));
    }
      
    this.clear();
  }

  static #INVALID_PATH_INIT_NUM = 100;

  #yinjie: string[] = [];
  #yinjieKey: string[] = [];
  #yinjieInitials: string[] = [];

  #shengmu: string[] = [];
  #shengmuKey: string[] = [];

  #yunmuEntries: [string, string][] = [];

  updateShuangpinSolution(solution: IShuangpinModel) {
    
    this.#yinjie = Object.keys(solution.yinjie);
    this.#yinjieKey = Object.values(solution.yinjie);
    this.#yinjieInitials = this.#yinjieKey.map((item) => item[0]);


    this.#shengmu = Object.keys(solution.shengmu);
    this.#shengmuKey = Object.values(solution.shengmu);

    this.#yunmuEntries = Object.entries(solution.yunmu);
  }

  /**
   * Updates fuzzy-pinyin expansion paris. For each fuzzy-pinyin expansion
   *  pairs.the syllables are separated by '_', such as 'z_zh'.
   * 
   * @param {Array.<string>} fuzzyPairs The fuzzy expansions.
   */
  updateFuzzyPairs(fuzzyPairs: string[]) {
    this._fuzzyMap = {} as any;
    for (let i = 0; i < fuzzyPairs.length; ++i) {
    let fuzzyPair = fuzzyPairs[i];
    let syllables = fuzzyPair.split('_');
      // The length of syllables should be 2.
      for (let j = 0; j < 2; ++j) {
        if (!this._fuzzyMap[syllables[j]]) {
          this._fuzzyMap[syllables[j]] = [];
        }
        (this._fuzzyMap[syllables[j]] as any).push(syllables[1 - j]);
      }
    }
  }

  /**
   * Whether the tokens are all initials.
   * @return {boolean} True, if all these tokens are initials.
   * 
   */
  isAllInitials(tokens: string[]) {
    for (let i = 0; i < tokens.length; ++i) {
      if (!this._initialMap[tokens[i]]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets all possible normalized tokens for a token list.
   * @return {Array.<Array.<string>>} The all possible tokens, including the 
   *  original tokens, initial expansions and fuzzy expansions.
   */
  getNormalizedTokens(tokens: string[]) {
    let res = [];
    for (let i = 0; i < tokens.length; ++i) {
      res.push(this.getNormalizedToken(tokens[i]));
    }
    return res;
  }

  /**
   * Gets all potential matched tokens for one token.
   * 
   * @Param {string} token The original token, which may be an initial.
   * @return {Array.<string>} The potential tokens, including the original ones,
   *  initial expansions and fuzzy expansions.
   */
  getNormalizedToken(token: string) {
    let segments = [token];
    if (this._initialMap[token]) {
      // it is an initial character.
      segments = segments.concat(...this._initialMap[token]);

    }

    if (this._fuzzyMap) {
      for (let syllable in this._fuzzyMap as object) {
        if (token.match(syllable)) {
          if (segments.length == 1) {
            segments.push(token);
          }
        }

        let replacers = this._fuzzyMap[syllable];
        for (let i = 0; i < replacers.length; ++i) {
          segments.push(token.replace(syllable, replacers[i]));
        }
      }
    }
    return segments
  }

  /**
   * Gets all possible token paths.
   * @return {Array.<TokenPath>} The list of token path.
   */
  getTokens(source: string): TokenPath[] {
    let originalStr = this.#getOriginalStr();
    if (source.indexOf(originalStr) == 0) {
      // Appends chars.
      this.#append(source.slice(originalStr.length));
    }

    let range = this.#getRange(source);
    if (range) {
      // source is a substring of the current string.
      let paths = this.#getPaths(range.start, range.end);
      let tokenLists = [];
      for (let i = 0; i < paths.length; ++i) {
        let path = paths[i];
        let tokenList = [];
        let separatorList = [];
        let index = range.start;
        for (let j = 0; j < path.length; ++j) {
          tokenList.push(this._currentStr.slice(index, path[j]));
          separatorList.push(this._separators.indexOf(path[j]) >= 0)
          index = path[j];
        }
        tokenLists.push(new TokenPath(tokenList, separatorList));
      }
      if (tokenLists.length == 0) {
        // There is no fully matched one.
        return this.getTokens(source.slice(0, -1));
      }
      return tokenLists;
    }

    // If the current string does not contain the source, it means text
    //  has be modified, the clears the all decoder.
    this.dispatchEvent(new CustomEvent('clear'))
    return this.getTokens(source);
  }

  /**
   * Gets the best token path.
   * @param {string} source  The source text.
   * @return {TokenPath} THe best token path.
   */
  getBestTokens(source: string) {
    let tokenLists = this.getTokens(source);

    if (tokenLists.length == 0) {
      return null;
    }

    if (tokenLists.length == 1) {
      return tokenLists[0];
    }

    let tokenNum = tokenLists.reduce((previourValue, currentValue) => {
      return Math.min(previourValue, currentValue.tokens.length);
    }, Infinity);

    tokenLists = tokenLists.filter((tokenList) => {
      return tokenList.tokens.length <= tokenNum;
    })

    if (tokenLists.length == 1) {
      return tokenLists[0];
    }

    let vowel = /[aeiou]/;
    let vowelNums:number[] = [];
    let vowelStartNum = tokenLists.reduce((previourValue, currentValue, currentIndex) => {
      let vowelNum = (currentValue.tokens).reduce((previourValue1, currentValue1) => {
        return currentValue1.slice(0, 1).match(vowel) ? previourValue1 + 1 : previourValue1;
      }, 0);

      vowelNums[currentIndex] = vowelNum;
      return Math.min(previourValue, vowelNum);
    }, Infinity);

    let index = vowelNums.indexOf(vowelStartNum);
    return tokenLists[index];
  }
  
  /**
   * Gets the original token list.
   * @return {Array.<string>} The tokens with separators.
   */
  getOriginalTokens(tokenPath: TokenPath) {
    let separators = tokenPath.separators;
    let tokens = [...tokenPath.tokens];
    for (let i = 0; i < tokens.length; ++i) {
      if (separators[i]) {
        tokens[i] += this._separatorChar;
      }
    }

    return tokens;
  }
  
  /**
   * Clears the lattice and current string.
   */
  clear() {
    this._currentStr = '';
    this._separators = [];
    this._lattice = [];
    this._lattice[0] = new LatticeNode();
    this._lattice[0].initNum = 0;
    this.#cache = new Map();
  }

  /**
   * Appends string after the current string.
   * @param {string} source The source string.
   * @private
   */
  #append(source: string) {
    for (let i = 0; i < source.length; ++i) {
      let ch = source.slice(i, i + 1);
      let lastIndex = this._currentStr.length;
      if (ch == this._separatorChar) {
          this._separators.push(lastIndex);
          continue;
      }
      this._currentStr = this._currentStr + ch;
      lastIndex++;

      let suffixes = this.#getSuffixTokens(this._currentStr);
      let initNums:number[] = [];

      let initNum = suffixes.reduce((minInitNum, suffix, index) => {
        
        if (!this.#inSameRange(lastIndex - suffix.length, lastIndex)) {
          initNums[index] = Infinity;
          return minInitNum;
        }
        let preInitNum = this._lattice[lastIndex - suffix.length]?.initNum;
        
        initNums[index] = this._initialMap[suffix] 
          ? preInitNum + 1 : preInitNum;

        if (this._invalidChars.indexOf(suffix) >= 0) {
          initNums[index] += TokenDecoder.#INVALID_PATH_INIT_NUM;
        }

        return Math.min(minInitNum, initNums[index]);
      }, Infinity)

      if (initNum == Infinity) {
        // No available suffix
        continue;
      }

      this._lattice[lastIndex] = new LatticeNode();
      this._lattice[lastIndex].initNum = initNum;
      this._lattice[lastIndex].edges = [];
      for (let j = 0; j < suffixes.length; ++j) {
        let suffix = suffixes[j];
        if (initNums[j] > initNum) {
          continue;
        }
        this._lattice[lastIndex].edges.push(lastIndex - suffix.length);
      }
    }
  }

  /**
   * Gets all paths from a start node, and ends before the give end node.
   * @return {Array.<Array.<number>} THe list of paths, for each path, it is an
   *  array cintains all nodes in the path from the start to the end.
   */
  #getPathsFrom(start: number, end: number) {
    let paths = [];
    for (let i = start + 1; i <= end; ++i) {
      let edges = this._lattice[i].edges;
      for (let j = 0; j < edges.length; ++j) {
        if (edges[j] == start) {
          paths.push([i]);
          let forwardPaths:number[][] = [...this.#getPathsFrom(i, end)];
          for (let k = 0; k < forwardPaths.length; ++k) {
            paths.push([i].concat(forwardPaths[k]));
          }
          break;
        }
      }
    }
    return paths;
  }
  /**
   * Gets all paths from aa start node to an end node.
   * @param {number} start The start postion.
   * @param {number} end The end position.
   * @return {Array.<Array.<number>>} The list of paths.
   */
  #getPaths(start: number, end: number) {
    if (!this._lattice[end] || !this._lattice[end].edges) {
      return [];
    }

    let paths = [];
    let edges = this._lattice[end].edges;
    for (let j = 0; j < edges.length; ++j) {
      if (edges[j] < start) {
        continue;
      }

      if (edges[j] == start) {
        paths.push([end]);
      } else {
        let forwardPaths:number[][] = [...this.#getPaths(start, edges[j])]
        for (let k = 0; k < forwardPaths.length; ++k) {
            forwardPaths[k].push(end);
            paths.push(forwardPaths[k]);
        }
      }
    }

    return paths;
  }

  /**
   * Gets the source string with separators.
   * @return {string} The original string with separators.
   * @private
   */
  #getOriginalStr() {
    let res = '';
    let index = 0;
    for (let i = 0; i < this._separators.length; ++i) {
      let subStr = this._currentStr.slice(index, this._separators[i])
      res += subStr + this._separatorChar;
      index = this._separators[i];
    }
    res += this._currentStr.slice(index);
    return res;
  }

  /**
   * Gets the range of the current string for an input string.
   * @return {Object.<string, number>}
   */
  #getRange(source: string) {
    let originalStr = this.#getOriginalStr();
    let start = originalStr.indexOf(source);
    if (start < 0) {
      return null;
    }

    let end = start + source.length;
    let separatorNumBeforeStart = 
      originalStr.slice(0, start).split(this._separatorChar).length - 1;
    let separatorNumBeforeEnd = 
      originalStr.slice(0, end).split(this._separatorChar).length - 1;

    let range = {
      start: (start - separatorNumBeforeStart),
      end: (end - separatorNumBeforeEnd)
    };
    return range;
  }

  /**
   * Whether the start and end node are in not separatored by separators.
   * @return {boolean} Whether they are in the same range separated by separatrs.
   */
  #inSameRange(start:number, end: number) {
    let startPos = binarySearch(
      this._separators, defaultCompare, start)
    let endPos = binarySearch(
      this._separators, defaultCompare, end);

    if (startPos == endPos) {
      return true;
    }

    if (startPos >= 0 && startPos + endPos == -2) {
      return true;
    }

    if (endPos >= 0 && startPos + endPos == -1) {
      return true;
    }

    if (startPos >= 0 && endPos >= 0 && endPos == startPos + 1) {
      return true;
    }

    return false;
  }


  /**
   * Gets all the suffix tokens.
   * 
   * @param {string} source The source.
   * @return {Array.<string>} The suffix tokens.
   * @private
   */
  #getSuffixTokens(source: string) {
    let res = [];
    for (let i = 1; i <= 6 && i <= source.length; ++i) {
      let suffix = this._currentStr.slice(-i);
      if (suffix.match(this._tokenReg)) {
        res.push(suffix);
      }
    }

    if (res.length == 0) {
      res.push(source.slice(-1));
    }
    return res;
  }

  getShuangpinTokens(source: string) {
    let tokenList = source.split("'");
    let lastToken  = tokenList.pop();
    let separatorList = new Array(tokenList.length).fill(true);
    
    if (lastToken && lastToken.length == 1) { // sheng mu parse.
      let shengmuIndex = this.#shengmuKey.indexOf(lastToken);
      if(shengmuIndex > -1) { // found in the shengmu list.
        tokenList.push(this.#shengmu[shengmuIndex]);
        separatorList.push(false);
      } else {
        tokenList.push(lastToken);
        separatorList.push(false);
      }
    } else if (lastToken) { // yin jie parse.
      let firstCh = lastToken[0];
      let lastCh = lastToken.slice(-1);
      if (this.#yinjieInitials.indexOf(firstCh) > -1) {
        // found in the yinjie initial list.
        let yinjieIndex = this.#yinjieKey.indexOf(lastToken);
        if (yinjieIndex > -1) {
          tokenList.push(this.#yinjie[yinjieIndex]);
          separatorList.push(true);
        } else {
          tokenList.push(lastToken);
          separatorList.push(false);
        }

      } else {
        let shengmu = lastToken.slice(0, -1);

        let yunmuList = this.#yunmuEntries.filter(entry => lastCh == entry[1]);
        if (yunmuList.length > 0) {
          let spellingList: string[] = [];
          yunmuList.forEach(entry => spellingList.push(shengmu + entry[0]));
          spellingList = spellingList.filter(spelling => this._tokenReg.test(spelling));
          
          if (spellingList.length == 1) {
            tokenList.push(spellingList[0]);
            separatorList.push(true);
          }
        } else {
          tokenList.push(lastToken);
          separatorList.push(false);
        }
      }
      
    } else {
      // TODO
    }
    
    return new TokenPath(tokenList, separatorList);
  }

}
