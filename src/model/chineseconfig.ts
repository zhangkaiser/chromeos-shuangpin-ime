import { Config } from "./config";
import { Modifier, StateID } from "./enums";
import { IIMEState, State } from "./state";
import { Translator } from "./translator";


export default class ChineseConfig extends Config {

  menuStates: Record<StateID, State>;

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
		
		let langState = new State('启用中文输入', [Modifier.SHIFT] );
		let sbcState = new State('启用全角宽度字符', [';', Modifier.CTRL]);
		let puncState = new State('启用英文标点符号', ['\\.', Modifier.CTRL]);
    let traditionalState = new State('启用中文繁体', [',', Modifier.CTRL]);

    this.menuStates = {
      [StateID.LANG]: langState,
      [StateID.SBC]: sbcState,
      [StateID.PUNC]: puncState,
      [StateID.TRADITIONAL]: traditionalState,
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

		if (this.states.sbc) {
			if (!this.states.lang || !/[a-z]/i.test(ch)) {
				let sbc = this.sbcMap[ch];
				if (sbc) {
					return sbc;
				}	
			}
		}

    if (this.states.punc && this.states.lang) {
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
  
  setStates(states: Partial<IIMEState>) {
    super.setStates(states);
    if (!states) return ;

    if ("traditional" in states) {
      Translator.enableTraditional(!!states['traditional']);
    }

  }

  transformView(text: string, source: string) {
    return text.replace(/' /g, "'");
  }
}