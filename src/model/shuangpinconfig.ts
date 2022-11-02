import { ShuangpinStateID } from "./enums";
import {PinyinConfig} from "./pinyinconfig";
import { IShuangpinConfigState, IShuangpinState, IChineseState } from "./state";

export class ShuangpinConfig extends PinyinConfig implements IShuangpinConfigState {

  configStates: Record<string, any> = {
    ...this.configStates,
    shuangpinSolution: true
  }

  initialReg = /^(zh|ch|sh|b|p|m|f|d|t|n|l|k|g|h|j|q|x|r|z|c|s|y|w|a|e|o)/;

  editorCharReg = /[a-z;]/;

  initialCharList = 'iuv'.split('');

  shuangpinSolution = "pinyinjiajia_o";

  constructor() {
    super();
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