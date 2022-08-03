/**
 * @fileoverview Defines the pinyin model configs.
 */

import ChineseConfig from "./chineseconfig";
import { PinyinStateID } from "./enums";
import { IPinyinConfigState, IPinyinState } from "./state";

/**
 * The input method config.
 */
export class PinyinConfig extends ChineseConfig implements IPinyinConfigState {

  punctuationReg = /[^a-z0-9 \r]/i;
  editorCharReg = /[a-z\']/;
  pageupCharReg = /[=.]/;
  pagedownCharReg = /[\-,]/;

  [Symbol.toStringTag]() {
    return "PinyinConfig";
  }

  getStates() {
    let states = super.getStates() as IPinyinState;
    states[PinyinStateID.PREDICT_ENGINE] = this[PinyinStateID.PREDICT_ENGINE];
    states[PinyinStateID.VERTICAL] = this[PinyinStateID.VERTICAL];
    return states;
  }

  setStates(states: Partial<IPinyinState>): void {
    Object.keys(states).forEach((stateId) => {
      switch(stateId) {
        case PinyinStateID.PREDICT_ENGINE:
          let predictEngine = states[stateId];
          this[stateId] = predictEngine;
          break;
        case PinyinStateID.VERTICAL:
          let vertical = states[stateId];
          this[stateId] = vertical;
          break;
        default:
      }
    })
  }

  revert(segment: string, source: string) {

    let revertObj = {
      deletedChar: segment,
      segment: '',
      source: source.slice(0, -1)
    }

    if (segment.slice(-1) == "'") {
      revertObj['deletedChar'] = segment.slice(-2);
      revertObj['segment'] = segment.slice(0, -2);
    }
    
    return revertObj;
  }
}
