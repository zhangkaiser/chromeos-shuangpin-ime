import { Config } from "./config";
import { Modifier, StateID } from "./enums";
import { State } from "./state";



const IMEState = {
  lang: true,
  punc: true,
  sbc: false,
  enableVertical: false,
  enableTraditional: false,
  shuangpinSolution: 'pinyinjiajia_o',
  enableOnline: true,
  onlineEngine: 0,
  enablePredictor: true
}

const IMEStateKeys = Object.keys(IMEState);

export type IIMEState = typeof IMEState;
export type IIMEStateKey = keyof IIMEState;

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
    let traditionalState = new State('Chinese traditional output.', false, ['t', Modifier.ALT]);
    let predictorState = new State("Enable predictor", true, ['p', Modifier.ALT]);

    this.states = {
      [StateID.LANG]: langState,
      [StateID.SBC]: sbcState,
      [StateID.PUNC]: puncState,
      [StateID.TRADITIONAL]: traditionalState,
      [StateID.PREDICTOR]: predictorState
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

  getStates() {
    IMEStateKeys.forEach((name) => {
      switch(name) {
        case StateID.LANG:
        case StateID.PUNC:
        case StateID.SBC:
        case StateID.TRADITIONAL:
        case StateID.PREDICTOR:
          (IMEState as any)[name] = this.states[name].value;
          break;
        default:
          (IMEState as any)[name] = (this as any)[name];
      }
    });

    return IMEState;
  }
  
  setStates(states: Partial<IIMEState>) {
    if (!states) return ;
    let entries = Object.entries(states);
    for (const [key, value] of entries) {
      switch(key) {
        case StateID.LANG:
        case StateID.PUNC:
        case StateID.SBC:
        case StateID.TRADITIONAL:
        case StateID.PREDICTOR:
          this.states[key].value = value as boolean;
          break;
        default:
          (this as any)[key] = value;
      }
    }
  }
}