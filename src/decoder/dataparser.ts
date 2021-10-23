import { binarySearch, compare3 } from "../utils/binarySearch";
import { debugLog } from "../utils/debug";
import type { DataLoader } from "./dataloader";
import  type { InputTool } from "./enums";
/**
 * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
 * values as unsigned integers.
 *
 */
export class Long {

  readonly _low;
  readonly _high;
  /**
   * @param {number} low  The low 32 bits of the long.
   * @param {number} high  The high 32 bits of the long.
   */
  constructor (low: number, high: number) {
    
    /** force into 32 signed bits.  */
    this._low = low | 0;
    this._high = high | 0;

  }
  
  static readonly _TWO_PWR_32_DBL = (1 << 16) * (1 << 16);


  /**
   * Returns a Long representing the given (32-bit) integer value.
   */
  static fromInt(value: number) {
    let long = new Long(value, 0);
    return long;
  }


  /**
   * Returns the bitwise-OR of this Long and the given one.
   */
  or(other: Long) {
    return new Long(
      this._low | other._low,
      this._high | other._high);
  }


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   */
  shiftLeft(numBits:number) {
    numBits &= 63;
    if (numBits != 0) {
      let low = this._low;
      let ret:Long
      if (numBits < 32) {
        let high = this._high;
        let x = high << numBits;
        let y = low >>> (32 - numBits);
        ret = new Long(low << numBits, x + y);
      } else {
        ret = new Long(0, low << (numBits - 32));
      }
      return ret;

    }
    return this;
  }


  /** Return The closest floating-point representation to this value. */
  toNumber() {
    return this._high * Long._TWO_PWR_32_DBL + this.getLowBitsUnsigned();
  }


  /** Return The low 32-bits as an unsigned value. */
  getLowBitsUnsigned() {
    return (this._low >= 0) ?
      this._low : Long._TWO_PWR_32_DBL + this._low;
  }
}


/**
 * The target element parsed from model data.
 */
export class Target {
  constructor(
    /** The target segment. */public segment:string, 
    /** The target score. */public prob:number
  ) {}
}


/**
 * The parser to parse the model data. It is used to find all the target
 * segments and their corresponding scores for a given source segment.
 */
export class DataParser {

  /**
   * The default score. If the target score is undefined, sets it the default
   * score.
   */
  private _defaultProb = 1;

  /** The maxium length to find all possible token sequeses. */
  private _maxTokenSize = 300;
  
  constructor(private inputTool: InputTool, public dataLoader: DataLoader) {
  }



  /**
   * Since in the training data, the probability is stored as that times the
   * default probability, normalizes it.
   * @return the normalized probability.
   */
  normalizeProb(prob: number | null) {
    return prob ? (prob / this._defaultProb) : 1;
  }

  /**
   * Gets the position of the encoded source word in the source word array.
   */
  protected getSourcePos(/** The source tokens. */source: string[]) {
    let sourceIndex = this.encodeUnicodeString(source);
    return binarySearch(
      this.dataLoader.sourceSegments,
      this.compareFn,
      sourceIndex
    );
  }


  /** 
   * Given the source word, gets the range of the corresponding target words in
   * the target word array.
   * !TODO
   */
  getTargetPos(source:string[]) {
    let targetPos: {start: number, end: number};
    let sourcePos = this.getSourcePos(source);
    if (sourcePos < 0) {
      /** ERR */
      targetPos = {
        start: 0,
        end: -1
      }
    } else {
      let currentOffset = this.dataLoader.targetPositions[sourcePos];
      let nextOffset = sourcePos < this.dataLoader.targetPositions.length - 1
        ? this.dataLoader.targetPositions[sourcePos + 1] 
        : this.dataLoader.targetSegments.length;
      
      targetPos = {start: currentOffset , end: nextOffset};
    }

    return targetPos;
  }

  /** Gets the target mapping from a source word. */
  getTargetMappings(tokens: string[][], opt_isAllInitials?: boolean): Target[] {
    let sources = this.getTokenSequences(tokens, opt_isAllInitials);
    
    // debugLog('getTargetMappings.sources', sources);
    let targetMappings: Target[] = [];

    for (let j = 0; j < sources.length; ++j) {
      let source = sources[j];
      let {targetSegments, targetProbs} = this.dataLoader;
      let targetPos = this.getTargetPos(source);
      // debugLog('getTargetMappins.targetPos', targetPos, source);
      let {start, end} = targetPos;
      for (let i = start; i < end; i++) {
        let segment = this.decodeUnicodeString(targetSegments[i]);
        let prob = targetProbs[i];
        let targetMapping = new Target(segment, this.normalizeProb(prob));
        targetMappings.push(targetMapping);
      }

      if (opt_isAllInitials && j == 0 && targetPos.start < targetPos.end) {
        break;
      }
    }

    return targetMappings;
  }

  /**
   * Encode a string to a number or a list of numbers.
   */
  encodeUnicodeString(tokens: string[]) {
    let map = this.dataLoader.sourceMap;

    let bufferArray = [];
    let buffer = Long.fromInt(0);
    let sign = Long.fromInt(1);
    let currentSize = 0;

    let len = tokens.length;
    for (var i = 0; i < len; i++) {
      let token = tokens[i];
      if (!Reflect.has(map, token)) {
        return 0;
      }
      
      let encBit = Long.fromInt(Number(map[token][0]));
      let encLength = Number(map[token][1]);

      if (currentSize + encLength >= 63) {
        let encNumber = buffer.or(sign.shiftLeft(currentSize));
        bufferArray.unshift(encNumber.toNumber());
        buffer = encBit;
        currentSize = encLength;
      } else {
        buffer = buffer.or(encBit.shiftLeft(currentSize));
        currentSize += encLength;
      }
    }

    if (currentSize > 0) {
      let encNumber = buffer.or(sign.shiftLeft(currentSize));
      bufferArray.unshift(encNumber.toNumber());
    }

    return bufferArray.length == 1 ? bufferArray[0] : bufferArray;
  }

  /**
   * Decode a number or a list of numbers to a string.
   */
  decodeUnicodeString(num: number | number[]) {
    let map = this.dataLoader.targetMap;
    if (Array.isArray(num)) {
      let str = '';
      for (let i = 0; i < num.length; i++) {
        let substr = this.decodeUnicodeString(i);
        str = substr + str;
      }
      return str;
    }

    let str = '';
    let pos: any = map;
    while (num != 1) {
      let bit:number = num % 2;
      num = (num - bit) / 2;
      pos = pos[bit];

      if (!Array.isArray(pos)) {
        // Got the value
        str = str + pos;
        pos = map;
      }
    }
    return str;
  }

  /**
   * Gets the list of token sequece for all possible token combinations according
   * to a list of tokens.
   */
  getTokenSequences(tokens: string[][], opt_isAllInitials?: boolean) {
    let size = 1;
    let path = [];
    for (let i = 0; i < tokens.length; ++i) {
      size *= tokens[i].length;
      path.push(tokens[i][0])
    }

    if (size == 1 || size > this._maxTokenSize) {
      return [path];
    }
    
    let ret = [[]];
    for (let i = 0; i < tokens.length; i++) {
      let length = ret.length;
      for (var j = 0; j < length; j++) {
        let prefix = ret.shift();
        for (let k = tokens[i].length > 1 ? 1 : 0; k < tokens[i].length; k++) {
          ret.push(prefix!.concat((tokens as any)[i][k]));
        }
      }
    }
    return opt_isAllInitials ? [path].concat(ret) : ret;
  }

  compareFn(a: any, b: any) {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length == b.length) {
        return compare3(a, b);
      }
      return a.length - b.length;
    }
    if (Array.isArray(a)) {
      return 1;
    }
    if (Array.isArray(b)) {
      return -1;
    }

    return a - b;
  }
}