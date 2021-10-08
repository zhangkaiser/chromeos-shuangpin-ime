import {PinyinConfig} from "./pinyinconfig";


const pinyinjiajia = {
  o: ['', 'uo'],
  u: 'ch',
  i: 'sh',
  v: ['zh', 'ui'],
  q: ['er', 'ing'],
  w: 'ei',
  r: 'en',
  t: 'eng',
  y: ['iong','ong'],
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

console.log(pinyinjiajia)

export class ShuangpinConfig extends PinyinConfig {
  
  transform(context: string, c: string) {
    console.log(context);
    if (c == 'p') {
      
    }
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