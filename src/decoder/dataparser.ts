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
    console.log(this.inputTool);
  }



  /**
   * Since in the training data, the probability is stored as that times the
   * default probability, normalizes it.
   * @return the normalized probability.
   */
  normalizeProb(prob: number) {
    return prob ? (prob / this._defaultProb) : 1;
  }

  /**
   * Gets the position of the encoded source word in the source word array.
   */
  protected async getSourcePos(/** The source tokens. */source: string[]) {
    let sourceIndex = this.encodeUnicodeString(source);
    return await this.dataLoader.targetPositionsSource(sourceIndex);
  }


  /** 
   * Given the source word, gets the range of the corresponding target words in
   * the target word array.
   * !TODO
   */
  async getTargetPos(source:string[]) {
    let targetPos: {start: number, end: number};
    let sourcePos = await this.getSourcePos(source);
    if (!sourcePos) {
      // 这里需要修改,应该是存在在数据库中,就无法使用索引来获取数据
      targetPos = {
        start: 0,
        end: -1
      }
    } else {
      let currentOffset = sourcePos['position'];
      let nextOffset = (sourcePos['index'] - 1) < ((await this.dataLoader.targetPositionsCount()) - 1)
        ? (await this.dataLoader.targetPositions(sourcePos['index'] + 1))!['position']
        : (await this.dataLoader.targetSegmentsCount());
      
      targetPos = {start: currentOffset , end: nextOffset};
    }

    return targetPos;

  }

  /** Gets the target mapping from a source word. */
  // @important !TODO 双拼应该从此处 opt_isAllInitials 入手
  async getTargetMappings(tokens: string[][], opt_isAllInitials?: boolean): Promise<Target[]> {
    let sources = await this.getTokenSequences(tokens, opt_isAllInitials);
    let targetMappings: Target[] = [];
    // error!!

    for (let j = 0; j < sources.length; ++j) {
      let source = sources[j];
      let targetPos = await this.getTargetPos(source);
      if (targetPos.start < targetPos.end) {
        let range = IDBKeyRange.bound(targetPos.start, targetPos.end, false, true);
        let targetSegments = await this.dataLoader.targetSegementsCursor(range);
        
        let segmentsPromise = Promise.all(targetSegments.map((targetSegment) => 
          this.decodeUnicodeString(targetSegment['segment'])));
        let segments = await segmentsPromise;
        segments.forEach((segment, index) => {
          let targetMapping = new Target(segment, this.normalizeProb(targetSegments[index]['prob']))
          targetMappings.push(targetMapping)
        })
      }
      

      // for (let i = targetPos.start; i < targetPos.end; i++) {
      //   let targetSegment = await this.dataLoader.targetSegments(i + 1);
      //   let segment = await this.decodeUnicodeString(targetSegment['segment']);
      //   let prob = targetSegment['prob'];
      //   let targetMapping = new Target(segment, this.normalizeProb(prob));
      //   targetMappings.push(targetMapping)
      // }

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
  async decodeUnicodeString(num: number | number[]) {
    
    if (Array.isArray(num)) {
      let str = '';
      for (let i = 0; i < num.length; i++) {
        let substr = await this.decodeUnicodeString(i);
        str = substr + str;
      }
      return str;
    }

    let str = '';
    let indexStr = ''
    while (num != 1) {
      let bit:number = num % 2;
      num = (num - bit) / 2;
      indexStr = `${indexStr}${bit}`
      let targetMap
      if(indexStr.length > 6) {
        targetMap = await this.dataLoader.targetMap(indexStr)
      }

      if (targetMap) {
        // Got the value
        str = str + targetMap;
        indexStr = '';
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
}