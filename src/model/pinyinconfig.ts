/**
 * @fileoverview Defines the pinyin model configs.
 */

import ChineseConfig from "./chineseconfig";

/**
 * The input method config.
 */
export class PinyinConfig extends ChineseConfig {

  constructor() {
    super();
    this.states.editorCharReg = ["[a-z']", ""];
    this.states.pageupCharReg = ["[=.]", ""];
    this.states.pagedownCharReg = ["[-,]", ""];
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

  [Symbol.toStringTag]() {
    return "PinyinConfig";
  }
}
