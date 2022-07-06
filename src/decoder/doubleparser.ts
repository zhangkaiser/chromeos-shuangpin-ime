
/**
 * 双拼解析器模型.
 * 从百度输入法得到的灵感
 */

export class DoubleParser {
  
  /** 声母列表 */
  static SHENGMU = 'b|p|m|f|d|t|n|l|k|g|h|j|q|x|zh|ch|sh|r|z|c|s|y|w';
  
  /** 韵母列表(非全韵母) */
  static YUNMU = 'ai|an|ang|ao|ei|en|eng|er|ia|ian|iang|iao|ie|in|ing|iong|iu|ong|ou|ua|uai|uan|uang|ue|ui|un|uo|v|ve';

  /** Yinjie */
  static YINJIE = 'a|ai|an|ang|ao|e|ei|en|eng|er|o|ou'

  constructor() {}

}