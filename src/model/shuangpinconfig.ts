import {PinyinConfig} from "./pinyinconfig";

export class ShuangpinConfig extends PinyinConfig {

  #solutions: Record<string, {
    bootKey: string, 
    initial: Record<string, string>, 
    vowel: Record<string, string| string[]>
  }> = {
    pinyinjiajia: {
      bootKey: 'o',
      initial: {
        i: 'sh',
        u: 'ch',
        v: 'zh'
      },
      vowel: {
        o: 'uo',
        v: 'ui',
        q: ['er', 'ing'],
        w: 'ei',
        r: 'en',
        t: 'eng',
        y: ['iong', 'ong'],
        p: 'ou',
        s: 'ai',
        d: 'ao',
        f: 'an',
        g: 'ang',
        h: ['iang', 'uang'],
        j: 'ian',
        k: 'iao',
        l: 'in',
        z: 'un',
        x: ['uai', 'ue'],
        c: 'uan',
        b: ['ia', 'ua'],
        n: 'iu',
        m: 'ie'
      }
    }
  }
  
  solution = 'pinyinjiajia';

  constructor() {
    super()
  }

  transform(context: string, c: string) {
    let trans = this.#solutions[this.solution];
    if (!trans) {
      return c;
    }

    if (trans)
    return c;
  }

  postTransform(c: string) {
    return c;
  }

  transformView(text: string) {
    return text;
  }

  preTransform(c: string) {
    return c;
  }

  

}