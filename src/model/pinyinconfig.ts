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

  configStates: Record<string, any> = {
    ...this.configStates,
    enableVertical: true,
    predictEngine: true
  };

  punctuationReg = /[^a-z0-9 \r]/i;
  editorCharReg = /[a-z\']/;
  pageupCharReg = /[=.]/;
  pagedownCharReg = /[\-,]/;

  [Symbol.toStringTag]() {
    return "PinyinConfig";
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
