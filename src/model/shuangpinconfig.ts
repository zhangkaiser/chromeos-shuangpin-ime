import { debugLog } from "../utils/debug";
import { solutions } from "../utils/double-solutions";
import { hans2Hant } from "../utils/transform";
import {PinyinConfig} from "./pinyinconfig";

export class ShuangpinConfig extends PinyinConfig {

  
  initialTokens = 'b|p|m|f|d|t|n|l|k|g|h|j|q|x|zh|ch|sh|r|z|c|s|y|w'.split('|');

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

  [Symbol.toStringTag]() {
    return 'ShuangpinConfig';
  }
}