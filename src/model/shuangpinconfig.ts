import { solutions } from "../utils/double-solutions";
import { hans2Hant } from "../utils/transform";
import {PinyinConfig} from "./pinyinconfig";

export class ShuangpinConfig extends PinyinConfig {

  tokens:any = 
    'chuang|shuang|zhuang|'
    + 'zhang|zhong|chuan|zheng|chuai|'
    + 'huang|niang|qiong|qiang|sheng|'
    + 'chong|liang|cheng|chang|shuan|'
    + 'shuai|shang|xiong|jiang|kuang|'
    + 'zhuai|guang|zhuan|xiang|jiong|'
    + 'gong|hang|ling|lang|teng|ping|'
    + 'guai|long|geng|tang|feng|pang|'
    + 'quan|wang|ruan|peng|fang|pian|'
    + 'piao|gang|fiao|tuan|luan|tong|'
    + 'ting|kang|tiao|tian|huai|sang|'
    + 'juan|leng|seng|jing|qiao|shai|'
    + 'jiao|jian|shan|shao|shei|shen|'
    + 'huan|guan|lian|shou|hong|shua|'
    + 'heng|shui|keng|shun|shuo|song|'
    + 'liao|suan|qian|qing|chao|cang|'
    + 'zhao|zhan|ceng|zhai|niao|chai|'
    + 'chan|zhei|zeng|chen|kuan|chou|'
    + 'kuai|chua|chui|chun|zhua|zuan|'
    + 'nang|zong|zhuo|zhun|zhui|bang|'
    + 'beng|weng|bian|biao|neng|zhou|'
    + 'bing|nian|zhen|chuo|rong|xian|'
    + 'xiao|mang|duan|xing|dong|ding|'
    + 'reng|xuan|diao|dian|kong|deng|'
    + 'meng|yang|ning|cong|zang|rang|'
    + 'cuan|ming|nong|yuan|miao|yong|'
    + 'ying|dang|mian|nuan|qun|pao|qiu|'
    + 'que|qin|pai|zuo|nen|nie|nin|niu|'
    + 'nou|nue|nun|nuo|qie|pan|nei|pei|'
    + 'pen|pie|pin|pou|qia|yue|wan|wei|'
    + 'wen|xia|xie|xin|xiu|xue|xun|yan|'
    + 'yao|yin|you|wai|yun|zai|zan|zao|'
    + 'zei|zen|zha|zhe|zhi|zhu|zou|zui|'
    + 'zun|shu|rao|ren|rou|rui|run|ruo|'
    + 'sai|san|sao|sen|sha|she|shi|ran|'
    + 'sou|sui|sun|suo|tai|tan|tao|tei|'
    + 'tie|tou|tui|tun|tuo|cun|gen|jiu|'
    + 'dao|dan|jue|jun|gei|dai|kai|kan|'
    + 'kao|cuo|jin|kei|ken|gao|cui|kou|'
    + 'dui|cou|kua|kui|kun|gan|gai|hen|'
    + 'gui|gun|guo|gua|die|dia|hai|han|'
    + 'hao|diu|hei|kuo|den|hou|dei|hua|'
    + 'hui|hun|huo|dou|gou|jia|jie|bai|'
    + 'bin|mai|man|mao|bie|fen|ben|bei|'
    + 'bao|ban|mei|men|chu|fei|mie|min|'
    + 'miu|fan|mou|ang|nai|eng|nan|nao|'
    + 'luo|chi|che|lai|lan|lao|dun|lei|'
    + 'cha|lia|lie|lin|duo|cen|fou|lun|'
    + 'lue|cai|lou|can|cao|liu|du|ei|en|'
    + 'xi|wo|ne|wu|er|ai|an|zu|ao|zi|ka|'
    + 'ba|bi|bo|bu|ca|ce|xu|ze|ci|cu|sa|'
    + 'za|yu|da|yo|yi|ye|de|ya|di|ou|nu|'
    + 'mi|me|ke|ru|nv|ri|re|ku|se|la|qu|'
    + 'le|li|qi|pu|po|lu|pi|pa|lv|ma|mo|'
    + 'ju|fa|wa|fo|tu|fu|ni|na|ga|ti|ge|'
    + 'te|gu|ta|su|mu|ha|si|ji|he|hu|o|a';
  
  initialTokens = 'b|p|m|f|d|t|n|l|k|g|h|j|q|x|zh|ch|sh|r|z|c|s|y|w'.split('|');

  #solutions: Record<string, {
    bootKey: string, 
    initial: Record<string, string>, 
    vowel: Record<string, string| string[]>
  }> = solutions
  

  editorCharReg = /[a-z;]/;

  initialCharList = 'iuv'.split('');
  tokensRegexp: RegExp;

  constructor() {
    super();
    this.tokensRegexp = new RegExp(`^(${this.tokens})$`);
  }

  solution = 'pinyinjiajia';

  setSolution(value: string) {
    this.solution = value;
    let trans = this.#solutions[value];
    this.initialCharList = Object.keys(trans.initial);
  }

  transform(/** The model rawStr */context: string, c: string, segmentsLastItem: string = "") {

    let trans = this.#solutions[this.solution];

    if (!trans) {
      return c;
    }

    /** No context  */
    if (!context) {
      if (this.initialCharList.indexOf(c) > -1) {
        return trans['initial'][c];
      }
      if (c === trans['bootKey']) {
        return '\'';
      }
    }

    /** 
     * transform to vowel.
     */
    let isFirstBootMode = context === trans.bootKey;
    let segmentHasSplitChar = segmentsLastItem.slice(-1) === '\'';
    let segmentIsInitial = this.initialTokens.indexOf(segmentsLastItem) > -1;
    let contextLastCharIsBootKey = context.slice(-1) === trans.bootKey;
    let checkVowelIsToken = (v: string) => {
      return this.tokensRegexp.test(v);
    }

    if (isFirstBootMode 
        || segmentHasSplitChar
        || segmentIsInitial) {
      // debugLog('segmentHasSplitChar, segmentIsInitial',segmentHasSplitChar, segmentIsInitial, context, c, segmentsLastItem);
      /** Output when 'c' is equal to boot key */
      if (c === trans['bootKey'] && !segmentIsInitial){
        return c;
      }
      
      /** Transfrom 'c' to vowel. */
      let vowel = trans['vowel'][c];
      if (vowel && Array.isArray(vowel)) {
        vowel = vowel.filter(
          (item) => {
            let segment = segmentsLastItem
            if (segmentHasSplitChar) {
              segment = '';
            }
            return checkVowelIsToken(segment + item);
          }
        )[0];

        if (vowel && segmentHasSplitChar && !checkVowelIsToken(vowel) && !contextLastCharIsBootKey) {
          return vowel + '\'';
          // Prevent the decoder from changing result. 
        } else if (vowel && !contextLastCharIsBootKey) {
          return vowel;
        }
      }

      if (vowel && checkVowelIsToken(vowel) && contextLastCharIsBootKey) {
        
        if (segmentHasSplitChar && !checkVowelIsToken(segmentsLastItem.slice(0, -1))) {
          return vowel + '\'';
        }

        return vowel;
      }

      if (vowel && segmentIsInitial && checkVowelIsToken(segmentsLastItem + vowel)) {
        return vowel;
      }
    }

    /** transform to initial. */
    let isToken = checkVowelIsToken(segmentsLastItem)
     || checkVowelIsToken(segmentsLastItem.slice(0,-1))
    if (isToken && this.initialCharList.indexOf(c) > -1) {
      return trans['initial'][c];
    }

    if (isToken && c === trans['bootKey']) {
      return '\'';
    }

    let isSubToken = isToken && 
      [segmentsLastItem, segmentsLastItem.slice(-2)]
        .filter((item) => checkVowelIsToken(item + c));
    if (isSubToken && !segmentHasSplitChar) {
      return '\'' + c;
    }

    return c;
  }

  getTransform(c: string) {
    let trans = this.#solutions[this.solution]
    if (c === trans['bootKey']) {
      let vowel = trans['vowel'][c];
      if (vowel && !Array.isArray(vowel)) {
        return [vowel, c];
      } else {
        return [c];
      }
    }

    if (this.initialCharList.indexOf(c) > -1) {
      let vowel = trans['vowel'][c]
      if (Array.isArray(vowel)) {
        return [c, trans['initial'][c], ...vowel];
      }
      if (vowel) {
        return [c, trans['initial'][c], vowel]
      }
      return [c, trans['initial'][c]];
    }

    let vowel = trans['vowel'][c];
    if (Array.isArray(vowel)) {
      return [...vowel, c];
    }
    return [vowel, c];

  }

  transformView(composing_text: string, rawStr: string) {
    if (composing_text === '\'') {
      composing_text = '~';
    }
    if (composing_text.slice(-1) === '\'' 
      && rawStr.slice(-1) === this.#solutions[this.solution].bootKey) {
      composing_text = `${composing_text.slice(0, -1)} ~`
    }

    if (this.traditional) {
      composing_text = hans2Hant(composing_text)
    }

    composing_text = composing_text.replace(/'/ig, ' ').replace(/(\s)(\s)?/ig, '\'');
    
    return composing_text;
  }
}