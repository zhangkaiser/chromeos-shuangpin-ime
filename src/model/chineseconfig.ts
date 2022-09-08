import { Config } from "./config";
import { Modifier, StateID } from "./enums";
import { IChineseState, State } from "./state";
import { Translator } from "./translator";


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
		
		let langState = new State( '启用中文输入', true, [Modifier.SHIFT] );
		let sbcState = new State('启用全角宽度字符', false, [' ', Modifier.SHIFT]);
		let puncState = new State('不启用英文标点符号', true, ['\\.', Modifier.CTRL]);
    let traditionalState = new State('启用中文繁体.', false, ['t', Modifier.ALT]);
    let predictorState = new State("启用在线预测词", true, ['p', Modifier.ALT]);

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

  tranformCommit(text: string) {
    return Translator.transform(text);
  }

  getStates() {
    let states = super.getStates() as IChineseState;
    Object.keys(this.states).forEach((stateId) => {
      states[stateId as StateID] = this.states[stateId as StateID].value;
    })
    return states;
  }
  
  setStates(states: Partial<IChineseState>) {
    if (!states) return ;
    Object.keys(states).forEach((state) => {
      if (!(state in this.states)) return ;
      this.states[state as StateID].value = (states as any)[state];
      this.#stateSwitchedAction(state as StateID);
    });
    super.setStates(states);
  }

  #stateSwitchedAction(state: StateID) {
    
    switch(state) {
      case StateID.PREDICTOR:
        Translator.enableTraditional(this.states[state].value);
        break;
    }
  }

  transformView(text: string, source: string) {
    return text.replace(/' /g, "'");
  }
}