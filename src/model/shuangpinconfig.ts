import { debugLog } from "../utils/debug";
import { solutions } from "../utils/double-solutions";
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

  bootIsFirst = false;
  solution = 'pinyinjiajia';

  setSolution(value: string) {
    this.solution = value;
    let trans = this.#solutions[value];
    this.initialCharList = Object.keys(trans.initial);
  }

  transform(context: string, c: string, segmentsLastItem: string) {
    let trans = this.#solutions[this.solution];
    
    if (!segmentsLastItem) {
      segmentsLastItem = "";
    }

    if (!trans) {
      return c;
    }
    if (!context) {
      if (this.initialCharList.indexOf(c) > -1) {
        return trans['initial'][c];
      }
      if (c === trans['bootKey']) {
        this.bootIsFirst = true;
        return '\'';
      }
    }

    /** 
     * transform to vowel.
     */
    let hasSplitChar = segmentsLastItem.slice(-1) === '\'';
    let segmentIsInitial = this.initialTokens.indexOf(segmentsLastItem) > -1
    if (this.bootIsFirst 
        || hasSplitChar
        || segmentIsInitial) {
      debugLog('hasSplitChar, segmentIsInitial',hasSplitChar, segmentIsInitial, context, c, segmentsLastItem);
      let isFirstBootMode = this.bootIsFirst;
      this.bootIsFirst = false;

      if (c === trans['bootKey']){
        
        if (hasSplitChar || isFirstBootMode) {
          return c;
        }
        if (segmentIsInitial && this.tokensRegexp.test(segmentsLastItem + c)) {
          return c;
        }
      }

      let vowel = trans['vowel'][c];
      if (vowel && Array.isArray(vowel)) {
        vowel = vowel.filter(
          (item) => {
            let segment = segmentsLastItem
            if (hasSplitChar) {
              segment = '';
            }
            return this.tokensRegexp.test(segment + item)
          }
        )[0];

        debugLog('vowel,hasSplitChar', vowel, hasSplitChar);
        if (vowel && hasSplitChar && !this.tokensRegexp.test(vowel)) {
          return vowel + '\'';
        } else if (vowel) {
          return vowel;
        }
      }

      if (vowel && this.tokensRegexp.test(vowel)) {
        if (hasSplitChar  && !this.tokensRegexp.test(segmentsLastItem.slice(0, -1))) {
          return vowel + '\'';
        }

        return vowel;
      }

      if (vowel && segmentIsInitial && this.tokensRegexp.test(segmentsLastItem + vowel)) {
        return vowel;
      }
    }

    /** transform to initial. */
    let isToken = this.tokensRegexp.test(segmentsLastItem)
    if (isToken && this.initialCharList.indexOf(c) > -1) {
      return trans['initial'][c];
    }

    if (isToken && c === trans['bootKey']) {
      return '\'';
    }

    let isSubToken = isToken && [segmentsLastItem, segmentsLastItem.slice(-2)].filter((item) => this.tokensRegexp.test(item + c))
    if (isSubToken) {
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
}