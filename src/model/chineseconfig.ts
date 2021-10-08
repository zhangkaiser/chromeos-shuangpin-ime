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
		langState.desc = 'Initial input language is Chinese';
		langState.value = true;
		langState.shortcut = [Modifier.SHIFT];

		let sbcState = new State();
		sbcState.desc = 'Initial character width is Full';
		sbcState.value = false;
		sbcState.shortcut = [' ', Modifier.SHIFT];

		let puncState = new State();
		puncState.desc = 'Initial punctuation width is Full';
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
    console.log('preTransform', ch);
		if (!this.states[StateID.LANG] || 
			!this.states[StateID.SBC] || 
			!this.states[StateID.PUNC]) {
			let punc = this.puncMap[ch];
			if (punc) {
				if (punc.length > 1) {
					ch = punc[0].charAt(punc[1]);
					punc[1] ^= 1;
					punc = ch;
				}
				return punc;
			}
		}

		if (this.states[StateID.SBC].value) {
			if (!this.states[StateID.LANG].value || !/[a-z]/i.test(ch)) {
				let sbc = this.sbcMap[ch];
				if (sbc) {
					return sbc;
				}	
			}
		}
		
		return '';
	}

	postTransform(c: string) {
    console.log('postTransform', c);
		let preTrans = this.preTransform(c);
		return preTrans ? preTrans : c;
	}

}