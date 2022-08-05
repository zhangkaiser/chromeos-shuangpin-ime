import { ShuangpinStateID } from "./enums";
import {PinyinConfig} from "./pinyinconfig";
import { IShuangpinConfigState, IShuangpinState, IChineseState } from "./state";

export class ShuangpinConfig extends PinyinConfig implements IShuangpinConfigState {

  initialReg = /^(zh|ch|sh|b|p|m|f|d|t|n|l|k|g|h|j|q|x|r|z|c|s|y|w|a|e|o)/;

  editorCharReg = /[a-z;]/;

  initialCharList = 'iuv'.split('');

  shuangpinSolution = "pinyinjiajia_o";

  constructor() {
    super();
  }
  
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

  getStates() {
    let states = super.getStates() as IShuangpinState;

    states[ShuangpinStateID.SOLUTION] = this[ShuangpinStateID.SOLUTION];
    return states;
  }


  setStates(states: Partial<IShuangpinState>): void {
    Object.keys(states).forEach((stateId) => {
      switch(stateId) {
        case ShuangpinStateID.SOLUTION:
          let state = states[stateId];
          if (state) {
            this[stateId] = state;
          }
          break;
        default:
      }
    });
    super.setStates(states);
  }

  [Symbol.toStringTag]() {
    return 'ShuangpinConfig';
  }
}