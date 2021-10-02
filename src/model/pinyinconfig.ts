/**
 * @fileoverview Defines the pinyin model configs.
 */

import ChineseConfig from "./chineseconfig";

/**
 * The input method config.
 */
export class PinyinConfig extends ChineseConfig {

  punctuationReg = /[^a-z0-9 \r]/i;
  editorCharReg = /[a-z\']/;
  pageupCharReg = /[=.]/;
  pagedownCharReg = /[\-,]/;
}