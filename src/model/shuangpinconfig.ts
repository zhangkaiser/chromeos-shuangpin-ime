import { ShuangpinStateID } from "./enums";
import {PinyinConfig} from "./pinyinconfig";

export class ShuangpinConfig extends PinyinConfig {

  initialReg = /^(zh|ch|sh|b|p|m|f|d|t|n|l|k|g|h|j|q|x|r|z|c|s|y|w|a|e|o)/;

  initialCharList = 'iuv'.split('');

  constructor() {
    super();

    this.states.editorCharReg = ["[a-z;]", "i"];
    
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