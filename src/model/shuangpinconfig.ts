import { debugLog } from "../utils/debug";
import { solutions } from "../utils/double-solutions";
import { hans2Hant } from "../utils/transform";
import {PinyinConfig} from "./pinyinconfig";

export class ShuangpinConfig extends PinyinConfig {

  
  initialReg = /^(zh|ch|sh|b|p|m|f|d|t|n|l|k|g|h|j|q|x|r|z|c|s|y|w|a|e|o)/;

  editorCharReg = /[a-z;]/;

  initialCharList = 'iuv'.split('');

  constructor() {
    super();
  }

  solution = 'pinyinjiajia';

  transform(
    /** The model raw source. */ context: string, 
    /** New char. */ c: string,
    /** @deprecated */ rawSource: string = "") {
    
    return c;
  }

  getTransform(spelling: string) {
    return spelling;
  }

  /** @todo */
  revert(segment: string, source: string) {

    let matchInitial = segment.match(this.initialReg);
    if (segment.slice(-1) === "'" && matchInitial) {
      return {
        deletedChar: segment.slice(matchInitial[0].length),
        segment: matchInitial[0],
        source: source.slice(0, -1)
      }
    } else {
      return {
        deletedChar: segment,
        segment: '',
        source: source.slice(0, -1)
      }
    }
    
  }

  [Symbol.toStringTag]() {
    return 'ShuangpinConfig';
  }
}