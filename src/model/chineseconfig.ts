import { Config } from "./config";
import { Modifier, StateID } from "./enums";
import { State } from "./state";


export default class ChineseConfig extends Config {

  states: Record<StateID, State>;

	/** The puncatuation sbc map. */
  puncMap: Record<string, any> = {
    '~': '～',
    '!': '！',
    '@': '＠',
    '#': '＃',
    '$': '￥',
    '^': '……',
    '&': '＆',
    '*': '×',
    '(': '（',
    ')': '）',
    '-': '－',
    '_': '——',
    '[': '【',
    ']': '】',
    '{': '｛',
    '}': '｝',
    '\\': '、',
    ';': '；',
    ':': '：',
    '\'': ['‘’', 0],
    '"': ['“”', 0],
    ',': '，',
    '.': '。',
    '<': '《',
    '>': '》',
    '/': '／',
    '?': '？'
  }


  /** The sbc char map. */
  sbcMap:Record<string, string> = {
    '~': '～',
    '!': '！',
    '@': '＠',
    '#': '＃',
    '$': '＄',
    '^': '＾',
    '&': '＆',
    '*': '＊',
    '(': '（',
    ')': '）',
    '-': '－',
    '_': '＿',
    '[': '［',
    ']': '］',
    '{': '｛',
    '}': '｝',
    '\\': '＼',
    '|': '｜',
    ';': '；',
    ':': '：',
    '\'': '＇',
    '"': '＂',
    ',': '，',
    '.': '．',
    '<': '＜',
    '>': '＞',
    '/': '／',
    '?': '？'
  }

  constructor() {
    super();

    let sbcStr = '０１２３４５６７８９' + 
      'ａｂｃｄｅｆｇｈｉｊｋｌｍｎ' +
      'ｏｐｑｒｓｔｕｖｗｘｙｚ' +
      'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮ' + 
      'ＯＰＱＲＳＴＵＶＷＸＹＺ';
		for (let i = 0; i < sbcStr.length; ++i) {
			let sbc = sbcStr[i];
			if (i < 10) {
				this.sbcMap[String(i)] = sbc;
			} else if (i < 36) {
				// i - 10 + 'a' -> i + 87
				this.sbcMap[String.fromCharCode(i + 87)] = sbc;
			} else {
				// i - 10 + 'a' -> i + 29
				this.sbcMap[String.fromCharCode(i + 29)] = sbc;
			}
		}
		
		let langState = new State( '输入语言为中文', true, [Modifier.SHIFT] );
		let sbcState = new State('字符宽度为全角', false, [' ', Modifier.SHIFT]);
		let puncState = new State('标点符号宽度为全角', true, ['\\.', Modifier.CTRL]);
    let traditionalState = new State('Chinese traditional output.', false, ['t', Modifier.SHIFT]);
    let onlineDecoderState = new State('Enable Online decoder', true, ['d', Modifier.SHIFT]);

    this.states = {
      [StateID.LANG]: langState,
      [StateID.SBC]: sbcState,
      [StateID.PUNC]: puncState,
      [StateID.TRADITIONAL]: traditionalState,
      [StateID.ONLINE_DECODER]: onlineDecoderState
    }
	}

  createState() {
    let state = new State();
  }
	
	/**
	 * @Override
	 * @param {*} ch 
	 */
	preTransform(ch: string) {
		if (!this.states[StateID.LANG] || 
			!this.states[StateID.SBC] || 
			!this.states[StateID.PUNC]) {
        return ;
    }


		if (this.states[StateID.SBC].value) {
			if (!this.states[StateID.LANG].value || !/[a-z]/i.test(ch)) {
				let sbc = this.sbcMap[ch];
				if (sbc) {
					return sbc;
				}	
			}
		}

    if (this.states[StateID.PUNC].value && this.states[StateID.LANG].value) {
      let punc = this.puncMap[ch];
      if (punc) {
        if (Array.isArray(punc)) {
          ch = punc[0].charAt(punc[1]);
          punc[1] ^= 1;
          punc = ch;
        }
        return punc;
      }
    }

		
		return '';
	}

	postTransform(c: string) {
		let preTrans = this.preTransform(c);
		return preTrans ? preTrans : c;
	}

}