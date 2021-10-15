import { Config } from "./config";
import { Modifier, StateID } from "./enums";
import { State } from "./state";


export default class ChineseConfig extends Config {

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
		
		let langState = new State();
		langState.desc = '输入语言为中文';
		langState.value = true;
		langState.shortcut = [' ', Modifier.ALT];

		let sbcState = new State();
		sbcState.desc = '字符宽度为全角';
		sbcState.value = false;
		sbcState.shortcut = [' ', Modifier.SHIFT];

		let puncState = new State();
		puncState.desc = '标点符号宽度为全角';
		puncState.value = true;
		puncState.shortcut = ['\\.', Modifier.CTRL];

		this.states[StateID.LANG] = langState;
		this.states[StateID.SBC] = sbcState;
		this.states[StateID.PUNC] = puncState;	
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
          console.log(punc)
          console.log(ch)
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